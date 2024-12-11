import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@pangeacyber/react-auth";
import type { AIGuard } from "pangea-node-sdk";
import { type ChangeEvent, type KeyboardEvent, useState } from "react";

import { type ChatMessage, useChatContext } from "@/app/context";
import type { ResponseObject } from "@/app/proxy";
import { Colors } from "@/app/theme";

import ChatScroller from "./components/ChatScroller";
import {
  callInputDataGuard,
  callPromptGuard,
  callResponseDataGuard,
  sendUserMessage,
} from "./utils";

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return (hash >>> 0).toString(36).padStart(7, "0") + Date.now();
}

const ChatWindow = () => {
  const theme = useTheme();
  const {
    loading,
    authzEnabled,
    promptGuardEnabled,
    dataGuardEnabled,
    userPrompt,
    setUserPrompt,
    setLoginOpen,
    setLastPromptGuardResponse,
    setAiGuardResponses,
    setAuthzResponses,
    setDocuments,
  } = useChatContext();
  const { authenticated, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const processingError = (msg: string) => {
    setError(msg);
    setProcessing("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    // require authentication
    if (!authenticated) {
      setLoginOpen(true);
      return;
    }

    // don't accept empty prompts
    if (!userPrompt || loading || !!processing) {
      return;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        hash: hashCode(userPrompt),
        type: "user_prompt",
        input: userPrompt,
      },
    ]);

    const token = user?.active_token?.token || "";

    if (promptGuardEnabled) {
      setProcessing("Checking user prompt with Prompt Guard");

      try {
        const promptResp = await callPromptGuard(token, userPrompt);
        setLastPromptGuardResponse(promptResp);
        const pgMsg: ChatMessage = {
          hash: hashCode(JSON.stringify(promptResp)),
          type: "prompt_guard",
          output: JSON.stringify(promptResp),
        };
        setMessages((prevMessages) => [...prevMessages, pgMsg]);

        // don't send to the llm if prompt is malicious
        if (promptResp.result.detected) {
          processingError("Processing halted: suspicious prompt");
          return;
        }
      } catch (_) {
        processingError("Prompt Guard call failed, please try again");
        return;
      }
    }

    let llmUserPrompt = userPrompt;
    let guardedInput: ResponseObject<AIGuard.TextGuardResult>;

    if (dataGuardEnabled) {
      setProcessing("Checking user prompt with AI Guard");

      try {
        guardedInput = await callInputDataGuard(token, userPrompt);
        setAiGuardResponses([guardedInput, {}]);
        const dgiMsg: ChatMessage = {
          hash: hashCode(JSON.stringify(guardedInput)),
          type: "ai_guard",
          findings: JSON.stringify(guardedInput.result.findings),
        };
        setMessages((prevMessages) => [...prevMessages, dgiMsg]);

        llmUserPrompt = guardedInput.result.redacted_prompt;
      } catch (_) {
        processingError("AI Guard call failed, please try again");
        return;
      }
    }

    // don't send empty prompt
    if (!llmUserPrompt) {
      processingError("Processing halted: suspicious prompt");
      return;
    }

    setProcessing("Waiting for LLM response");

    const dataGuardMessages: ChatMessage[] = [];
    let llmResponse = "";

    try {
      const llmResponseStruct = await sendUserMessage(
        token,
        llmUserPrompt,
        authzEnabled,
      );
      llmResponse = llmResponseStruct.reply;
      setAuthzResponses(llmResponseStruct.authzResponses);
      setDocuments(llmResponseStruct.documents);
    } catch (_) {
      processingError("LLM call failed, please try again");
      return;
    }

    if (dataGuardEnabled) {
      setProcessing("Checking LLM response with AI Guard");

      try {
        const dataResp = await callResponseDataGuard(token, llmResponse);
        setAiGuardResponses([guardedInput!, dataResp]);
        const dgrMsg: ChatMessage = {
          hash: hashCode(JSON.stringify(dataResp)),
          type: "ai_guard",
          findings: JSON.stringify(dataResp.result.findings),
        };
        dataGuardMessages.push(dgrMsg);

        llmResponse = dataResp.result.redacted_prompt;
      } catch (_) {
        processingError("AI Guard call failed, please try again");
      }
    }

    const llmMsg: ChatMessage = {
      hash: hashCode(llmResponse),
      type: "llm_response",
      output: llmResponse,
    };

    setUserPrompt("");
    setMessages((prevMessages) => [
      ...prevMessages,
      llmMsg,
      ...dataGuardMessages,
    ]);
    setProcessing("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserPrompt(e.currentTarget.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Stack width="100%" height="100%">
      <Paper sx={{ height: "100%" }}>
        <Stack height="100%" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h1"
            sx={{ display: "flex", height: "100%", alignItems: "center" }}
          >
            Welcome to Pangea Chat.
          </Typography>
          <Stack width="100%" sx={{ position: "relative" }}>
            <ChatScroller messages={messages} />
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                position: "relative",
                width: "calc(100% - 40px)",
                margin: "20px 20px 8px 20px",
                padding: "4px 8px 4px 16px",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "25px",
                "&:focus-within": {
                  borderColor: Colors.icons,
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "0",
                  width: "100%",
                }}
              >
                <Snackbar
                  open={open}
                  autoHideDuration={5000}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                  onClose={handleClose}
                  sx={{
                    position: "absolute",
                    width: "100%",
                  }}
                >
                  <Alert severity="info" variant="filled">
                    <Typography variant="body1">{error}</Typography>
                  </Alert>
                </Snackbar>
              </Box>
              <InputBase
                value={userPrompt}
                placeholder="How much PTO does Alice have?"
                size="small"
                multiline
                maxRows={4}
                sx={{ width: "calc(100% - 48px)" }}
                disabled={loading || !!processing || !authenticated}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
              />
              <Tooltip title={error} placement="top" color="warning">
                <span>
                  <IconButton
                    onClick={handleSubmit}
                    disabled={loading || !!processing}
                  >
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            {!!processing && (
              <Stack
                direction="row"
                gap={2}
                alignItems="center"
                sx={{
                  position: "absolute",
                  bottom: "50px",
                  background: Colors.background.paper,
                  borderRadius: "10px",
                  padding: "12px 20px",
                  opacity: "0.8",
                  alignSelf: "center",
                }}
              >
                <Typography variant="body2">{processing}</Typography>
                <CircularProgress
                  size="20px"
                  sx={{ color: Colors.secondary }}
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ChatWindow;
