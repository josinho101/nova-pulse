"use client";

import { useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type Severity = "success" | "error";

interface ToastState {
  open: boolean;
  message: string;
  severity: Severity;
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ open: false, message: "", severity: "success" });

  const notify = useCallback((message: string, severity: Severity) => {
    setState({ open: true, message, severity });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const toast = (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={close}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={close} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { notify, toast };
}
