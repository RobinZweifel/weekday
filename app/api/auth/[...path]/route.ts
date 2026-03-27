import { authApiHandler } from "@neondatabase/auth/next/server";
import { NextResponse } from "next/server";

const disabled = async () =>
  NextResponse.json(
    { error: "Neon Auth is not configured (set NEON_AUTH_BASE_URL)." },
    { status: 503 }
  );

const handlers = process.env.NEON_AUTH_BASE_URL?.trim()
  ? authApiHandler()
  : {
      GET: disabled,
      POST: disabled,
      PUT: disabled,
      PATCH: disabled,
      DELETE: disabled,
    };

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
