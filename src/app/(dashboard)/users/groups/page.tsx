"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/common/Toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserGroupsTable } from "@/components/user-groups/UserGroupsTable";
import { UserGroupFormDialog } from "@/components/user-groups/UserGroupFormDialog";
import { deleteUserGroup, listUserGroups, type UserGroup } from "@/lib/user-groups-api";

export default function UserGroupsPage() {
  const t = useTranslations("UserGroupsPage");
  const { notify, toast } = useToast();

  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUserGroup, setEditingUserGroup] = useState<UserGroup | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<UserGroup | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [, startTransition] = useTransition();

  const fetchUserGroups = useCallback(async () => {
    const result = await listUserGroups();
    if (result.ok) {
      setUserGroups(result.data);
    } else {
      notify(result.message, "error");
    }
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    startTransition(() => {
      void fetchUserGroups();
    });
  }, [fetchUserGroups, startTransition]);

  const handleAddClick = () => {
    setEditingUserGroup(null);
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleEditClick = (userGroup: UserGroup) => {
    setEditingUserGroup(userGroup);
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleDialogSuccess = (_saved: UserGroup, mode: "add" | "edit") => {
    setDialogOpen(false);
    notify(mode === "add" ? t("createSuccess") : t("updateSuccess"), "success");
    void fetchUserGroups();
  };

  const handleDialogError = (message: string) => {
    notify(message, "error");
  };

  const handleDeleteRequest = (userGroup: UserGroup) => {
    setConfirmDeleteTarget(userGroup);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget) return;

    setDeleting(true);
    const result = await deleteUserGroup(confirmDeleteTarget.id);
    setDeleting(false);
    setConfirmDeleteTarget(null);

    if (result.ok) {
      notify(t("deleteSuccess"), "success");
      void fetchUserGroups();
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

      <UserGroupsTable
        userGroups={userGroups}
        loading={loading}
        onEdit={handleEditClick}
        onDeleteRequest={handleDeleteRequest}
      />

      <UserGroupFormDialog
        key={dialogKey}
        open={dialogOpen}
        userGroup={editingUserGroup}
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
