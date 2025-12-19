"use client";

import React from "react";
import { ThemeProvider, CssBaseline, createTheme, responsiveFontSizes } from "@mui/material";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  const theme = React.useMemo(() => {
    const baseTheme = createTheme({
      palette: {
        mode: "light",
        primary: {
          main: "#081e31",
          contrastText: "#ffffff",
        },
        background: {
          default: "#ffffff",
          paper: "#ffffff",
        },
      },
      shape: { borderRadius: 8 },
      typography: {
        fontFamily: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "sans-serif",
        ].join(","),
      },
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: { root: { textTransform: "none", borderRadius: 8 } },
        },
      },
    });
    return responsiveFontSizes(baseTheme);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}