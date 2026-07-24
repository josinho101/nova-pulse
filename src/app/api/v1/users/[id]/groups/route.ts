import { NextRequest, NextResponse } from "next/server";
import {
  listGroupsForUser,
  setGroupsForUser,
} from "@/server/controllers/user-group-member.controller";
import { getCurrentUser } from "@/server/auth/current-user";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await listGroupsForUser(id);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);

  const { id } = await params;
  const body = await request.json();
  const groupIds = Array.isArray(body?.groupIds) ? body.groupIds : [];
  const result = await setGroupsForUser(id, groupIds, currentUser!.id);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
