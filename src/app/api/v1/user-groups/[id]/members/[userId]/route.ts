import { NextRequest, NextResponse } from "next/server";
import { removeGroupMember } from "@/server/controllers/user-group-member.controller";

function parseId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) ? parsed : null;
}

function invalidIdResponse() {
  return NextResponse.json({ error: { message: "UserGroup not found" } }, { status: 404 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const { id, userId } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const result = await removeGroupMember(parsedId, userId);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
