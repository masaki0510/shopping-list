"use client";

import * as React from "react";
import { CssBaseline } from "@mui/material";
import { CssVarsProvider, extendTheme } from "@mui/material/styles";


// Material Design 3 っぽい設計（色は後で差し替え可）
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#6750A4" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#D0BCFF" },
      },
    },
  },
  shape: { borderRadius: 16 }, // M3らしく角丸強め
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiButton: { defaultProps: { variant: "contained" } },
    MuiTextField: { defaultProps: { variant: "outlined" } },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
