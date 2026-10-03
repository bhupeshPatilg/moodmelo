import type { Mood } from "../types/music";
import { moods } from "../data/moods";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface HomePageProps {
  onSelectMood: (mood: Mood) => void;
}

export default function HomePage({ onSelectMood }: HomePageProps) {
  return (
    <main className="mood-picker-page">
      <Header />

      <div className="mood-picker-shell">
        <h2 className="mood-picker__heading">Choose Your Mood</h2>

        <div className="mood-picker-grid">
          {moods.map((mood) => (
            <button
              key={mood.id}
              type="button"
              className="mood-picker-card"
              onClick={() => onSelectMood(mood)}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(6, 10, 18, 0.15), rgba(6, 10, 18, 0.8)), url("${mood.background}")`,
              }}
            >
              <span className="mood-picker-name">{mood.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
