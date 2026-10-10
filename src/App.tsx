import { useEffect, useMemo, useRef, useState } from "react";
import HomePage from "./pages/HomePage";
import MoodPage from "./pages/MoodPage";
import { moods } from "./data/moods";
import { fetchMoodSongs, MoodApiError } from "./services/moodApi";
import type { Mood, Song } from "./types/music";
import YouTubePlayerProvider from "./components/YouTubePlayerProvider";

const App: React.FC = () => {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [autoplaySongId, setAutoplaySongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<"not-configured" | "request-failed" | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const lastEndedSongIdRef = useRef<string | null>(null);

  const selectedMood = useMemo(
    () => moods.find((mood) => mood.id === selectedMoodId) ?? null,
    [selectedMoodId]
  );

  useEffect(() => {
    if (!selectedMoodId) {
      lastEndedSongIdRef.current = null;
      setSongs([]);
      setSelectedSongId(null);
      setAutoplaySongId(null);
      setIsPlaying(false);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();
    lastEndedSongIdRef.current = null;
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

  const selectSong = (song: Song, resetEndedSong = true) => {
    if (resetEndedSong) {
      lastEndedSongIdRef.current = null;
    }
    setSelectedSongId(song.id);
    setAutoplaySongId(song.id);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    lastEndedSongIdRef.current = null;
    setAutoplaySongId(null);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setAutoplaySongId(null);
    setIsPlaying(false);
  };

  const moveSong = (direction: -1 | 1, resetEndedSong = true) => {
    if (songs.length === 0) {
      return;
    }

    const currentIndex = songs.findIndex((song) => song.id === selectedSongId);
    let nextSong: Song | undefined;

    if (direction === 1 && isShuffleEnabled && songs.length > 1) {
      const alternatives = songs.filter((song) => song.id !== selectedSongId);
      nextSong = alternatives[Math.floor(Math.random() * alternatives.length)];
    } else {
      const nextIndex =
        currentIndex === -1
          ? 0
          : (currentIndex + direction + songs.length) % songs.length;
      nextSong = songs[nextIndex];
    }

    if (nextSong) {
      selectSong(nextSong, resetEndedSong);
    }
  };

  const handleSongEnded = () => {
    if (!selectedSongId || lastEndedSongIdRef.current === selectedSongId) {
      return;
    }

    lastEndedSongIdRef.current = selectedSongId;
    setIsPlaying(false);
    if (songs.length > 1) {
      moveSong(1, false);
    }
  };

  const activeSong = songs.find((song) => song.id === selectedSongId) ?? null;
  const autoplayRequested = autoplaySongId === selectedSongId && selectedSongId !== null;

  return (
    <YouTubePlayerProvider
      videoId={activeSong?.youtubeId}
      autoplayRequested={autoplayRequested}
      onReady={() => setIsPlaying(false)}
      onPlay={handlePlay}
      onPause={handlePause}
      onAutoplayBlocked={() => {
        setAutoplaySongId(null);
        setIsPlaying(false);
      }}
      onEnded={handleSongEnded}
      onError={() => setIsPlaying(false)}
    >
      {selectedMood ? (
        <MoodPage
          mood={selectedMood}
          songs={songs}
          selectedSongId={selectedSongId}
          isPlaying={isPlaying}
          isShuffleEnabled={isShuffleEnabled}
          onShuffleToggle={() => setIsShuffleEnabled((enabled) => !enabled)}
          isLoading={isLoading}
          loadError={loadError}
          onBack={goHome}
          onRetry={() => setRetryCount((count) => count + 1)}
          onSongSelect={selectSong}
          onPrev={() => moveSong(-1)}
          onNext={() => moveSong(1)}
          onPlay={handlePlay}
          onPause={handlePause}
        />
      ) : (
        <HomePage onSelectMood={goToMood} />
      )}
    </YouTubePlayerProvider>
  );
};

export default App;
