import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Song } from "../types/music";

interface YouTubePlayerProps {
  audioUrl?: string;
  title?: string;
  fallbackArtwork?: string;
  songs?: Song[];
  activeSongId?: string;
  isPlaying?: boolean;
  onSongSelect?: (song: Song) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  audioUrl,
  title = "MoodMelo music player",
  fallbackArtwork,
  songs = [],
  activeSongId,
  isPlaying = false,
  onSongSelect,
  onPrev,
  onNext,
  onReady,
  onPlay,
  onPause,
  onEnded,
  className = "",
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const activeSong = useMemo(
    () => songs.find((song) => song.id === activeSongId) ?? songs[0] ?? null,
    [activeSongId, songs]
  );

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    audio.volume = volume;

    if (isPlaying) {
      audio.play().catch(() => {
        // Browsers block autoplay until user interaction, so we ignore the promise.
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audioUrl) {
      setCurrentTime(0);
      setDuration(0);
      setIsReady(false);
      return;
    }

    setCurrentTime(0);
    setDuration(0);
    setIsReady(false);
    audio.pause();
    audio.load();
  }, [audioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !audioUrl) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      onPlay?.();
      return;
    }

    audio.pause();
    onPause?.();
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
    setCurrentTime(nextTime);
  };

  const handleSongPick = (song: Song) => {
    onSongSelect?.(song);
    setIsPlaylistOpen(false);
  };

  if (!audioUrl) {
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
    <div className={`custom-player-shell ${className}`} aria-label="Audio music player">
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

      <div className="custom-player">
        <audio
          ref={audioRef}
          preload="metadata"
          title={title}
          onCanPlay={() => {
            setIsReady(true);
            onReady?.();
          }}
          onPlay={onPlay}
          onPause={onPause}
          onTimeUpdate={(event) => {
            const audioElement = event.currentTarget;
            setCurrentTime(audioElement.currentTime);
            setDuration(audioElement.duration || 0);
          }}
          onLoadedMetadata={(event) => {
            const audioElement = event.currentTarget;
            setDuration(audioElement.duration || 0);
          }}
          onEnded={() => {
            setCurrentTime(0);
            onEnded?.();
          }}
          src={audioUrl}
        >
          <source src={audioUrl} type="audio/mpeg" />
        </audio>

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

        <div className="custom-player__timeline">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || currentTime)}
            onChange={handleSeek}
            aria-label="Track progress"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
