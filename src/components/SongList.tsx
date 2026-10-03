import type { Song } from "../types/music";

interface Props {
  songs: Song[];
  activeSongId?: string;
  isPlaying?: boolean;
  onSongSelect: (song: Song) => void;
}

export default function SongList({
  songs,
  activeSongId,
  isPlaying = false,
  onSongSelect,
}: Props) {
  return (
    <section className="songs-section">
      <div className="section-header">
        <div>
          <span className="section-label">PLAYLIST</span>
          <h3>Choose a song</h3>
        </div>

        <span className="song-count">{songs.length} songs</span>
      </div>

      <div className="song-list">
        {songs.map((song, index) => {
          const active = activeSongId === song.id;

          return (
            <button
              key={song.id}
              type="button"
              className={`song-row ${active ? "playing" : ""}`}
              onClick={() => onSongSelect(song)}
            >
              <div className="song-number">
                {active && isPlaying ? (
                  <span aria-hidden="true">▮▮</span>
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </div>

              <div className="song-info">
                <strong>{song.title}</strong>
                <span>{song.artist}</span>
              </div>

              <div className="song-play" aria-hidden="true">
                {active && isPlaying ? "⏸" : "▶"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}