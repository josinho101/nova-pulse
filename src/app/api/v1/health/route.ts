import { NextResponse } from "next/server";
import { getHealthStatus } from "@/server/controllers/health.controller";

export function GET() {
  return NextResponse.json(getHealthStatus());
}
