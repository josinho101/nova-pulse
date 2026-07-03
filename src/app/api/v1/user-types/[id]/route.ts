import { NextRequest, NextResponse } from "next/server";
import {
  deleteUserType,
  getUserType,
  updateUserType,
} from "@/server/controllers/user-type.controller";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = getUserType(id);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const result = updateUserType(id, body);

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
  const result = deleteUserType(id);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
