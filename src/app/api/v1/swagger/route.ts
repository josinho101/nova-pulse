import { NextResponse } from "next/server";
import { buildOpenApiDocument } from "@/server/docs/openapi";

export function GET() {
  return NextResponse.json(buildOpenApiDocument());
}
