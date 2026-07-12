"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#3874ff", dark: "#003cc7" },
        success: { main: "#25b003" },
        info: { main: "#0097eb" },
        warning: { main: "#e5780b" },
        error: { main: "#fa3b1d" },
        background: { default: "#f5f7fa", paper: "#ffffff" },
        text: { primary: "#31374a", secondary: "#525b75" },
        divider: "#cbd0dd",
      },
    },
    dark: {
      palette: {
        primary: { main: "#3874ff", dark: "#85a9ff" },
        success: { main: "#25b003" },
        info: { main: "#0097eb" },
        warning: { main: "#e5780b" },
        error: { main: "#fa3b1d" },
        background: { default: "#0f111a", paper: "#141824" },
        text: { primary: "#9fa6bc", secondary: "#9fa6bc" },
        divider: "#373e53",
      },
    },
  },
  typography: {
    fontFamily: "var(--font-nunito-sans)",
  },
  shape: { borderRadius: 6 },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => theme.applyStyles("dark", { backgroundColor: "#000000" }),
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiFormControl: {
      defaultProps: { size: "small" },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },
    MuiButton: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        sizeSmall: { paddingTop: 0, paddingBottom: 0 },
        input: ({ ownerState }) =>
          ownerState.size === "small"
            ? { paddingTop: 5.5, paddingBottom: 5.5 }
            : {},
      },
    },
  },
});

export default theme;
