import { NextResponse } from "next/server";

export const runtime = "edge";

interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
}

export function GET(): NextResponse<HealthResponse> {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  });
}
