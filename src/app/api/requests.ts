import type { NextRequest } from "next/server";

import { delay } from "../../utils";

type ValidatedToken =
  | { success: true; username: string; profile: Record<string, string> }
  | { success: false; username: undefined; profile: undefined };

const BEARER_RE = /^bearer/i;

export async function validateToken(
  request: NextRequest,
): Promise<ValidatedToken> {
  const auth = request.headers.get("Authorization");
  const token = auth?.match(BEARER_RE) ? auth.split(" ")[1] : "";

  if (!token) {
    return { success: false, username: undefined, profile: undefined };
  }

  const url = getUrl("authn", "v2/client/token/check");
  const body = { token };
  const { success, response } = await postRequest(url, body, true);
  return {
    success,
    username: response?.result?.owner,
    profile: response?.result?.profile,
  };
}

export async function postRequest(
  url: string,
  body: unknown,
  useClientToken = false,
) {
  let response = await fetch(url, {
    method: "POST",
    ...getHeaders(useClientToken),
    body: JSON.stringify(body),
  });

  if (response.status === 202) {
    response = await handleAsync(response);
  }

  const json = await response.json();
  const success = json.status === "Success";

  return { success, response: json };
}

export function getRequest(url: string) {
  return fetch(url, {
    method: "GET",
    ...getHeaders(),
  });
}

async function handleAsync(response: Response): Promise<Response> {
  const data = await response.json();
  const url = `https://${process.env.NEXT_PUBLIC_PANGEA_DOMAIN}/request/${data?.request_id}`;
  const maxRetries = 3;
  let retryCount = 1;

  while (response.status === 202 && retryCount <= maxRetries) {
    retryCount += 1;
    const waitTime = retryCount * retryCount * 1000;

    await delay(waitTime);
    response = await getRequest(url);
  }

  return response;
}

export function getUrl(service: string, endpoint: string): string {
  return `https://${service}.${process.env.NEXT_PUBLIC_PANGEA_DOMAIN}/${endpoint}`;
}

export function getHeaders(useClientToken = false) {
  return {
    headers: {
      authorization: `Bearer ${useClientToken ? process.env.NEXT_PUBLIC_AUTHN_CLIENT_TOKEN : process.env.PANGEA_SERVICE_TOKEN}`,
      "content-type": "application/json",
    },
  };
}
