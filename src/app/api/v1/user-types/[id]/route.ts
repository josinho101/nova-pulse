import { NextRequest, NextResponse } from "next/server";
import {
  deleteUserType,
  getUserType,
  updateUserType,
} from "@/server/controllers/user-type.controller";

function parseId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) ? parsed : null;
}

function invalidIdResponse() {
  return NextResponse.json({ error: { message: "UserType not found" } }, { status: 404 });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const result = getUserType(parsedId);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const body = await request.json();
  const result = updateUserType(parsedId, body);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseId(id);
  if (parsedId === null) return invalidIdResponse();

  const result = deleteUserType(parsedId);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
