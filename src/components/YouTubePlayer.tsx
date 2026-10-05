import React, { useEffect, useState } from "react";
import type { Song } from "../types/music";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";

interface YouTubePlayerProps {
  videoId?: string;
  title?: string;
  fallbackArtwork?: string;
  songs?: Song[];
  activeSongId?: string;
  autoplayRequested?: boolean;
  isPlaying?: boolean;
  onSongSelect?: (song: Song) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onAutoplayBlocked?: () => void;
  onEnded?: () => void;
  className?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = "MoodMelo music player",
  fallbackArtwork,
  songs = [],
  activeSongId,
  autoplayRequested = false,
  isPlaying = false,
  onSongSelect,
  onPrev,
  onNext,
  onReady,
  onPlay,
  onPause,
  onAutoplayBlocked,
  onEnded,
  className = "",
}) => {
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const activeSong = songs.find((song) => song.id === activeSongId) ?? null;
  const activeVideoId = activeSong?.youtubeId ?? videoId;
  const { player, ready } = useYouTubePlayer(activeVideoId, {
    onReady,
    onEnded,
    onPlay,
    onPause,
    onAutoplayBlocked,
  }, autoplayRequested);

  useEffect(() => {
    if (!player || !ready) {
      return;
    }

    if (isPlaying || autoplayRequested) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [autoplayRequested, isPlaying, player, ready]);

  const togglePlay = () => {
    if (!player || !ready) {
      return;
    }

    if (isPlaying) {
      player.pauseVideo();
      onPause?.();
    } else {
      player.playVideo();
    }
  };

  const handleSongPick = (song: Song) => {
    onSongSelect?.(song);
    setIsPlaylistOpen(false);
  };

  if (!activeVideoId) {
    return (
      <div className={`custom-player-shell ${className}`}>
        <div className="custom-player custom-player--inactive" aria-label="Inactive music player">
          <div className="custom-player__brand">MoodMelo</div>
          <p>Select a song to start listening.</p>
        </div>
      </div>
    );
  }

  const artwork = activeSong?.thumbnail ?? fallbackArtwork;

  return (
    <div className={`custom-player-shell ${className}`} aria-label="YouTube music player">
      {isPlaylistOpen && songs.length > 0 && (
        <div className="playlist-panel playlist-panel--open" aria-label="Recommended songs">
          <div className="playlist-panel__header">Recommended Songs</div>
          <div className="playlist-panel__list">
            {songs.map((song, index) => (
              <button
                key={song.id}
                type="button"
                className={`playlist-row ${activeSongId === song.id ? "playlist-row--active" : ""}`}
                onClick={() => handleSongPick(song)}
              >
                <span className="playlist-row__index">{String(index + 1).padStart(2, "0")}</span>
                <span className="playlist-row__title" title={song.title}>{song.title}</span>
                <span className="playlist-row__artist">{song.artist ?? "MoodMelo"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div id="youtube-player" className="custom-player__video" />

      <div className="custom-player">
        <div className="custom-player__main">
          <div className="custom-player__artwork" aria-hidden="true">
            {artwork ? (
              <img src={artwork} alt="" />
            ) : (
              <span>♪</span>
            )}
          </div>

          <div className="custom-player__meta">
            <div className="custom-player__title" title={activeSong?.title ?? title}>
              {activeSong?.title ?? title}
            </div>
            <div className="custom-player__artist">
              {activeSong?.artist ?? "MoodMelo"}
            </div>
          </div>

          <div className="custom-player__controls" aria-label="Playback controls">
            <button
              type="button"
              className="control-button"
              onClick={onPrev}
              aria-label="Previous track"
            >
              ◀
            </button>
            <button
              type="button"
              className="control-button control-button--primary"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!ready}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              className="control-button"
              onClick={onNext}
              aria-label="Next track"
            >
              ▶▶
            </button>
            <button type="button" className="control-button" aria-label="Volume">
              🔊
            </button>
          </div>

          <button
            type="button"
            className="playlist-toggle"
            aria-label={isPlaylistOpen ? "Close recommended songs" : "Open recommended songs"}
            aria-expanded={isPlaylistOpen}
            onClick={() => setIsPlaylistOpen((open) => !open)}
          >
            {isPlaylistOpen ? "↓" : "↑"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default YouTubePlayer;
