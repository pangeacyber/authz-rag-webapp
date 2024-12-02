import { css } from "@emotion/css";
import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { FC } from "react";
import { JsonView, darkStyles } from "react-json-view-lite";

import CollapsablePanel from "@/app/components/CollapsablePanel";
import { useChatContext } from "@/app/context";
import type { ResponseObject } from "@/app/proxy";
import { Colors } from "@/app/theme";

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

const PanelHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

const ResponsesSidePanel: FC<Props> = ({ onClose }) => {
  const { lastPromptGuardResponse, aiGuardResponses, authzResponses } =
    useChatContext();

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
      </Stack>
    </Stack>
  );
};

export default ResponsesSidePanel;
