import {
  aiProxyRequest,
  dataGuardProxyRequest,
  promptGuardProxyRequest,
} from "@/app/proxy";

export const sendUserMessage = async (
  token: string,
  message: string,
  authz = true,
) => {
  return await aiProxyRequest(token, {
    authz,
    userPrompt: message,
  });
};

export const callPromptGuard = async (token: string, userPrompt: string) => {
  const messages = [
    {
      content: userPrompt,
      role: "user",
    },
  ];

  return await promptGuardProxyRequest(token, { messages });
};

export const callInputDataGuard = async (token: string, userPrompt: string) => {
  const payload = {
    recipe: "pangea_prompt_guard",
    text: userPrompt,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const callResponseDataGuard = async (
  token: string,
  llmResponse: string,
) => {
  const payload = {
    recipe: "pangea_llm_response_guard",
    text: llmResponse,
  };

  return await dataGuardProxyRequest(token, payload);
};
