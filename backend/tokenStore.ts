import { randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Credentials } from "google-auth-library";

const tokenPath = fileURLToPath(new URL("./token.json", import.meta.url));

export async function loadStoredTokens(): Promise<Credentials | null> {
  let contents: string;

  try {
    contents = await readFile(tokenPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw new Error("The stored YouTube authorization could not be read.");
  }

  try {
    const credentials = JSON.parse(contents) as Credentials;
    return typeof credentials.refresh_token === "string" ? credentials : null;
  } catch {
    throw new Error("The stored YouTube authorization file is invalid.");
  }
}

export async function storeTokens(tokens: Credentials): Promise<Credentials> {
  const existingTokens = await loadStoredTokens();
  const credentials: Credentials = {
    ...existingTokens,
    ...tokens,
    refresh_token: tokens.refresh_token ?? existingTokens?.refresh_token,
  };

  if (!credentials.refresh_token) {
    throw new Error("A refresh token is required to store YouTube authorization.");
  }

  const temporaryPath = `${tokenPath}.${randomUUID()}.tmp`;
  await mkdir(dirname(tokenPath), { recursive: true });

  try {
    await writeFile(temporaryPath, JSON.stringify(credentials, null, 2), {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    await rename(temporaryPath, tokenPath);
    await chmod(tokenPath, 0o600);
  } finally {
    await rm(temporaryPath, { force: true });
  }

  return credentials;
}