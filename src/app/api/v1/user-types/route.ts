import { NextRequest, NextResponse } from "next/server";
import { createUserType, listUserTypes } from "@/server/controllers/user-type.controller";
import { getCurrentUser } from "@/server/auth/current-user";

export async function GET() {
  const result = await listUserTypes();
  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }
  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const body = await request.json();
  const result = await createUserType(body, currentUser.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
