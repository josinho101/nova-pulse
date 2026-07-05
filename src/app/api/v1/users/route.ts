import { NextRequest, NextResponse } from "next/server";
import { createUser, listUsers, type UserSortField } from "@/server/controllers/user.controller";

const SORT_FIELDS: UserSortField[] = [
  "firstName",
  "lastName",
  "email",
  "userType",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const requestedSortBy = searchParams.get("sortBy") as UserSortField | null;
  const sortBy = requestedSortBy && SORT_FIELDS.includes(requestedSortBy) ? requestedSortBy : "lastName";
  const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

  const result = listUsers(page, pageSize, sortBy, sortOrder);
  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: result.status });
  }
  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = createUser(body);

  if (!result.ok) {
    return NextResponse.json(
      { error: { message: result.message, fields: result.fields } },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
