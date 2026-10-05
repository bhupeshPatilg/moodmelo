import type { Song } from "../types/music";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

interface MoodApiResponse {
  success: boolean;
  error?: string;
  songs?: Song[];
}

export class MoodApiError extends Error {
  constructor(
    message: string,
    readonly code: "not-configured" | "request-failed"
  ) {
    super(message);
    this.name = "MoodApiError";
  }
}

export async function fetchMoodSongs(
  moodId: string,
  signal?: AbortSignal
): Promise<Song[]> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/api/moods/${encodeURIComponent(moodId)}`,
      { signal }
    );
  } catch {
    throw new MoodApiError("Unable to load songs for this mood.", "request-failed");
  }

  let result: MoodApiResponse;
  try {
    result = (await response.json()) as MoodApiResponse;
  } catch {
    throw new MoodApiError("Unable to load songs for this mood.", "request-failed");
  }

  if (
    response.status === 503 &&
    result.error === "Playlist is not configured for this mood"
  ) {
    throw new MoodApiError(
      "Playlist not configured yet.",
      "not-configured"
    );
  }

  if (!response.ok || !result.success || !Array.isArray(result.songs)) {
    throw new MoodApiError("Unable to load songs for this mood.", "request-failed");
  }

  return result.songs;
}