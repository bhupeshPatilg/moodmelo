export const MOOD_PLAYLISTS = {
  // TODO: Replace empty values with the owner's private YouTube playlist IDs.
  motivated: "PLVlcDAxbJwx8",
  relaxed: "PLTj8lHzM_Gzw",
  romantic: "PLFK_5dtIOybw",
  retro: "PLdM-nQC7lGZY",
  focused: "",
  travelling: "PLXL9B3mcWilk",
  party: "PLMlQm2NrBiUs",
  instrumental: "",
} as const;

export type MoodId = keyof typeof MOOD_PLAYLISTS;