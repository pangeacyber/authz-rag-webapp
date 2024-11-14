export const dataGuardProxyRequest = (
  token: string,
  body: unknown,
  // biome-ignore lint/style/useNamingConvention: matches API response
): Promise<{ findings: unknown; redacted_prompt: string }> => {
  return baseProxyRequest(token, "data", "", body);
};

export const promptGuardProxyRequest = (
  token: string,
  body: unknown,
): Promise<{
  detected: boolean;
}> => {
  return baseProxyRequest(token, "prompt", "", body);
};

export const aiProxyRequest = (
  token: string,
  body: unknown,
): Promise<string> => {
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
