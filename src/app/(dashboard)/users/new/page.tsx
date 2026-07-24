"use client";

import { useEffect, useState } from "react";
import { UserFormPage } from "@/components/users/UserFormPage";
import { listUserTypes, type UserType } from "@/lib/user-types-api";
import { listUserGroups, type UserGroup } from "@/lib/user-groups-api";
import { useToast } from "@/components/common/Toast";

export default function NewUserPage() {
  const { notify, toast } = useToast();
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const [userTypesResult, userGroupsResult] = await Promise.all([
        listUserTypes(controller.signal),
        listUserGroups(controller.signal),
      ]);
      if (controller.signal.aborted) return;

      if (userTypesResult.ok) {
        setUserTypes(userTypesResult.data);
      } else {
        notify(userTypesResult.message, "error");
      }

      if (userGroupsResult.ok) {
        setUserGroups(userGroupsResult.data);
      } else {
        notify(userGroupsResult.message, "error");
      }
    })();
    return () => controller.abort();
  }, [notify]);

  return (
    <>
      <UserFormPage
        mode="add"
        user={null}
        userTypeOptions={userTypes}
        userLogin={null}
        allGroups={userGroups}
        assignedGroupIds={[]}
      />
      {toast}
    </>
  );
}
