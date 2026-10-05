import { google } from "googleapis";
import { oauth2Client } from "./oauth.js";

export interface PlaylistSong {
  id: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  artist: string;
  thumbnail?: string;
  position: number;
}

export async function getPlaylistSongs(
  playlistId: string
): Promise<PlaylistSong[]> {
  if (!playlistId.trim()) {
    throw new Error("A playlist ID is required.");
  }

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const songs: PlaylistSong[] = [];
  let pageToken: string | undefined;

  do {
    const response = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId,
      maxResults: 50,
      pageToken,
    });

    for (const item of response.data.items ?? []) {
      const youtubeId = item.contentDetails?.videoId;
      if (!youtubeId) {
        continue;
      }

      const snippet = item.snippet;
      const thumbnails = snippet?.thumbnails;
      songs.push({
        id: item.id ?? youtubeId,
        youtubeId,
        youtubeUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`,
        title: snippet?.title ?? "Unknown title",
        artist:
          snippet?.videoOwnerChannelTitle ?? snippet?.channelTitle ?? "YouTube",
        thumbnail:
          thumbnails?.maxres?.url ??
          thumbnails?.high?.url ??
          thumbnails?.medium?.url ??
          thumbnails?.default?.url ??
          undefined,
        position: snippet?.position ?? songs.length,
      });
    }

    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return songs;
}