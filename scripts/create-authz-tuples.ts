import { config } from "@dotenvx/dotenvx";
import { drive, auth as gauth } from "@googleapis/drive";
import { type AuthZ, AuthZService, PangeaConfig } from "pangea-node-sdk";

import { GoogleDriveRetriever } from "../src/google";
import { getGoogleDriveCredentials } from "../src/utils";

/** Map Google Drive roles to AuthZ File Drive schema roles. */
const GDRIVE_ROLE_TO_AUTHZ_ROLE: Record<string, string> = {
  owner: "owner",
  reader: "reader",
  writer: "editor",
};

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

config();

const googleCredentials = getGoogleDriveCredentials();
const retriever = new GoogleDriveRetriever({
  credentials: googleCredentials,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  scopes: SCOPES,
});

// Get all documents.
console.log("Fetching documents...");
const docs = await retriever.invoke("");

if (!docs.length) {
  console.warn("No documents found.");
  process.exit(0);
}

const authz = new AuthZService(
  process.env.PANGEA_SERVICE_TOKEN!,
  new PangeaConfig({ domain: process.env.NEXT_PUBLIC_PANGEA_DOMAIN }),
);

const auth = new gauth.GoogleAuth({
  credentials: googleCredentials,
  scopes: SCOPES,
});
const permissionsClient = drive({ version: "v3", auth }).permissions;
const tuples: AuthZ.Tuple[] = [];
for (const doc of docs) {
  const response = await permissionsClient.list({
    fileId: doc.id,
    // biome-ignore lint/nursery/noSecrets: false positive
    fields: "permissions(emailAddress, role)",
  });
  const permissions = response.data.permissions ?? [];

  for (const permission of permissions) {
    tuples.push({
      subject: { type: "user", id: permission.emailAddress! },
      relation: GDRIVE_ROLE_TO_AUTHZ_ROLE[permission.role!],
      resource: { type: "file", id: doc.id },
    });
  }
}

console.log(`Creating ${tuples.length} tuples...`);
await authz.tupleCreate({ tuples });
