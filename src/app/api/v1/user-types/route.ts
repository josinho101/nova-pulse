import { NextRequest, NextResponse } from "next/server";
import { createUserType, listUserTypes } from "@/server/controllers/user-type.controller";

export async function GET() {
  const result = listUserTypes();
  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }
  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = createUserType(body);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
