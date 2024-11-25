// Copyright 2021 Pangea Cyber Corporation
// Author: Pangea Cyber Corporation

import { createTheme } from "@mui/material/styles";

export const Colors = {
  primary: "#6900A5",
  secondary: "#29ADEB",
  contrast: "#FFFFFF",
  text: {
    primary: "#FFFFFF",
    secondary: "#94979C",
  },
  background: {
    paper: "#282A2C",
    default: "#141719",
  },
  icons: "#94979C",
  borders: "#797C7F",
  card: "#16181A",
  jsonView: {
    container: "rgb(38, 12, 59)",
    label: "rgb(248, 194, 102)",
    stringValue: "rgb(255, 255, 255)",
  },
};

const PangeaDark = () => {
  const theme = createTheme({
    typography: {
      fontFamily: "Inter, sans-serif",
      h1: {
        fontFamily: "Space Grotesk",
        fontSize: "40px",
        fontWeight: "400",
        lineHeight: "50px",
        background: "linear-gradient(90deg, #551B76 0%, #29ADEB 100%)",
        backgroundClip: "text",
        color: "transparent",
        filter: "brightness(120%)",
      },
      h6: {
        fontSize: "1rem",
      },
      body2: {
        color: Colors.text.secondary,
        lineHeight: 1.5,
      },
    },
    palette: {
      mode: "dark",
      primary: {
        main: Colors.primary,
      },
      secondary: {
        main: Colors.secondary,
      },
      text: {
        ...Colors.text,
      },
      background: {
        ...Colors.background,
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 10,
    },
    components: {
      // biome-ignore lint/style/useNamingConvention: matches component name
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            "&.MuiTab-root.Mui-selected": {
              color: Colors.secondary,
            },
          },
        },
      },
      // biome-ignore lint/style/useNamingConvention: matches component name
      MuiTabs: {
        styleOverrides: {
          root: {
            ".MuiTabs-indicator": {
              backgroundColor: Colors.secondary,
            },
          },
        },
      },
      // biome-ignore lint/style/useNamingConvention: matches component name
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "50px",
            textTransform: "none",
            variants: [
              {
                props: { variant: "outlined" },
                style: {
                  color: Colors.borders,
                  borderColor: Colors.borders,
                  "&:hover": {
                    color: Colors.icons,
                    borderColor: Colors.icons,
                    background: "transparent",
                  },
                },
              },
              {
                props: { variant: "contained" },
                style: {
                  color: Colors.borders,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: Colors.borders,
                  background: "transparent",
                  "&:hover": {
                    color: Colors.icons,
                    borderColor: Colors.icons,
                    background: "transparent",
                  },
                },
              },
            ],
          },
        },
      },
      // biome-ignore lint/style/useNamingConvention: matches component name
      MuiInputBase: {
        styleOverrides: {
          root: {
            ".Mui-selected": {
              outline: "none",
            },
            "&.MuiOutlinedInput-root.Mui-focused fieldset": {
              borderColor: Colors.icons,
              borderWidth: "1px",
            },
          },
        },
      },
      // biome-ignore lint/style/useNamingConvention: matches component name
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: "60px",
            alignItems: "center",
            ".MuiButtonBase-root": {
              transform: "translateX(6px)",
              "&.Mui-checked": {
                transform: "translateX(20px)",
              },
            },
            ".MuiSwitch-thumb": {
              marginTop: "2px",
              height: "16px",
              width: "16px",
              color: Colors.contrast,
            },
            ".MuiSwitch-track": {
              height: "20px",
              borderRadius: "10px",
              opacity: "1!important",
              background: Colors.background.paper,
              border: `1px solid ${Colors.icons}`,
            },
            ".Mui-checked + .MuiSwitch-track": {
              border: `1px solid ${Colors.secondary}`,
            },
          },
        },
      },
      // biome-ignore lint/style/useNamingConvention: matches component name
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: Colors.icons,
            variants: [
              {
                props: { color: "active" },
                style: {
                  color: Colors.secondary,
                },
              },
            ],
          },
        },
      },
    },
  });

  return theme;
};

export default PangeaDark;
