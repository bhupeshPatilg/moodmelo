import type { RefObject } from "react";

interface YouTubePlaybackHostProps {
  hostRef: RefObject<HTMLDivElement | null>;
}

export default function YouTubePlaybackHost({ hostRef }: YouTubePlaybackHostProps) {
  return <div ref={hostRef} className="youtube-player-host" aria-hidden="true" />;
}
