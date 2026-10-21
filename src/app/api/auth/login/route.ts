import { NextResponse } from "next/server";

import { callGateway } from "@/lib/api/gateway";
import type { ApiResponse, LoginInput, LoginResult } from "@/lib/api/types";
import { setAuthToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as LoginInput | null;
  if (!input?.email || !input?.password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  const { status, body } = await callGateway({
    path: "/login",
    method: "POST",
    body: input,
  });

  const envelope = body as ApiResponse<LoginResult> | null;
  if (status !== 200 || !envelope?.success || !envelope.data?.token) {
    return NextResponse.json(
      { message: envelope?.message ?? "Invalid credentials" },
      { status: status === 200 ? 401 : status },
    );
  }

  await setAuthToken(envelope.data.token);

  const { id, name, email, role } = envelope.data;
  return NextResponse.json({ user: { id, name, email, role } });
}
