"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserFormPage } from "@/components/users/UserFormPage";
import { useToast } from "@/components/common/Toast";
import { getUser, type User } from "@/lib/users-api";
import { listUserTypes, type UserType } from "@/lib/user-types-api";

export default function EditUserPage({ params }: PageProps<"/users/[id]/edit">) {
  const { id } = use(params);
  const t = useTranslations("UsersPage");
  const router = useRouter();
  const { notify, toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const [userResult, userTypesResult] = await Promise.all([
        getUser(id, controller.signal),
        listUserTypes(controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (!userResult.ok) {
        notify(t("loadError"), "error");
        router.push("/users");
        return;
      }

      setUser(userResult.data);

      if (userTypesResult.ok) {
        setUserTypes(userTypesResult.data);
      } else {
        notify(userTypesResult.message, "error");
      }

      setLoading(false);
    })();
    return () => controller.abort();
  }, [id, notify, router, t]);

  if (loading || !user) {
    return <>{toast}</>;
  }

  return (
    <>
      <UserFormPage mode="edit" user={user} userTypeOptions={userTypes} />
      {toast}
    </>
  );
}
