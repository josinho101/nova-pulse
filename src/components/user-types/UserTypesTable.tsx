"use client";

import { useMemo, useState, type ChangeEvent } from "react";
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
import type { UserType } from "@/lib/user-types-api";

export interface UserTypesTableProps {
  userTypes: UserType[];
  loading: boolean;
  onEdit: (userType: UserType) => void;
  onDeleteRequest: (userType: UserType) => void;
}

const DEFAULT_ROWS_PER_PAGE = 10;

type UserTypeSortField = "name" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy";

export function UserTypesTable({ userTypes, loading, onEdit, onDeleteRequest }: UserTypesTableProps) {
  const t = useTranslations("UserTypesPage");
  const [sortBy, setSortBy] = useState<UserTypeSortField>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const sortedRows = useMemo(() => {
    const rows = [...userTypes];
    rows.sort((a, b) => {
      const comparison = a[sortBy].localeCompare(b[sortBy]);
      return order === "asc" ? comparison : -comparison;
    });
    return rows;
  }, [userTypes, sortBy, order]);

  const maxPage = Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const handleSort = (field: UserTypeSortField) => {
    if (field === sortBy) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const pagedRows = sortedRows.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage,
  );

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortBy === "name" ? order : false}>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  {t("columnName")}
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === "createdAt" ? order : false}>
                <TableSortLabel
                  active={sortBy === "createdAt"}
                  direction={sortBy === "createdAt" ? order : "asc"}
                  onClick={() => handleSort("createdAt")}
                >
                  {t("columnCreatedAt")}
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === "updatedAt" ? order : false}>
                <TableSortLabel
                  active={sortBy === "updatedAt"}
                  direction={sortBy === "updatedAt" ? order : "asc"}
                  onClick={() => handleSort("updatedAt")}
                >
                  {t("columnUpdatedAt")}
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === "createdBy" ? order : false}>
                <TableSortLabel
                  active={sortBy === "createdBy"}
                  direction={sortBy === "createdBy" ? order : "asc"}
                  onClick={() => handleSort("createdBy")}
                >
                  {t("columnCreatedBy")}
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === "updatedBy" ? order : false}>
                <TableSortLabel
                  active={sortBy === "updatedBy"}
                  direction={sortBy === "updatedBy" ? order : "asc"}
                  onClick={() => handleSort("updatedBy")}
                >
                  {t("columnUpdatedBy")}
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">{t("columnActions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t("noUserTypes")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((userType) => (
                <TableRow key={userType.id} hover>
                  <TableCell>{userType.name}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(userType.createdAt)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(userType.updatedAt)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{userType.createdBy}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{userType.updatedBy}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Tooltip title={t("edit")}>
                        <IconButton size="small" onClick={() => onEdit(userType)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("delete")}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteRequest(userType)}
                        >
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
        count={sortedRows.length}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}
