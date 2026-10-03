import type { Mood } from "../types/music";

export const moods: Mood[] = [
  {
    id: "motivated",
    name: "Motivated",
    icon: "🔥",
    description: "Music to get moving, focused and confident.",
    background: "/images/moods/motivated.png",
    songs: [
      {
        id: "mot-01",
        title: "Believer",
        artist: "Imagine Dragons",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        id: "mot-02",
        title: "Hall of Fame",
        artist: "The Script",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
      {
        id: "mot-03",
        title: "Whatever It Takes",
        artist: "Imagine Dragons",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
    ],
  },

  {
    id: "relaxed",
    name: "Relaxed",
    icon: "😌",
    description: "Slow down, breathe and enjoy the moment.",
    background: "/images/moods/relaxed.png",
    songs: [
      {
        id: "rel-01",
        title: "Relaxing Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      },
      {
        id: "rel-02",
        title: "Chill Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      },
    ],
  },

  {
    id: "romantic",
    name: "Romantic",
    icon: "❤️",
    description: "Warm, emotional and intimate music.",
    background: "/images/moods/romantic.png",
    songs: [
      {
        id: "rom-01",
        title: "Romantic Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      },
    ],
  },

  {
    id: "retro",
    name: "Retro 80s / 90s",
    icon: "🎞️",
    description: "Classic sounds and unforgettable memories.",
    background: "/images/moods/retro.png",
    songs: [
      {
        id: "ret-01",
        title: "Retro Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      },
    ],
  },

  {
    id: "focused",
    name: "Focused",
    icon: "🧠",
    description: "Music for concentration and productivity.",
    background: "/images/moods/focused.png",
    songs: [
      {
        id: "foc-01",
        title: "Focus Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      },
    ],
  },

  {
    id: "travelling",
    name: "Travelling",
    icon: "🚗",
    description: "Road-trip energy, freedom and adventure.",
    background: "/images/moods/travelling.png",
    songs: [
      {
        id: "tra-01",
        title: "Travel Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      },
    ],
  },

  {
    id: "party",
    name: "Party",
    icon: "🎉",
    description: "Turn up the energy and enjoy the moment.",
    background: "/images/moods/party.png",
    songs: [
      {
        id: "par-01",
        title: "Party Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      },
    ],
  },

  {
    id: "instrumental",
    name: "Instrumental",
    icon: "🎹",
    description: "Music without vocals for a clean listening experience.",
    background: "/images/moods/instrumental.png",
    songs: [
      {
        id: "ins-01",
        title: "Instrumental Track",
        artist: "Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
      },
    ],
  },
];