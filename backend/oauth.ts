import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { Express, Request, Response } from "express";
import { google } from "googleapis";
import { storeTokens } from "./tokenStore.js";

dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const redirectUri =
  process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/oauth2/callback";
const pendingStates = new Map<string, number>();
const stateLifetimeMs = 10 * 60 * 1000;

export const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri,
});

export function isOAuthConfigured(): boolean {
  const requiredValues = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  ];

  return requiredValues.every(
    (value) => value?.trim() && !value.startsWith("YOUR_")
  );
}

function getQueryValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isLoopbackRequest(request: Request): boolean {
  const address = request.socket.remoteAddress?.toLowerCase();
  return (
    address === "127.0.0.1" ||
    address === "::1" ||
    address === "::ffff:127.0.0.1"
  );
}

function requireLocalOwner(request: Request, response: Response): boolean {
  if (isLoopbackRequest(request)) {
    return true;
  }

  response.status(403).send("Owner authorization is available only on this computer.");
  return false;
}

function cleanExpiredStates(): void {
  const now = Date.now();
  for (const [state, expiresAt] of pendingStates) {
    if (expiresAt <= now) {
      pendingStates.delete(state);
    }
  }
}

function sendPage(response: Response, status: number, message: string): void {
  response
    .status(status)
    .type("html")
    .send(`<!doctype html><html lang="en"><meta charset="utf-8"><title>MoodMelo YouTube setup</title><body><main><h1>MoodMelo YouTube setup</h1><p>${message}</p></main></body></html>`);
}

export function registerOAuthRoutes(app: Express): void {
  app.get("/auth/youtube", (request, response) => {
    if (!requireLocalOwner(request, response)) {
      return;
    }

    if (!isOAuthConfigured()) {
      return sendPage(
        response,
        503,
        "Set the Google OAuth client values in backend/.env before starting owner authorization."
      );
    }

    cleanExpiredStates();
    const state = randomBytes(32).toString("hex");
    pendingStates.set(state, Date.now() + stateLifetimeMs);

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      include_granted_scopes: true,
      scope: ["https://www.googleapis.com/auth/youtube.readonly"],
      state,
    });

    response.redirect(authorizationUrl);
  });

  app.get("/oauth2/callback", async (request, response) => {
    if (!requireLocalOwner(request, response)) {
      return;
    }

    const state = getQueryValue(request.query.state);
    cleanExpiredStates();

    if (!state || !pendingStates.has(state)) {
      return sendPage(response, 400, "Authorization state was invalid or expired. Start again from the local setup URL.");
    }

    pendingStates.delete(state);

    const authorizationError = getQueryValue(request.query.error);
    if (authorizationError) {
      return sendPage(response, 400, "YouTube authorization was not completed. Return to the local setup URL to try again.");
    }

    const code = getQueryValue(request.query.code);
    if (!code) {
      return sendPage(response, 400, "Google did not return an authorization code. Start again from the local setup URL.");
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      if (!tokens.refresh_token) {
        return sendPage(
          response,
          400,
          "Google did not issue a refresh token. Revoke MoodMelo's existing Google access, then repeat owner authorization."
        );
      }

      const storedTokens = await storeTokens(tokens);
      oauth2Client.setCredentials(storedTokens);
      sendPage(response, 200, "Owner authorization is complete. You can close this page.");
    } catch {
      sendPage(
        response,
        500,
        "Authorization could not be completed. Check the OAuth redirect URI and backend configuration, then try again."
      );
    }
  });
}