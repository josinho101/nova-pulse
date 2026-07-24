import { NextRequest, NextResponse } from "next/server";
import { createUserGroup, listUserGroups } from "@/server/controllers/user-group.controller";
import { getCurrentUser } from "@/server/auth/current-user";

export async function GET() {
  const result = await listUserGroups();
  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }
  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);

  const body = await request.json();
  const result = await createUserGroup(body, currentUser!.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
