import { NextRequest, NextResponse } from "next/server";
import {
  disableUserLogin,
  getUserLoginSummary,
  upsertUserLogin,
} from "@/server/controllers/user-login.controller";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const result = await getUserLoginSummary(userId);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const body = await request.json();
  const result = await upsertUserLogin(userId, body);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const result = await disableUserLogin(userId);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
