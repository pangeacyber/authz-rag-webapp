import {
  LockOutlined,
  MediationOutlined,
  ReviewsOutlined,
} from "@mui/icons-material";
import { Stack } from "@mui/material";

import CollapsablePanel from "@/app/components/CollapsablePanel";
import { useChatContext } from "@/app/context";

import ServiceToggle from "./ServiceToggle";

const SecurityControls = () => {
  const {
    dataGuardEnabled,
    promptGuardEnabled,
    authzEnabled,
    setDataGuardEnabled,
    setPromptGuardEnabled,
    setAuthzEnabled,
  } = useChatContext();

  return (
    <CollapsablePanel title="Security">
      <Stack gap={1} py={1}>
        <ServiceToggle
          icon={<LockOutlined />}
          name="AuthZ"
          link="https://pangea.cloud/docs/api/authz"
          active={authzEnabled}
          type="toggle"
          changeHandler={() => {
            setAuthzEnabled(!authzEnabled);
          }}
        />

        <ServiceToggle
          icon={<MediationOutlined />}
          name="Prompt Guard"
          link="https://pangea.cloud/docs/api/prompt-guard"
          active={promptGuardEnabled}
          type="toggle"
          changeHandler={() => {
            setPromptGuardEnabled(!promptGuardEnabled);
          }}
        />

        <ServiceToggle
          icon={<ReviewsOutlined />}
          name="AI Guard"
          link="https://pangea.cloud/docs/api/data-guard"
          active={dataGuardEnabled}
          type="toggle"
          changeHandler={() => {
            setDataGuardEnabled(!dataGuardEnabled);
          }}
        />
      </Stack>
    </CollapsablePanel>
  );
};

export default SecurityControls;
