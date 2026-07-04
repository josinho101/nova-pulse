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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/date";
import type { User } from "@/lib/users-api";

export interface UsersTableProps {
  users: User[];
  userTypeNameById: Map<number, string>;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  order: "asc" | "desc";
  onEdit: (user: User) => void;
  onDeleteRequest: (user: User) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (order: "asc" | "desc") => void;
}

export function UsersTable({
  users,
  userTypeNameById,
  loading,
  page,
  pageSize,
  total,
  order,
  onEdit,
  onDeleteRequest,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: UsersTableProps) {
  const t = useTranslations("UsersPage");

  const handleSort = () => {
    onSortChange(order === "asc" ? "desc" : "asc");
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
              <TableCell>{t("columnFirstName")}</TableCell>
              <TableCell sortDirection={order}>
                <TableSortLabel active direction={order} onClick={handleSort}>
                  {t("columnLastName")}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t("columnEmail")}</TableCell>
              <TableCell>{t("columnUserType")}</TableCell>
              <TableCell>{t("columnCreatedAt")}</TableCell>
              <TableCell>{t("columnUpdatedAt")}</TableCell>
              <TableCell>{t("columnCreatedBy")}</TableCell>
              <TableCell>{t("columnUpdatedBy")}</TableCell>
              <TableCell align="right">{t("columnActions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t("noUsers")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
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
