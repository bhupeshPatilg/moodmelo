import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }

  namespace YT {
    class Player {
      constructor(
        elementId: string,
        options: {
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: any) => void;
            onStateChange?: (event: any) => void;
          };
        }
      );

      loadVideoById(videoId: string): void;
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      setVolume(volume: number): void;
      getVolume(): number;
      getPlayerState(): number;
      destroy(): void;
    }

    const PlayerState: {
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  }
}

export function useYouTubePlayer(
  videoId: string | undefined,
  onEnded: () => void
) {
  const playerRef = useRef<YT.Player | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.getElementById("youtube-iframe-api")) {
      return;
    }

    const script = document.createElement("script");

    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const createPlayer = () => {
      if (!videoId) return;

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId,

        playerVars: {
          playsinline: 1,
          rel: 0,
        },

        events: {
          onReady: () => {
            setReady(true);
          },

          onStateChange: (event: any) => {
            if (
              event.data === window.YT.PlayerState.ENDED
            ) {
              onEnded();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [videoId]);

  return {
    player: playerRef.current,
    ready,
  };
}