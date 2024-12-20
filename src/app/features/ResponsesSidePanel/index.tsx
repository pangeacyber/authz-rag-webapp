import { css } from "@emotion/css";
import { GlobalStyles, Stack, Typography } from "@mui/material";
import { type FC, type JSX, useLayoutEffect, useState } from "react";
import { JsonView, darkStyles } from "react-json-view-lite";

import CollapsablePanel from "@/app/components/CollapsablePanel";
import { PanelHeader } from "@/app/components/PanelHeader";
import { useChatContext } from "@/app/context";
import type { ResponseObject } from "@/app/proxy";
import { Colors } from "@/app/theme";

import { highlight } from "./utils";

import "react-json-view-lite/dist/index.css";

const reactJsonViewStyles = {
  ...darkStyles,
  container: css`
    background-color: ${Colors.jsonView.container};
    border-radius: 10px;
  `,
  label: css`color: ${Colors.jsonView.label};`,
  stringValue: css`color: ${Colors.jsonView.stringValue};`,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const SampleCode: FC = () => {
  const [nodes, setNodes] = useState<JSX.Element | null>(null);

  useLayoutEffect(() => {
    highlight(`docs = await Promise.all(
  docs.map(async (doc) => {
    const response = await authz.check({
      subject: { type: "user", id: username },
      action: "read",
      resource: { type: "file", id: doc.id }
    });
    return response.result.allowed ? doc : null;
  }),
).then((results) =>
  results.filter((doc) => doc !== null)
);
`).then(setNodes);
  }, []);

  return nodes ?? <p>Loading...</p>;
};

const ResponsesSidePanel: FC<Props> = ({ onClose }) => {
  const {
    lastPromptGuardResponse,
    aiGuardResponses,
    authzResponses,
    documents,
  } = useChatContext();

  return (
    <Stack
      justifyContent="space-between"
      sx={{
        height: "400%",
        background: Colors.background.default,
      }}
    >
      <Stack ml="20px">
        <PanelHeader>
          <Stack direction="row" gap={1} p="24px 20px">
            <Typography variant="h6">Responses</Typography>
          </Stack>
        </PanelHeader>

        <CollapsablePanel title="Prompt Guard">
          <Stack gap={1} py={1} fontFamily="monospace">
            <JsonView
              data={lastPromptGuardResponse}
              style={reactJsonViewStyles}
            />
          </Stack>
        </CollapsablePanel>

        <CollapsablePanel title="AI Guard">
          <Stack gap={1} py={1} fontFamily="monospace">
            {aiGuardResponses.map((response) => (
              <JsonView
                key={(response as ResponseObject<unknown>).request_id}
                data={response}
                style={reactJsonViewStyles}
              />
            ))}
          </Stack>
        </CollapsablePanel>

        <CollapsablePanel title="AuthZ">
          <Stack gap={1} py={1} fontFamily="monospace">
            {authzResponses.map((response) => (
              <JsonView
                key={(response as ResponseObject<unknown>).request_id}
                data={response}
                style={reactJsonViewStyles}
              />
            ))}
          </Stack>
        </CollapsablePanel>

        <CollapsablePanel title="Documents">
          <Stack gap={1} py={1} fontFamily="monospace">
            {documents.map(({ id, pageContent }) => (
              <pre key={id}>{pageContent}</pre>
            ))}
          </Stack>
        </CollapsablePanel>

        <CollapsablePanel title="Sample code">
          <Stack gap={1} py={1} fontFamily="monospace">
            <GlobalStyles
              styles={{
                pre: {
                  borderRadius: "10px",
                  margin: 0,
                  padding: "7px",
                },
              }}
            />
            <SampleCode />
          </Stack>
        </CollapsablePanel>
      </Stack>
    </Stack>
  );
};

export default ResponsesSidePanel;
