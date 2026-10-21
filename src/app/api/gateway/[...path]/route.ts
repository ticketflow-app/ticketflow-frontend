import { NextResponse } from "next/server";

import { callGateway } from "@/lib/api/gateway";
import { getAuthToken } from "@/lib/auth/session";

/**
 * Generic BFF proxy: forwards same-origin requests to the API Gateway and
 * attaches the bearer token stored in the httpOnly cookie.
 */
interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function forward(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const { search } = new URL(request.url);
  const token = await getAuthToken();
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const { status, body } = await callGateway({
      path: `/${path.join("/")}`,
      method: request.method,
      token,
      body: hasBody ? await request.json().catch(() => undefined) : undefined,
      search,
    });

    if (status === 204 || status === 205) {
      return new NextResponse(null, { status });
    }

    return NextResponse.json(body ?? null, { status });
  } catch {
    return NextResponse.json(
      { message: "The API Gateway is not reachable" },
      { status: 503 },
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return forward(request, context);
}
