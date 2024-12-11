import type { DocumentInterface } from "@langchain/core/documents";
import type { AIGuard, AuthZ, PromptGuard } from "pangea-node-sdk";

export interface ResponseObject<M> {
  request_id: string;
  request_time: string;
  response_time: string;
  status: string;
  result: M;
  summary: string;
}

export const dataGuardProxyRequest = (
  token: string,
  body: unknown,
): Promise<ResponseObject<AIGuard.TextGuardResult>> => {
  return baseProxyRequest(token, "data", "", body);
};

export const promptGuardProxyRequest = (
  token: string,
  body: unknown,
): Promise<ResponseObject<PromptGuard.GuardResult>> => {
  return baseProxyRequest(token, "prompt", "", body);
};

export const aiProxyRequest = (
  token: string,
  body: unknown,
): Promise<{
  reply: string;
  authzResponses: ResponseObject<AuthZ.CheckResult>[];
  documents: DocumentInterface[];
}> => {
  return baseProxyRequest(token, "ai", "", body);
};

const baseProxyRequest = async <T = unknown>(
  token: string,
  service: string,
  action: string,
  body: unknown,
): Promise<T> => {
  const args = action ? `?action=${action}` : "";
  const resp = await fetch(`/api/${service}${args}`, {
    method: "POST",
    body: JSON.stringify(body),
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });

  if (resp.status > 299 || resp.status < 200) {
    const text = await resp.text();
    console.error(`Error: ${text}; while performing ${service}/${action}`);
    throw resp;
  }

  return await resp.json();
};
