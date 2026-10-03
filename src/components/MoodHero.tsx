import type { Mood } from "../types/music";

interface Props {
  mood: Mood;
}

export default function MoodHero({ mood }: Props) {
  return (
    <section
      className="mood-hero"
      style={{
        backgroundImage: `url("${mood.background}")`,
      }}
    >
      <div className="hero-overlay">
        <div className="hero-content">
          <div className="hero-icon">
            {mood.icon}
          </div>

          <h2>{mood.name}</h2>

          <p>{mood.description}</p>
        </div>
      </div>
    </section>
  );
}