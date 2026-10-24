import { NextResponse } from "next/server";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.ALIVE_CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: corsHeaders() });
}

export function jsonOk<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders() });
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
