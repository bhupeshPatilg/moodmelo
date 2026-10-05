export const MOOD_PLAYLISTS = {
  // TODO: Replace empty values with the owner's private YouTube playlist IDs.
  motivated: "",
  relaxed: "",
  romantic: "PLFK_5dtIOybw",
  retro: "",
  focused: "",
  travelling: "",
  party: "",
  instrumental: "",
} as const;

export type MoodId = keyof typeof MOOD_PLAYLISTS;