import { NextResponse } from "next/server";

import { callGateway } from "@/lib/api/gateway";
import type { ApiResponse, RegisterInput } from "@/lib/api/types";

export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as RegisterInput | null;
  if (!input?.name || !input?.email || !input?.password) {
    return NextResponse.json(
      { message: "Name, email and password are required" },
      { status: 400 },
    );
  }

  const { status, body } = await callGateway({
    path: "/api/auth/register",
    method: "POST",
    body: input,
  });

  const envelope = body as ApiResponse<unknown> | null;
  return NextResponse.json(
    { message: envelope?.message ?? "Registration failed", data: envelope?.data },
    { status },
  );
}
