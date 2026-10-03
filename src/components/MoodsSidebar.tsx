import type { Mood } from "../types/music";

interface Props {
  moods: Mood[];
  selectedMoodId: string;
  onMoodSelect: (moodId: string) => void;
}

export default function MoodSidebar({
  moods,
  selectedMoodId,
  onMoodSelect,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <span>MOODS</span>
      </div>

      <div className="mood-menu">
        {moods.map((mood) => (
          <button
            key={mood.id}
            className={`mood-button ${
              selectedMoodId === mood.id ? "active" : ""
            }`}
            onClick={() => onMoodSelect(mood.id)}
          >
            <span className="mood-icon">{mood.icon}</span>
            <span>{mood.name}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="secondary-button">▶ Just Play</button>
        <button className="secondary-button">📚 My Playlist</button>
      </div>
    </aside>
  );
}