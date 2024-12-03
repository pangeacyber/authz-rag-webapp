import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import { IconButton, Stack, Typography } from "@mui/material";
import type { FC } from "react";

import LoginWidget from "@/app/components/LoginWidget";
import PangeaLogo from "@/app/components/Logo";
import { PanelHeader } from "@/app/components/PanelHeader";
import { Colors } from "@/app/theme";

import SecurityControls from "./components/SecurityControls";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SidePanel: FC<Props> = ({ onClose }) => {
  return (
    <Stack
      justifyContent="space-between"
      sx={{
        height: "100%",
        background: Colors.background.default,
      }}
    >
      <Stack ml="20px">
        <PanelHeader>
          <Stack direction="row" gap={1} p="24px 20px">
            <PangeaLogo />
            <Typography variant="h6">Pangea Chat</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <ViewSidebarOutlinedIcon sx={{ color: Colors.icons }} />
          </IconButton>
        </PanelHeader>
        <SecurityControls />
      </Stack>
      <LoginWidget />
    </Stack>
  );
};

export default SidePanel;
