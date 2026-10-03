import React from "react";
import type { Song } from "../types/music";

interface SongItemProps {
  song: Song;
  index?: number;
  isActive?: boolean;
  isPlaying?: boolean;
  onSelect: (song: Song) => void;
}

const SongItem: React.FC<SongItemProps> = ({
  song,
  index,
  isActive = false,
  isPlaying = false,
  onSelect,
}) => {
  const thumbnail =
    song.thumbnail ||
    (song.youtubeId
      ? `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`
      : undefined);

  return (
    <button
      type="button"
      className={`song-item ${isActive ? "song-item--active" : ""}`}
      onClick={() => onSelect(song)}
      aria-label={`Play ${song.title}${song.artist ? ` by ${song.artist}` : ""}`}
      aria-pressed={isActive}
    >
      <span className="song-item__index" aria-hidden="true">
        {isActive && isPlaying ? (
          <span className="song-item__equalizer">
            <span />
            <span />
            <span />
          </span>
        ) : (
          index ?? "▶"
        )}
      </span>

      <span className="song-item__thumbnail-wrapper">
        {thumbnail ? (
          <img
            className="song-item__thumbnail"
            src={thumbnail}
            alt=""
            loading="lazy"
          />
        ) : (
          <span className="song-item__thumbnail song-item__thumbnail--empty">
            ♪
          </span>
        )}

        <span className="song-item__play-overlay" aria-hidden="true">
          {isActive && isPlaying ? "Ⅱ" : "▶"}
        </span>
      </span>

      <span className="song-item__details">
        <span className="song-item__title">{song.title}</span>
        {song.artist && (
          <span className="song-item__artist">{song.artist}</span>
        )}
      </span>

      {song.mood && <span className="song-item__mood">{song.mood}</span>}
      {song.duration && (
        <span className="song-item__duration">{song.duration}</span>
      )}

      <span className="song-item__action" aria-hidden="true">
        ⋮
      </span>
    </button>
  );
};

export default SongItem;
