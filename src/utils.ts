// biome-ignore lint: server-side
import fs from "node:fs";
// biome-ignore lint: server-side
import path from "node:path";

/**
 * Read and parse a JSON file.
 *
 * @param {string} jsonFilePath - Path to the JSON file.
 * @returns {object}
 */
const readJsonFile = (
  jsonFilePath: fs.PathOrFileDescriptor,
): Record<string, string> => {
  try {
    const json = fs.readFileSync(jsonFilePath, "utf8");
    return JSON.parse(json);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    throw error;
  }
};

/**
 * Get Google Drive credentials from a JSON file.
 * @returns {object}
 */
export const getGoogleDriveCredentials = (): Record<string, string> => {
  return readJsonFile("credentials.json");
};

export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};
