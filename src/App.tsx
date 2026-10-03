import { useEffect, useMemo, useState } from "react";
import HomePage from "./pages/HomePage";
import MoodPage from "./pages/MoodPage";
import { moods } from "./data/moods";
import type { Mood } from "./types/music";

const App: React.FC = () => {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const selectedMood = useMemo(
    () => moods.find((mood) => mood.id === selectedMoodId) ?? null,
    [selectedMoodId]
  );

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

  if (selectedMood) {
    return <MoodPage mood={selectedMood} onBack={goHome} />;
  }

  return <HomePage onSelectMood={goToMood} />;
};

export default App;
