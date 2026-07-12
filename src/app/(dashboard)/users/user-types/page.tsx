"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/common/Toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserTypesTable } from "@/components/user-types/UserTypesTable";
import { UserTypeFormDialog } from "@/components/user-types/UserTypeFormDialog";
import { deleteUserType, listUserTypes, type UserType } from "@/lib/user-types-api";

export default function UserTypesPage() {
  const t = useTranslations("UserTypesPage");
  const { notify, toast } = useToast();

  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUserType, setEditingUserType] = useState<UserType | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<UserType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [, startTransition] = useTransition();

  const fetchUserTypes = useCallback(async () => {
    const result = await listUserTypes();
    if (result.ok) {
      setUserTypes(result.data);
    } else {
      notify(result.message, "error");
    }
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    startTransition(() => {
      void fetchUserTypes();
    });
  }, [fetchUserTypes, startTransition]);

  const handleAddClick = () => {
    setEditingUserType(null);
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleEditClick = (userType: UserType) => {
    setEditingUserType(userType);
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleDialogSuccess = (_saved: UserType, mode: "add" | "edit") => {
    setDialogOpen(false);
    notify(mode === "add" ? t("createSuccess") : t("updateSuccess"), "success");
    void fetchUserTypes();
  };

  const handleDialogError = (message: string) => {
    notify(message, "error");
  };

  const handleDeleteRequest = (userType: UserType) => {
    setConfirmDeleteTarget(userType);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget) return;

    setDeleting(true);
    const result = await deleteUserType(confirmDeleteTarget.id);
    setDeleting(false);
    setConfirmDeleteTarget(null);

    if (result.ok) {
      notify(t("deleteSuccess"), "success");
      void fetchUserTypes();
    } else {
      notify(result.message, "error");
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t("title")}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          {t("addButton")}
        </Button>
      </Box>

      <UserTypesTable
        userTypes={userTypes}
        loading={loading}
        onEdit={handleEditClick}
        onDeleteRequest={handleDeleteRequest}
      />

      <UserTypeFormDialog
        key={dialogKey}
        open={dialogOpen}
        userType={editingUserType}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        onError={handleDialogError}
      />

      <ConfirmDialog
        open={confirmDeleteTarget !== null}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription", { name: confirmDeleteTarget?.name ?? "" })}
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirmDeleteTarget(null)}
      />

      {toast}
    </>
  );
}
