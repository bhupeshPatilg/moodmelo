import type { Song } from "../types/music";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

interface YouTubeSearchItem {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
      high?: {
        url?: string;
      };
    };
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  nextPageToken?: string;
}

export async function searchYouTubeSongs(
  query: string,
  maxResults = 10
): Promise<Song[]> {
  if (!API_KEY) {
    throw new Error(
      "VITE_YOUTUBE_API_KEY is not configured. Check your .env.local file."
    );
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    videoEmbeddable: "true",
    regionCode: "IN",
    relevanceLanguage: "en",
    key: API_KEY,
  });

  const response = await fetch(`${YOUTUBE_API_URL}?${params.toString()}`);

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `YouTube API request failed (${response.status}): ${errorText}`
    );
  }

  const data =
    (await response.json()) as YouTubeSearchResponse;

  return (data.items ?? [])
    .filter((item) => item.id?.videoId)
    .map((item) => {
      const videoId = item.id!.videoId!;

      return {
        id: videoId,
        youtubeId: videoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: item.snippet?.title ?? "Unknown title",
        artist: item.snippet?.channelTitle ?? "YouTube",
        thumbnail:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url,
      };
    });
}