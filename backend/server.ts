import cors from "cors";
import express from "express";
import { loadStoredTokens, storeTokens } from "./tokenStore.js";
import {
  isOAuthConfigured,
  oauth2Client,
  registerOAuthRoutes,
} from "./oauth.js";
import { MOOD_PLAYLISTS, type MoodId } from "./moodPlaylists.js";
import { getPlaylistSongs, type PlaylistSong } from "./youtube.js";

const app = express();
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
const backendPort = Number(process.env.BACKEND_PORT ?? 3000);
const playlistCache = new Map<
  string,
  { songs: PlaylistSong[]; expiresAt: number }
>();
const playlistCacheDurationMs = 5 * 60 * 1000;

app.use(cors({ origin: frontendUrl }));
registerOAuthRoutes(app);

app.get("/api/moods/:mood", async (request, response) => {
  const mood = request.params.mood.toLowerCase();
  if (!Object.hasOwn(MOOD_PLAYLISTS, mood)) {
    return response.status(404).json({
      success: false,
      error: "Unknown mood",
    });
  }

  const playlistId = MOOD_PLAYLISTS[mood as MoodId];
  if (!playlistId) {
    return response.status(503).json({
      success: false,
      error: "Playlist is not configured for this mood",
    });
  }

  try {
    const cachedPlaylist = playlistCache.get(playlistId);
    const songs =
      cachedPlaylist && cachedPlaylist.expiresAt > Date.now()
        ? cachedPlaylist.songs
        : await getPlaylistSongs(playlistId);

    if (!cachedPlaylist || cachedPlaylist.expiresAt <= Date.now()) {
      playlistCache.set(playlistId, {
        songs,
        expiresAt: Date.now() + playlistCacheDurationMs,
      });
    }

    return response.json({
      success: true,
      mood,
      playlistId,
      count: songs.length,
      songs,
    });
  } catch {
    console.error("YouTube mood playlist request failed.");
    return response.status(502).json({
      success: false,
      error: "Unable to load songs for this mood.",
    });
  }
});

app.get("/api/test/romantic", async (_request, response) => {
  if (!isOAuthConfigured()) {
    return response.status(503).json({
      success: false,
      error: "Google OAuth is not configured. Set the required values in backend/.env.",
    });
  }

  if (!oauth2Client.credentials.refresh_token) {
    return response.status(503).json({
      success: false,
      error: "Owner authorization is missing. Visit http://localhost:3000/auth/youtube on this computer.",
    });
  }

  try {
    const playlistId = "PLFK_5dtIOybw";
    const songs = await getPlaylistSongs(playlistId);
    return response.json({
      success: true,
      playlistId,
      count: songs.length,
      songs,
    });
  } catch {
    console.error("YouTube private playlist request failed.");
    return response.status(502).json({
      success: false,
      error: "The private playlist could not be read. Confirm the owner authorization and playlist access.",
    });
  }
});

async function startServer(): Promise<void> {
  try {
    const storedTokens = await loadStoredTokens();
    if (storedTokens) {
      oauth2Client.setCredentials(storedTokens);
    } else if (isOAuthConfigured()) {
      console.info("Owner authorization is missing. Visit http://localhost:3000/auth/youtube on this computer.");
    } else {
      console.info("Configure Google OAuth values in backend/.env before owner authorization.");
    }
  } catch {
    console.error("Could not load backend/token.json. Fix or remove the local token file, then restart.");
    process.exitCode = 1;
    return;
  }

  oauth2Client.on("tokens", (tokens) => {
    void storeTokens(tokens).catch(() => {
      console.error("Could not persist refreshed YouTube authorization.");
    });
  });

  app.listen(backendPort, "localhost", () => {
    console.info(`MoodMelo backend listening at http://localhost:${backendPort}`);
  });
}

void startServer();