import type { NextRequest } from "next/server";

import { getUrl, postRequest, validateToken } from "../requests";

const SERVICE_NAME = "prompt-guard";
const API_VERSION = "v1beta";

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await request.json();

  const endpoint = `${API_VERSION}/guard`;
  const url = getUrl(SERVICE_NAME, endpoint);

  const { success, response } = await postRequest(url, body);

  if (success) {
    return Response.json(response);
  }
  return Response.json(response, { status: 400 });
}
