"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { useTranslations } from "next-intl";
import type { UserGroup } from "@/lib/user-groups-api";

export interface GroupsTransferListProps {
  allGroups: UserGroup[];
  assignedGroupIds: number[];
  onChange: (groupIds: number[]) => void;
  disabled?: boolean;
}

function GroupList({
  title,
  groups,
  checkedIds,
  onToggle,
  disabled,
}: {
  title: string;
  groups: UserGroup[];
  checkedIds: Set<number>;
  onToggle: (id: number) => void;
  disabled?: boolean;
}) {
  return (
    <Card variant="outlined" sx={{ width: 280 }}>
      <Typography variant="subtitle2" sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
        {title} ({groups.length})
      </Typography>
      <List dense sx={{ height: 280, overflow: "auto" }}>
        {groups.map((group) => (
          <ListItemButton
            key={group.id}
            onClick={() => onToggle(group.id)}
            disabled={disabled}
            dense
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checkedIds.has(group.id)}
                tabIndex={-1}
                disableRipple
                disabled={disabled}
              />
            </ListItemIcon>
            <ListItemText primary={group.name} />
          </ListItemButton>
        ))}
      </List>
    </Card>
  );
}

export function GroupsTransferList({
  allGroups,
  assignedGroupIds,
  onChange,
  disabled,
}: GroupsTransferListProps) {
  const t = useTranslations("UsersPage");
  const assignedIds = useMemo(() => new Set(assignedGroupIds), [assignedGroupIds]);

  const available = useMemo(
    () => allGroups.filter((group) => !assignedIds.has(group.id)),
    [allGroups, assignedIds],
  );
  const assigned = useMemo(
    () => allGroups.filter((group) => assignedIds.has(group.id)),
    [allGroups, assignedIds],
  );

  const [checkedAvailable, setCheckedAvailable] = useState<Set<number>>(new Set());
  const [checkedAssigned, setCheckedAssigned] = useState<Set<number>>(new Set());

  const toggle = (set: Set<number>, setSet: (next: Set<number>) => void, id: number) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSet(next);
  };

  const moveToAssigned = (ids: Iterable<number>) => {
    const next = new Set(assignedIds);
    for (const id of ids) next.add(id);
    onChange([...next]);
    setCheckedAvailable(new Set());
  };

  const moveToAvailable = (ids: Iterable<number>) => {
    const next = new Set(assignedIds);
    for (const id of ids) next.delete(id);
    onChange([...next]);
    setCheckedAssigned(new Set());
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <GroupList
        title={t("availableGroupsLabel")}
        groups={available}
        checkedIds={checkedAvailable}
        onToggle={(id) => toggle(checkedAvailable, setCheckedAvailable, id)}
        disabled={disabled}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <IconButton
          size="small"
          disabled={disabled || available.length === 0}
          onClick={() => moveToAssigned(available.map((group) => group.id))}
          aria-label="move all to assigned"
        >
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
        <IconButton
          size="small"
          disabled={disabled || checkedAvailable.size === 0}
          onClick={() => moveToAssigned(checkedAvailable)}
          aria-label="move selected to assigned"
        >
          <KeyboardArrowRightIcon />
        </IconButton>
        <IconButton
          size="small"
          disabled={disabled || checkedAssigned.size === 0}
          onClick={() => moveToAvailable(checkedAssigned)}
          aria-label="move selected to available"
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          disabled={disabled || assigned.length === 0}
          onClick={() => moveToAvailable(assigned.map((group) => group.id))}
          aria-label="move all to available"
        >
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
      </Box>

      <GroupList
        title={t("assignedGroupsLabel")}
        groups={assigned}
        checkedIds={checkedAssigned}
        onToggle={(id) => toggle(checkedAssigned, setCheckedAssigned, id)}
        disabled={disabled}
      />
    </Box>
  );
}
