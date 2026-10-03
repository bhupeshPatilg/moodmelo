export default function Header() {
  return (
    <header className="mood-picker__brand-wrap" aria-label="MoodMelo brand">
      <div className="mood-picker__brand">
        <span className="brand-icon brand-icon--hero" aria-hidden="true">
          <span>♫</span>
        </span>
        <span>MoodMelo</span>
      </div>
      <p className="mood-picker__tagline">Music for Every Mood</p>
    </header>
  );
}