import type { Song } from "../types/music";
import SongItem from "./SongItem";

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
        {songs.map((song, index) => (
          <SongItem
            key={song.id}
            song={song}
            index={index + 1}
            isActive={activeSongId === song.id}
            isPlaying={isPlaying}
            onSelect={onSongSelect}
          />
        ))}
      </div>
    </section>
  );
}