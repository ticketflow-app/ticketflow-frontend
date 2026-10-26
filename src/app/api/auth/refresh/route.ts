import { NextResponse } from "next/server";

import { refreshAuthSession } from "@/lib/auth/refresh";

export async function POST() {
  const session = await refreshAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}
