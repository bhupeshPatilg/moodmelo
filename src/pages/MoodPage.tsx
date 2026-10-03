import { useMemo, useState } from "react";
import YouTubePlayer from "../components/YouTubePlayer";
import type { Mood, Song } from "../types/music";

interface MoodPageProps {
  mood: Mood;
  onBack: () => void;
}

export default function MoodPage({ mood, onBack }: MoodPageProps) {
  const [activeSongId, setActiveSongId] = useState<string | null>(
    mood.songs[0]?.id ?? null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSong = useMemo(
    () => mood.songs.find((song) => song.id === activeSongId) ?? mood.songs[0] ?? null,
    [activeSongId, mood]
  );

  const handleSongSelect = (song: Song) => {
    setActiveSongId(song.id);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!mood.songs.length) return;

    const currentIndex = mood.songs.findIndex((song) => song.id === activeSongId);
    const nextIndex = currentIndex <= 0 ? mood.songs.length - 1 : currentIndex - 1;
    const song = mood.songs[nextIndex];
    if (song) {
      setActiveSongId(song.id);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!mood.songs.length) return;

    const currentIndex = mood.songs.findIndex((song) => song.id === activeSongId);
    const nextIndex = currentIndex === -1 || currentIndex === mood.songs.length - 1 ? 0 : currentIndex + 1;
    const song = mood.songs[nextIndex];
    if (song) {
      setActiveSongId(song.id);
      setIsPlaying(true);
    }
  };

  return (
    <main className="player-page mood-page-shell">
      <div className="player-page__topbar">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back to Moods
        </button>
      </div>

      <div className="player-page__screen">
        <div
          className="player-page__card"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(6, 10, 18, 0.38), rgba(6, 10, 18, 0.7)), url("${mood.background}")`,
          }}
        >
          <YouTubePlayer
            audioUrl={activeSong?.audioUrl}
            fallbackArtwork={mood.background}
            title={activeSong ? `${activeSong.title} by ${activeSong.artist ?? "MoodMelo"}` : "Select a song"}
            songs={mood.songs}
            activeSongId={activeSong?.id}
            isPlaying={isPlaying}
            onSongSelect={handleSongSelect}
            onPrev={handlePrevious}
            onNext={handleNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      </div>
    </main>
  );
}
