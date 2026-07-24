import { NextRequest, NextResponse } from "next/server";
import { addGroupMember, listGroupMembers } from "@/server/controllers/user-group-member.controller";
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

  const result = await listGroupMembers(parsedId);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);

  const { id } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const body = await request.json();
  const result = await addGroupMember(parsedId, body?.userId, currentUser!.id);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
