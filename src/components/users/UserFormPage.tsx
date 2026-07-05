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
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/common/Toast";
import { createUser, updateUser, type User } from "@/lib/users-api";
import type { UserType } from "@/lib/user-types-api";

export interface UserFormPageProps {
  mode: "add" | "edit";
  user: User | null;
  userTypeOptions: UserType[];
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  phone?: string;
  email?: string;
  typeId?: string;
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

export function UserFormPage({ mode, user, userTypeOptions }: UserFormPageProps) {
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

    const errors: FieldErrors = {};
    if (!trimmedFirstName) errors.firstName = t("firstNameRequired");
    if (!trimmedLastName) errors.lastName = t("lastNameRequired");
    if (!dob) errors.dob = t("dobRequired");
    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) errors.phone = t("phoneInvalid");
    if (!trimmedEmail) errors.email = t("emailRequired");
    else if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = t("emailInvalid");
    if (typeId === "") errors.typeId = t("userTypeRequired");

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTab(0);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    const input = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      middleName: middleName.trim() || undefined,
      dob,
      address: trimmedAddress || undefined,
      phone: trimmedPhone || undefined,
      email: trimmedEmail,
      typeId: typeId as number,
    };

    const result =
      mode === "edit" && user ? await updateUser(user.id, input) : await createUser(input);

    setSubmitting(false);

    if (result.ok) {
      notify(mode === "add" ? t("createSuccess") : t("updateSuccess"), "success");
      router.push("/users");
      return;
    }

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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: "sm" }}>
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
              <Typography color="text.secondary">{t("comingSoon")}</Typography>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <Typography color="text.secondary">{t("comingSoon")}</Typography>
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      {toast}
    </>
  );
}
