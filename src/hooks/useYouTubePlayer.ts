import { useEffect, useRef, useState } from "react";

declare global {
  namespace YT {
    interface PlayerEvent {
      data: number;
      target: Player;
    }

    interface PlayerOptions {
      width: number;
      height: number;
      host: string;
      videoId: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (event: PlayerEvent) => void;
        onStateChange: (event: PlayerEvent) => void;
        onAutoplayBlocked: (event: PlayerEvent) => void;
      };
    }

    class Player {
      constructor(element: HTMLElement | string, options: PlayerOptions);
      getIframe(): HTMLIFrameElement;
      loadVideoById(videoId: string): void;
      playVideo(): void;
      pauseVideo(): void;
      destroy(): void;
    }

    const PlayerState: {
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
    };
  }

  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiReadyPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (apiReadyPromise) {
    return apiReadyPromise;
  }

  apiReadyPromise = new Promise<void>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    let script = document.getElementById(
      "youtube-iframe-api"
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        apiReadyPromise = null;
        script?.remove();
        reject(new Error("Unable to load the YouTube IFrame API."));
      };
      document.head.appendChild(script);
    }
  });

  return apiReadyPromise;
}

interface PlayerCallbacks {
  onReady?: () => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onAutoplayBlocked?: () => void;
}

export function useYouTubePlayer(
  videoId: string | undefined,
  callbacks: PlayerCallbacks = {},
  autoplayRequested = false
) {
  const playerRef = useRef<YT.Player | null>(null);
  const callbacksRef = useRef(callbacks);
  const autoplayRequestedRef = useRef(autoplayRequested);
  const [ready, setReady] = useState(false);
  callbacksRef.current = callbacks;
  autoplayRequestedRef.current = autoplayRequested;

  useEffect(() => {
    let cancelled = false;

    if (!videoId) {
      setReady(false);
      playerRef.current?.destroy();
      playerRef.current = null;
      return;
    }

    setReady(false);
    void loadYouTubeIframeApi()
      .then(() => {
        if (cancelled) {
          return;
        }

        if (playerRef.current) {
          playerRef.current.loadVideoById(videoId);
          setReady(true);
          return;
        }

        const element = document.getElementById("youtube-player");
        if (!element) {
          return;
        }

        const bounds = element.getBoundingClientRect();
        const player = new window.YT.Player(element, {
          width: Math.max(200, Math.round(bounds.width)),
          height: Math.max(200, Math.round(bounds.height)),
          host: "https://www.youtube.com",
          videoId,
          playerVars: {
            autoplay: autoplayRequestedRef.current ? 1 : 0,
            enablejsapi: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              const iframe = event.target.getIframe();
              iframe.title = "YouTube video player";
              iframe.style.width = "100%";
              iframe.style.height = "100%";
              setReady(true);
              callbacksRef.current.onReady?.();
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                callbacksRef.current.onPlay?.();
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                callbacksRef.current.onPause?.();
              } else if (event.data === window.YT.PlayerState.ENDED) {
                callbacksRef.current.onEnded?.();
              }
            },
            onAutoplayBlocked: () => {
              callbacksRef.current.onAutoplayBlocked?.();
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) {
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(
    () => () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    },
    []
  );

  return { player: playerRef.current, ready };
}