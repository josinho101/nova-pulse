"use client";

import { useEffect, useState } from "react";
import { UserFormPage } from "@/components/users/UserFormPage";
import { listUserTypes, type UserType } from "@/lib/user-types-api";
import { useToast } from "@/components/common/Toast";

export default function NewUserPage() {
  const { notify, toast } = useToast();
  const [userTypes, setUserTypes] = useState<UserType[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const result = await listUserTypes(controller.signal);
      if (controller.signal.aborted) return;
      if (result.ok) {
        setUserTypes(result.data);
      } else {
        notify(result.message, "error");
      }
    })();
    return () => controller.abort();
  }, [notify]);

  return (
    <>
      <UserFormPage mode="add" user={null} userTypeOptions={userTypes} userLogin={null} />
      {toast}
    </>
  );
}
