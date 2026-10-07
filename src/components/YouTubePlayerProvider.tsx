import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useYouTubeController, type YouTubeControllerApi } from "../hooks/useYouTubeController";
import YouTubePlaybackHost from "./YouTubePlaybackHost";

interface YouTubePlayerProviderProps {
  videoId?: string;
  autoplayRequested: boolean;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onAutoplayBlocked?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  children: ReactNode;
}

const YouTubePlayerContext = createContext<YouTubeControllerApi | null>(null);

export function useYouTubePlayerContext(): YouTubeControllerApi {
  const controller = useContext(YouTubePlayerContext);
  if (!controller) {
    throw new Error("useYouTubePlayerContext must be used within YouTubePlayerProvider.");
  }
  return controller;
}

export default function YouTubePlayerProvider({
  videoId,
  autoplayRequested,
  onReady,
  onPlay,
  onPause,
  onAutoplayBlocked,
  onEnded,
  onError,
  children,
}: YouTubePlayerProviderProps) {
  const controller = useYouTubeController(videoId, autoplayRequested, {
    onReady,
    onPlay,
    onPause,
    onAutoplayBlocked,
    onEnded,
    onError,
  });

  const value = useMemo(() => controller, [controller]);

  return (
    <YouTubePlayerContext.Provider value={value}>
      <YouTubePlaybackHost hostRef={controller.hostRef} />
      {children}
    </YouTubePlayerContext.Provider>
  );
}
