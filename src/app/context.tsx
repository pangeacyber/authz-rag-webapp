import {
  type FC,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface ChatContextProps {
  loading: boolean;
  systemPrompt: string;
  userPrompt: string;
  promptGuardEnabled: boolean;
  dataGuardEnabled: boolean;
  sidePanelOpen: boolean;
  authzEnabled: boolean;
  loginOpen: boolean;
  lastPromptGuardResponse: object;
  aiGuardResponses: readonly [object, object];
  authzResponses: readonly object[];
  setLoading: (value: boolean) => void;
  setSystemPrompt: (value: string) => void;
  setUserPrompt: (value: string) => void;
  setPromptGuardEnabled: (value: boolean) => void;
  setDataGuardEnabled: (value: boolean) => void;
  setSidePanelOpen: (value: boolean) => void;
  setAuthzEnabled: (value: boolean) => void;
  setLoginOpen: (value: boolean) => void;
  setLastPromptGuardResponse: (value: object) => void;
  setAiGuardResponses: (value: readonly [object, object]) => void;
  setAuthzResponses: (value: readonly object[]) => void;
}

const ChatContext = createContext<ChatContextProps>({
  loading: false,
  systemPrompt: "",
  userPrompt: "",
  promptGuardEnabled: true,
  dataGuardEnabled: true,
  sidePanelOpen: true,
  authzEnabled: false,
  loginOpen: false,
  lastPromptGuardResponse: {},
  aiGuardResponses: [{}, {}],
  authzResponses: [],
  setLoading: () => {},
  setSystemPrompt: () => {},
  setUserPrompt: () => {},
  setPromptGuardEnabled: () => {},
  setDataGuardEnabled: () => {},
  setSidePanelOpen: () => {},
  setAuthzEnabled: () => {},
  setLoginOpen: () => {},
  setLastPromptGuardResponse: () => {},
  setAiGuardResponses: () => {},
  setAuthzResponses: () => {},
});

export interface ChatProviderProps {
  children?: ReactNode;
}

export interface ChatMessage {
  hash: string;
  type: string;
  context?: unknown;
  input?: string;
  output?: string;
  findings?: string;

  // biome-ignore lint/style/useNamingConvention: matches API response
  malicious_count?: number;
}

const SYSTEM_PROMPT_KEY = "system_prompt";
const USER_PROMPT_KEY = "user_prompt";

export const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const mounted = useRef(false);

  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You're a helpful assistant.",
  );
  const [userPrompt, setUserPrompt] = useState("");
  const [authzEnabled, setAuthzEnabled] = useState(false);
  const [promptGuardEnabled, setPromptGuardEnabled] = useState(false);
  const [dataGuardEnabled, setDataGuardEnabled] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [lastPromptGuardResponse, setLastPromptGuardResponse] = useState({});
  const [aiGuardResponses, setAiGuardResponses] = useState<
    readonly [object, object]
  >([{}, {}]);
  const [authzResponses, setAuthzResponses] = useState<readonly object[]>([]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      const storedUserPrompt = localStorage.getItem(USER_PROMPT_KEY);
      if (storedUserPrompt) {
        setUserPrompt(storedUserPrompt);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SYSTEM_PROMPT_KEY, systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem(USER_PROMPT_KEY, userPrompt);
  }, [userPrompt]);

  const memoData = useMemo(
    () => ({
      loading,
      systemPrompt,
      userPrompt,
      promptGuardEnabled,
      dataGuardEnabled,
      sidePanelOpen,
      authzEnabled,
      loginOpen,
      lastPromptGuardResponse,
      aiGuardResponses,
      authzResponses,
      setLoading,
      setSystemPrompt,
      setUserPrompt,
      setPromptGuardEnabled,
      setDataGuardEnabled,
      setSidePanelOpen,
      setAuthzEnabled,
      setLoginOpen,
      setLastPromptGuardResponse,
      setAiGuardResponses,
      setAuthzResponses,
    }),
    [
      loading,
      systemPrompt,
      userPrompt,
      promptGuardEnabled,
      dataGuardEnabled,
      sidePanelOpen,
      authzEnabled,
      loginOpen,
      lastPromptGuardResponse,
      aiGuardResponses,
      authzResponses,
    ],
  );

  return (
    <ChatContext.Provider value={memoData}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
