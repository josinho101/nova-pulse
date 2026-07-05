import { NextRequest, NextResponse } from "next/server";
import { login } from "@/server/controllers/auth.controller";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await login(body);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: 200 });
}
