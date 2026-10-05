import { useEffect, useMemo, useState } from "react";
import HomePage from "./pages/HomePage";
import MoodPage from "./pages/MoodPage";
import { moods } from "./data/moods";
import { fetchMoodSongs, MoodApiError } from "./services/moodApi";
import type { Mood, Song } from "./types/music";

const App: React.FC = () => {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [autoplaySongId, setAutoplaySongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<"not-configured" | "request-failed" | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const selectedMood = useMemo(
    () => moods.find((mood) => mood.id === selectedMoodId) ?? null,
    [selectedMoodId]
  );

  useEffect(() => {
    if (!selectedMoodId) {
      setSongs([]);
      setSelectedSongId(null);
      setAutoplaySongId(null);
      setIsPlaying(false);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();
    setSongs([]);
    setSelectedSongId(null);
    setAutoplaySongId(null);
    setIsPlaying(false);
    setIsLoading(true);
    setLoadError(null);

    void fetchMoodSongs(selectedMoodId, controller.signal)
      .then((loadedSongs) => {
        const firstSong = loadedSongs[0] ?? null;
        setSongs(loadedSongs);
        setSelectedSongId(firstSong?.id ?? null);
        setAutoplaySongId(firstSong?.id ?? null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof MoodApiError && error.code === "not-configured"
            ? "not-configured"
            : "request-failed"
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedMoodId, retryCount]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const moodId = new URLSearchParams(window.location.search).get("mood");
    if (moodId && moods.some((mood) => mood.id === moodId)) {
      setSelectedMoodId(moodId);
      return;
    }

    setSelectedMoodId(null);
  }, []);

  const goToMood = (mood: Mood) => {
    setSelectedMoodId(mood.id);

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("mood", mood.id);
      window.history.pushState({}, "", nextUrl);
    }
  };

  const goHome = () => {
    setSelectedMoodId(null);

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("mood");
      window.history.pushState({}, "", nextUrl);
    }
  };

  const selectSong = (song: Song) => {
    setSelectedSongId(song.id);
    setAutoplaySongId(song.id);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setAutoplaySongId(null);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setAutoplaySongId(null);
    setIsPlaying(false);
  };

  const moveSong = (direction: -1 | 1) => {
    if (songs.length === 0) {
      return;
    }

    const currentIndex = songs.findIndex((song) => song.id === selectedSongId);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + songs.length) % songs.length;
    const nextSong = songs[nextIndex];
    if (nextSong) {
      selectSong(nextSong);
    }
  };

  if (selectedMood) {
    return (
      <MoodPage
        mood={selectedMood}
        songs={songs}
        selectedSongId={selectedSongId}
        autoplayRequested={autoplaySongId === selectedSongId && selectedSongId !== null}
        isPlaying={isPlaying}
        isLoading={isLoading}
        loadError={loadError}
        onBack={goHome}
        onRetry={() => setRetryCount((count) => count + 1)}
        onSongSelect={selectSong}
        onPrev={() => moveSong(-1)}
        onNext={() => moveSong(1)}
        onPlay={handlePlay}
        onPause={handlePause}
        onAutoplayBlocked={() => {
          setAutoplaySongId(null);
          setIsPlaying(false);
        }}
        onEnded={() => setIsPlaying(false)}
      />
    );
  }

  return <HomePage onSelectMood={goToMood} />;
};

export default App;
