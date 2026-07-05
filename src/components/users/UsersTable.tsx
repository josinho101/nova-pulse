"use client";

import type { ChangeEvent } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/date";
import type { User, UserSortField } from "@/lib/users-api";

export interface UsersTableProps {
  users: User[];
  userTypeNameById: Map<number, string>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  sortBy: UserSortField;
  sortOrder: "asc" | "desc";
  onEdit: (user: User) => void;
  onDeleteRequest: (user: User) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: UserSortField, sortOrder: "asc" | "desc") => void;
}

export function UsersTable({
  users,
  userTypeNameById,
  loading,
  page,
  pageSize,
  total,
  sortBy,
  sortOrder,
  onEdit,
  onDeleteRequest,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: UsersTableProps) {
  const t = useTranslations("UsersPage");

  const handleSort = (field: UserSortField) => {
    if (field === sortBy) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "asc");
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {(
                [
                  ["firstName", "columnFirstName"],
                  ["lastName", "columnLastName"],
                  ["email", "columnEmail"],
                  ["phone", "columnPhone"],
                  ["userType", "columnUserType"],
                  ["createdAt", "columnCreatedAt"],
                  ["updatedAt", "columnUpdatedAt"],
                  ["createdBy", "columnCreatedBy"],
                  ["updatedBy", "columnUpdatedBy"],
                ] as [UserSortField, string][]
              ).map(([field, labelKey]) => (
                <TableCell key={field} sortDirection={sortBy === field ? sortOrder : false}>
                  <TableSortLabel
                    active={sortBy === field}
                    direction={sortBy === field ? sortOrder : "asc"}
                    onClick={() => handleSort(field)}
                  >
                    {t(labelKey)}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">{t("columnActions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t("noUsers")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => onEdit(user)}
                    >
                      {user.firstName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => onEdit(user)}
                    >
                      {user.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone ?? "-"}</TableCell>
                  <TableCell>{userTypeNameById.get(user.typeId) ?? "-"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(user.createdAt)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(user.updatedAt)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{user.createdBy}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{user.updatedBy}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Tooltip title={t("edit")}>
                        <IconButton size="small" onClick={() => onEdit(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("delete")}>
                        <IconButton size="small" color="error" onClick={() => onDeleteRequest(user)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}
