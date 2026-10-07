import React, { useState } from "react";
import type { Song } from "../types/music";
import { useYouTubePlayerContext } from "./YouTubePlayerProvider";

interface MoodPlayerProps {
  title?: string;
  fallbackArtwork?: string;
  songs?: Song[];
  activeSongId?: string;
  isPlaying?: boolean;
  onSongSelect?: (song: Song) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

const MoodPlayer: React.FC<MoodPlayerProps> = ({
  title = "MoodMelo music player",
  fallbackArtwork,
  songs = [],
  activeSongId,
  isPlaying = false,
  onSongSelect,
  onPrev,
  onNext,
  onPlay,
  onPause,
  className = "",
}) => {
  const controller = useYouTubePlayerContext();
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true);
  const activeSong = songs.find((song) => song.id === activeSongId) ?? null;
  const playbackState = controller.state.playbackState;
  const isReady = controller.state.isReady;

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  };

  const togglePlay = () => {
    if (!isReady) {
      return;
    }

    if (isPlaying) {
      controller.pause();
      onPause?.();
    } else {
      controller.play();
      onPlay?.();
    }
  };

  const handleSongPick = (song: Song) => {
    onSongSelect?.(song);
    setIsPlaylistOpen(false);
  };

  if (!activeSong) {
    return (
      <div className={`custom-player-shell ${className}`}>
        <div className="custom-player custom-player--inactive" aria-label="Inactive music player">
          <div className="custom-player__brand">MoodMelo</div>
          <p>Select a song to start listening.</p>
        </div>
      </div>
    );
  }

  const artwork = activeSong.thumbnail ?? fallbackArtwork;

  return (
    <div className={`custom-player-shell ${className}`} aria-label="MoodMelo music player">
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

      <div className="player-assembly">
        <div className="custom-player">
          <div className="custom-player__main">
            <div className="custom-player__artwork" aria-hidden="true">
              {artwork ? <img src={artwork} alt="" /> : <span>♪</span>}
            </div>

            <div className="custom-player__meta">
              <div className="custom-player__title" title={activeSong.title}>
                {activeSong.title ?? title}
              </div>
              <div className="custom-player__artist">
                {activeSong.artist ?? "MoodMelo"}
              </div>
            </div>

            <div className="custom-player__controls" aria-label="Playback controls">
              <button type="button" className="control-button" onClick={onPrev} aria-label="Previous track">
                ◀
              </button>
              <button
                type="button"
                className="control-button control-button--primary"
                onClick={togglePlay}
                aria-label={playbackState === "playing" ? "Pause" : "Play"}
                disabled={!isReady}
              >
                {playbackState === "playing" ? "❚❚" : "▶"}
              </button>
              <button type="button" className="control-button" onClick={onNext} aria-label="Next track">
                ▶▶
              </button>
              <button
                type="button"
                className="control-button"
                aria-label={controller.state.isMuted ? "Unmute" : "Mute"}
                onClick={controller.state.isMuted ? controller.unMute : controller.mute}
              >
                {controller.state.isMuted ? "🔇" : "🔊"}
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

          <div className="custom-player__timeline">
            <span>{formatTime(controller.state.currentTime)}</span>
            <input
              type="range"
              min={0}
              max={controller.state.duration || 0}
              step={0.1}
              value={controller.state.duration > 0 ? Math.min(controller.state.currentTime, controller.state.duration) : 0}
              onChange={(event) => controller.seekTo(Number(event.target.value))}
              aria-label="Track progress"
              aria-valuetext={`${formatTime(controller.state.currentTime)} of ${formatTime(controller.state.duration)}`}
              disabled={!isReady || controller.state.duration <= 0}
            />
            <span>{formatTime(controller.state.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodPlayer;
