import { NextRequest, NextResponse } from "next/server";
import {
  deleteUserGroup,
  getUserGroup,
  updateUserGroup,
} from "@/server/controllers/user-group.controller";
import { getCurrentUser } from "@/server/auth/current-user";

function parseId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) ? parsed : null;
}

function invalidIdResponse() {
  return NextResponse.json({ error: { message: "UserGroup not found" } }, { status: 404 });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const result = await getUserGroup(parsedId);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);

  const { id } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const body = await request.json();
  const result = await updateUserGroup(parsedId, body, currentUser!.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);

  const { id } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const result = await deleteUserGroup(parsedId, currentUser!.id);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
