import MoodPlayer from "../components/MoodPlayer";
import type { Mood, Song } from "../types/music";

interface MoodPageProps {
  mood: Mood;
  songs: Song[];
  selectedSongId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  loadError: "not-configured" | "request-failed" | null;
  onBack: () => void;
  onRetry: () => void;
  onSongSelect: (song: Song) => void;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onPause: () => void;
}

export default function MoodPage({
  mood,
  songs,
  selectedSongId,
  isPlaying,
  isLoading,
  loadError,
  onBack,
  onRetry,
  onSongSelect,
  onPrev,
  onNext,
  onPlay,
  onPause,
}: MoodPageProps) {
  const activeSong = songs.find((song) => song.id === selectedSongId) ?? null;

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
          {(isLoading || loadError) && (
            <div className="mood-page__songs" aria-live="polite">
              {isLoading ? (
              <div className="loading-state" role="status">
                Loading songs...
              </div>
              ) : loadError ? (
              <div className="empty-state" role="alert">
                <p>
                  {loadError === "not-configured"
                    ? "Playlist not configured yet."
                    : "Unable to load songs for this mood."}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onRetry}
                >
                  Retry
                </button>
              </div>
              ) : null}
            </div>
          )}

          <MoodPlayer
            fallbackArtwork={mood.background}
            title={activeSong ? `${activeSong.title} by ${activeSong.artist ?? "MoodMelo"}` : "Select a song"}
            songs={songs}
            activeSongId={activeSong?.id}
            isPlaying={isPlaying}
            onSongSelect={onSongSelect}
            onPrev={onPrev}
            onNext={onNext}
            onPlay={onPlay}
            onPause={onPause}
          />
        </div>
      </div>
    </main>
  );
}
