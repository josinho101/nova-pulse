"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/common/Toast";
import { createUser, updateUser, type User } from "@/lib/users-api";
import type { UserType } from "@/lib/user-types-api";
import { saveUserLogin, disableUserLogin, type UserLoginSummary } from "@/lib/user-login-api";
import { setGroupsForUser, type UserGroup } from "@/lib/user-groups-api";
import { GroupsTransferList } from "@/components/users/GroupsTransferList";

export interface UserFormPageProps {
  mode: "add" | "edit";
  user: User | null;
  userTypeOptions: UserType[];
  userLogin: UserLoginSummary | null;
  allGroups: UserGroup[];
  assignedGroupIds: number[];
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  phone?: string;
  email?: string;
  typeId?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]+$/;

function TabPanel({ value, index, children }: { value: number; index: number; children: ReactNode }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

export function UserFormPage({
  mode,
  user,
  userTypeOptions,
  userLogin,
  allGroups,
  assignedGroupIds,
}: UserFormPageProps) {
  const t = useTranslations("UsersPage");
  const router = useRouter();
  const { notify, toast } = useToast();

  const [tab, setTab] = useState(0);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [middleName, setMiddleName] = useState(user?.middleName ?? "");
  const [dob, setDob] = useState(user?.dob ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [typeId, setTypeId] = useState<number | "">(user?.typeId ?? "");
  const [authEnabled, setAuthEnabled] = useState(userLogin !== null);
  const [username, setUsername] = useState(userLogin?.username ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forcePasswordChange, setForcePasswordChange] = useState(
    userLogin?.forcePasswordChange ?? false,
  );
  const [groupIds, setGroupIds] = useState<number[]>(assignedGroupIds);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    const errors: FieldErrors = {};
    if (!trimmedFirstName) errors.firstName = t("firstNameRequired");
    if (!trimmedLastName) errors.lastName = t("lastNameRequired");
    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) errors.phone = t("phoneInvalid");
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) errors.email = t("emailInvalid");
    if (typeId === "") errors.typeId = t("userTypeRequired");

    if (authEnabled) {
      if (!trimmedUsername) errors.username = t("usernameRequired");
      if (!password && !userLogin) errors.password = t("passwordRequired");
      if (password && password !== confirmPassword) {
        errors.confirmPassword = t("passwordsDoNotMatch");
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTab(errors.username || errors.password || errors.confirmPassword ? 1 : 0);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    const input = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      middleName: middleName.trim() || undefined,
      dob: dob || undefined,
      address: trimmedAddress || undefined,
      phone: trimmedPhone || undefined,
      email: trimmedEmail || undefined,
      typeId: typeId as number,
    };

    const result =
      mode === "edit" && user ? await updateUser(user.id, input) : await createUser(input);

    if (!result.ok) {
      setSubmitting(false);
      const knownFields = [
        "firstName",
        "lastName",
        "dob",
        "address",
        "phone",
        "email",
        "typeId",
      ] as const;
      const nextFieldErrors: FieldErrors = {};
      for (const field of result.fields ?? []) {
        if ((knownFields as readonly string[]).includes(field.path)) {
          nextFieldErrors[field.path as (typeof knownFields)[number]] = field.message;
        }
      }

      setFieldErrors(nextFieldErrors);
      setTab(0);
      notify(result.fields?.[0]?.message ?? result.message, "error");
      return;
    }

    const savedUserId = result.data.id;

    if (authEnabled) {
      const credentialsResult = await saveUserLogin(savedUserId, {
        username: trimmedUsername,
        password: password || undefined,
        forcePasswordChange,
      });

      setSubmitting(false);

      if (!credentialsResult.ok) {
        const credentialsKnownFields = ["username", "password", "confirmPassword"] as const;
        const nextFieldErrors: FieldErrors = {};
        for (const field of credentialsResult.fields ?? []) {
          if ((credentialsKnownFields as readonly string[]).includes(field.path)) {
            nextFieldErrors[field.path as (typeof credentialsKnownFields)[number]] =
              field.message;
          }
        }

        setFieldErrors(nextFieldErrors);
        setTab(1);
        notify(credentialsResult.fields?.[0]?.message ?? credentialsResult.message, "error");
        return;
      }
    } else if (userLogin) {
      const disableResult = await disableUserLogin(savedUserId);
      setSubmitting(false);

      if (!disableResult.ok) {
        setTab(1);
        notify(disableResult.message, "error");
        return;
      }
    } else {
      setSubmitting(false);
    }

    const originalGroupIds = new Set(assignedGroupIds);
    const groupIdsChanged =
      groupIds.length !== assignedGroupIds.length ||
      groupIds.some((id) => !originalGroupIds.has(id));

    if (groupIdsChanged) {
      const groupsResult = await setGroupsForUser(savedUserId, groupIds);

      if (!groupsResult.ok) {
        setTab(2);
        notify(t("groupsSaveError"), "error");
        return;
      }
    }

    notify(mode === "add" ? t("createSuccess") : t("updateSuccess"), "success");
    router.push("/users");
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {mode === "edit" ? t("editTitle") : t("addTitle")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} loading={submitting}>
              {t("save")}
            </Button>
          </Box>
        </Box>

        <Paper>
          <Tabs value={tab} onChange={(_event, newValue) => setTab(newValue)} sx={{ px: 2 }}>
            <Tab label={t("tabGeneral")} />
            <Tab label={t("tabAuthentication")} />
            <Tab label={t("tabRoleAndGroup")} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tab} index={0}>
              <Box sx={{ display: "flex", flexDirection: "column", maxWidth: "sm" }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    autoFocus
                    fullWidth
                    label={t("firstNameLabel")}
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      clearFieldError("firstName");
                    }}
                    error={!!fieldErrors.firstName}
                    helperText={fieldErrors.firstName ?? " "}
                    disabled={submitting}
                  />
                  <TextField
                    fullWidth
                    label={t("lastNameLabel")}
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      clearFieldError("lastName");
                    }}
                    error={!!fieldErrors.lastName}
                    helperText={fieldErrors.lastName ?? " "}
                    disabled={submitting}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label={t("middleNameLabel")}
                    value={middleName}
                    onChange={(event) => setMiddleName(event.target.value)}
                    disabled={submitting}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label={t("dobLabel")}
                    value={dob}
                    onChange={(event) => {
                      setDob(event.target.value);
                      clearFieldError("dob");
                    }}
                    error={!!fieldErrors.dob}
                    helperText={fieldErrors.dob ?? " "}
                    disabled={submitting}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    type="email"
                    label={t("emailLabel")}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearFieldError("email");
                    }}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email ?? " "}
                    disabled={submitting}
                  />
                  <TextField
                    select
                    fullWidth
                    label={t("userTypeLabel")}
                    value={typeId}
                    onChange={(event) => {
                      setTypeId(Number(event.target.value));
                      clearFieldError("typeId");
                    }}
                    error={!!fieldErrors.typeId}
                    helperText={fieldErrors.typeId ?? " "}
                    disabled={submitting}
                  >
                    {userTypeOptions.map((userType) => (
                      <MenuItem key={userType.id} value={userType.id}>
                        {userType.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label={t("phoneLabel")}
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      clearFieldError("phone");
                    }}
                    error={!!fieldErrors.phone}
                    helperText={fieldErrors.phone ?? " "}
                    disabled={submitting}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label={t("addressLabel")}
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                    clearFieldError("address");
                  }}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address ?? " "}
                  disabled={submitting}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: "sm" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={authEnabled}
                      onChange={(event) => setAuthEnabled(event.target.checked)}
                      disabled={submitting}
                    />
                  }
                  label={t("authEnableLabel")}
                />
                <TextField
                  fullWidth
                  label={t("usernameLabel")}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    clearFieldError("username");
                  }}
                  error={!!fieldErrors.username}
                  helperText={fieldErrors.username ?? " "}
                  disabled={submitting || !authEnabled}
                />
                <Box sx={{ display: "flex", gap: 2, mt: -2 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label={t("passwordLabel")}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearFieldError("password");
                    }}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password ?? " "}
                    disabled={submitting || !authEnabled}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label={t("confirmPasswordLabel")}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    error={!!fieldErrors.confirmPassword}
                    helperText={fieldErrors.confirmPassword ?? " "}
                    disabled={submitting || !authEnabled}
                  />
                </Box>
                <FormControlLabel
                  sx={{ mt: -3 }}
                  control={
                    <Switch
                      checked={forcePasswordChange}
                      onChange={(event) => setForcePasswordChange(event.target.checked)}
                      disabled={submitting || !authEnabled}
                    />
                  }
                  label={t("forcePasswordChangeLabel")}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <GroupsTransferList
                allGroups={allGroups}
                assignedGroupIds={groupIds}
                onChange={setGroupIds}
                disabled={submitting}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      {toast}
    </>
  );
}
