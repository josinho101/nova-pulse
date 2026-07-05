"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/common/Toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UsersTable } from "@/components/users/UsersTable";
import { deleteUser, listUsers, type User, type UserSortField } from "@/lib/users-api";
import { listUserTypes, type UserType } from "@/lib/user-types-api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function UsersListPage() {
  const t = useTranslations("UsersPage");
  const { notify, toast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<UserSortField>("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const fetchUsers = useCallback(
    async (signal?: AbortSignal) => {
      const result = await listUsers(page + 1, pageSize, sortBy, sortOrder, debouncedSearch, signal);
      if (signal?.aborted) return;
      if (result.ok) {
        setUsers(result.data.items);
        setTotal(result.data.total);
      } else {
        notify(result.message, "error");
      }
    },
    [notify, page, pageSize, sortBy, sortOrder, debouncedSearch],
  );

  const fetchUserTypes = useCallback(
    async (signal?: AbortSignal) => {
      const result = await listUserTypes(signal);
      if (signal?.aborted) return;
      if (result.ok) {
        setUserTypes(result.data);
      } else {
        notify(result.message, "error");
      }
    },
    [notify],
  );

  useEffect(() => {
    const controller = new AbortController();
    startTransition(() => {
      setLoading(true);
      void Promise.all([fetchUsers(controller.signal), fetchUserTypes(controller.signal)]).finally(
        () => {
          if (!controller.signal.aborted) setLoading(false);
        },
      );
    });
    return () => controller.abort();
  }, [fetchUsers, fetchUserTypes, startTransition]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const userTypeNameById = useMemo(
    () => new Map(userTypes.map((userType) => [userType.id, userType.name])),
    [userTypes],
  );

  const handleAddClick = () => {
    router.push("/users/new");
  };

  const handleEditClick = (user: User) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleDeleteRequest = (user: User) => {
    setConfirmDeleteTarget(user);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget) return;

    setDeleting(true);
    const result = await deleteUser(confirmDeleteTarget.id);
    setDeleting(false);
    setConfirmDeleteTarget(null);

    if (result.ok) {
      notify(t("deleteSuccess"), "success");
      void fetchUsers();
    } else {
      notify(result.message, "error");
    }
  };

  const confirmDeleteName = confirmDeleteTarget
    ? `${confirmDeleteTarget.firstName} ${confirmDeleteTarget.lastName}`
    : "";

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t("title")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: 360 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
            {t("addButton")}
          </Button>
        </Box>
      </Box>

      <UsersTable
        users={users}
        userTypeNameById={userTypeNameById}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onEdit={handleEditClick}
        onDeleteRequest={handleDeleteRequest}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(0);
        }}
        onSortChange={(newSortBy, newSortOrder) => {
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
          setPage(0);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteTarget !== null}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription", { name: confirmDeleteName })}
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirmDeleteTarget(null)}
      />

      {toast}
    </>
  );
}
