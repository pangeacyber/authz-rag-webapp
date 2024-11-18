// biome-ignore lint: server-side
import fs from "node:fs";
// biome-ignore lint: server-side
import path from "node:path";

/**
 * Read a potentially multi-line JSON file and convert it into a single-line JSON string.
 * Set the JSON string in a process.env variable.
 *
 * @param {string} jsonFilePath - Path to the credentials file.
 * @param {string} processEnvName - Name of the process.env variable to set.
 * @returns {undefined}
 */
const setProcessEnvJson = (
  jsonFilePath: fs.PathOrFileDescriptor,
  processEnvName: string,
): void => {
  try {
    const json = fs.readFileSync(jsonFilePath, "utf8");
    const jsonObject = JSON.parse(json);
    const singleLineJson = JSON.stringify(jsonObject);

    process.env[processEnvName] = singleLineJson;
  } catch (error) {
    console.error(
      `Error setting up ${processEnvName} environment variable:`,
      error,
    );
    throw error;
  }
};

/**
 * Set up the Google Drive credentials in the process.env variable.
 * @returns {undefined}
 */
export const setGoogleDriveCredentials = (): void => {
  setProcessEnvJson(
    path.resolve("credentials.json"),
    "GOOGLE_DRIVE_CREDENTIALS",
  );
};

export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};
