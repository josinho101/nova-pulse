"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { createUserType, updateUserType, type UserType } from "@/lib/user-types-api";

export interface UserTypeFormDialogProps {
  open: boolean;
  userType: UserType | null;
  onClose: () => void;
  onSuccess: (savedUserType: UserType, mode: "add" | "edit") => void;
  onError: (message: string) => void;
}

export function UserTypeFormDialog({
  open,
  userType,
  onClose,
  onSuccess,
  onError,
}: UserTypeFormDialogProps) {
  const t = useTranslations("UserTypesPage");
  const mode: "add" | "edit" = userType ? "edit" : "add";
  const [name, setName] = useState(userType?.name ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError(t("nameRequired"));
      return;
    }
    if (trimmed.length > 20) {
      setFieldError(t("nameTooLong"));
      return;
    }

    setSubmitting(true);
    setFieldError(null);

    const result =
      mode === "edit" && userType
        ? await updateUserType(userType.id, { name: trimmed })
        : await createUserType({ name: trimmed });

    setSubmitting(false);

    if (result.ok) {
      onSuccess(result.data, mode);
      return;
    }

    const nameFieldError = result.fields?.find((field) => field.path === "name")?.message;
    setFieldError(nameFieldError ?? result.message);
    onError(nameFieldError ?? result.message);
  };

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (submitting || reason === "backdropClick") return;
        onClose();
      }}
      fullWidth
      maxWidth="xs"
    >
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <DialogTitle sx={{ position: "relative", pr: 6 }}>
          {mode === "edit" ? t("editTitle") : t("addTitle")}
          <IconButton
            onClick={onClose}
            disabled={submitting}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t("nameLabel")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={!!fieldError}
            helperText={fieldError ?? " "}
            disabled={submitting}
            slotProps={{ htmlInput: { maxLength: 20 } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            {t("save")}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
