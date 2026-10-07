import { useCallback, useEffect, useRef, useState } from "react";

interface YouTubeControllerOptions {
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onAutoplayBlocked?: () => void;
  onError?: () => void;
}

export interface YouTubeControllerState {
  isReady: boolean;
  currentTime: number;
  duration: number;
  playbackState: "unstarted" | "playing" | "paused" | "buffering" | "ended" | "error";
  isMuted: boolean;
}

export interface YouTubeControllerApi {
  hostRef: React.RefObject<HTMLDivElement | null>;
  state: YouTubeControllerState;
  play(): void;
  pause(): void;
  stop(): void;
  seekTo(seconds: number): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
}

declare global {
  namespace YT {
    interface PlayerEvent {
      data: number;
      target: Player;
    }

    interface PlayerOptions {
      width?: number;
      height?: number;
      videoId?: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (event: PlayerEvent) => void;
        onStateChange: (event: PlayerEvent) => void;
        onError: (event: PlayerEvent) => void;
      };
    }

    class Player {
      constructor(element: HTMLElement | string, options: PlayerOptions);
      getIframe(): HTMLIFrameElement;
      getCurrentTime(): number;
      getDuration(): number;
      getPlayerState(): number;
      loadVideoById(videoId: string): void;
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      setVolume(volume: number): void;
      mute(): void;
      unMute(): void;
      destroy(): void;
    }

    const PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  }

  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
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

    let script = document.getElementById("youtube-iframe-api") as HTMLScriptElement | null;
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

export function useYouTubeController(
  videoId: string | undefined,
  autoplayRequested: boolean,
  options: YouTubeControllerOptions = {}
): YouTubeControllerApi {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const pendingVideoIdRef = useRef<string | undefined>(videoId);
  const autoplayRequestedRef = useRef(autoplayRequested);
  const callbacksRef = useRef(options);
  const [state, setState] = useState<YouTubeControllerState>({
    isReady: false,
    currentTime: 0,
    duration: 0,
    playbackState: "unstarted",
    isMuted: false,
  });

  callbacksRef.current = options;
  autoplayRequestedRef.current = autoplayRequested;
  pendingVideoIdRef.current = videoId;

  const resetProgress = useCallback(() => {
    setState((current) => ({
      ...current,
      currentTime: 0,
      duration: 0,
      playbackState: "unstarted",
    }));
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.stopVideo();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const boundedSeconds = Math.max(0, seconds);
    player.seekTo(boundedSeconds, true);
    setState((current) => ({ ...current, currentTime: boundedSeconds }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const boundedVolume = Math.max(0, Math.min(100, volume));
    player.setVolume(boundedVolume);
    setState((current) => ({
      ...current,
      isMuted: boundedVolume === 0,
    }));
  }, []);

  const mute = useCallback(() => {
    playerRef.current?.mute();
    setState((current) => ({ ...current, isMuted: true }));
  }, []);

  const unMute = useCallback(() => {
    playerRef.current?.unMute();
    setState((current) => ({ ...current, isMuted: false }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!hostRef.current) {
      return;
    }

    void loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || playerRef.current || !hostRef.current) {
          return;
        }

        const player = new window.YT!.Player(hostRef.current, {
          width: 1,
          height: 1,
          videoId: pendingVideoIdRef.current,
          playerVars: {
            autoplay: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              const iframe = event.target.getIframe();
              iframe.setAttribute("aria-hidden", "true");
              iframe.style.display = "none";
              playerRef.current = event.target;
              setState((current) => ({
                ...current,
                isReady: true,
                playbackState: "unstarted",
              }));

              const pendingVideoId = pendingVideoIdRef.current;
              if (pendingVideoId) {
                event.target.loadVideoById(pendingVideoId);
              }

              callbacksRef.current.onReady?.();
              if (autoplayRequestedRef.current && pendingVideoId) {
                event.target.playVideo();
              }
            },
            onStateChange: (event) => {
              const playerState = event.target.getPlayerState();
              if (playerState === window.YT!.PlayerState.PLAYING) {
                setState((current) => ({
                  ...current,
                  playbackState: "playing",
                }));
                callbacksRef.current.onPlay?.();
              } else if (playerState === window.YT!.PlayerState.PAUSED) {
                setState((current) => ({
                  ...current,
                  playbackState: "paused",
                }));
                callbacksRef.current.onPause?.();
              } else if (playerState === window.YT!.PlayerState.BUFFERING) {
                setState((current) => ({
                  ...current,
                  playbackState: "buffering",
                }));
              } else if (playerState === window.YT!.PlayerState.ENDED) {
                setState((current) => ({
                  ...current,
                  playbackState: "ended",
                }));
                callbacksRef.current.onEnded?.();
              } else if (playerState === window.YT!.PlayerState.CUED) {
                setState((current) => ({
                  ...current,
                  playbackState: "paused",
                }));
              }
            },
            onError: () => {
              setState((current) => ({
                ...current,
                isReady: false,
                playbackState: "error",
              }));
              callbacksRef.current.onError?.();
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            isReady: false,
            playbackState: "error",
          }));
          callbacksRef.current.onError?.();
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current || !videoId) {
      if (!videoId) {
        playerRef.current?.stopVideo();
        resetProgress();
      }
      return;
    }

    if (playerRef.current.getPlayerState() === window.YT!.PlayerState.UNSTARTED) {
      playerRef.current.loadVideoById(videoId);
    } else {
      playerRef.current.loadVideoById(videoId);
    }

    if (autoplayRequested) {
      playerRef.current.playVideo();
    }
  }, [autoplayRequested, resetProgress, videoId]);

  useEffect(() => {
    if (!playerRef.current || state.playbackState !== "playing") {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    const updateProgress = () => {
      const player = playerRef.current;
      if (!player || player.getPlayerState() !== window.YT!.PlayerState.PLAYING) {
        return;
      }

      const nextTime = player.getCurrentTime();
      const nextDuration = player.getDuration();
      setState((current) => ({
        ...current,
        currentTime: Number.isFinite(nextTime) ? nextTime : 0,
        duration: Number.isFinite(nextDuration) ? nextDuration : 0,
      }));
    };

    updateProgress();
    progressIntervalRef.current = window.setInterval(updateProgress, 250);
    return () => {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [state.playbackState]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
      }
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  return {
    hostRef,
    state,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    mute,
    unMute,
  };
}
