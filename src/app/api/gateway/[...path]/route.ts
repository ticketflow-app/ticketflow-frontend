import { NextResponse } from "next/server";

import { callGateway } from "@/lib/api/gateway";
import { refreshAuthSession } from "@/lib/auth/refresh";
import { getAuthToken } from "@/lib/auth/session";

/**
 * Generic BFF proxy: forwards same-origin requests to the API Gateway and
 * attaches the bearer token stored in the httpOnly cookie. When the access
 * token is rejected, it tries to rotate the refresh token once and retries.
 */
interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function forward(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const { search } = new URL(request.url);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.json().catch(() => undefined) : undefined;

  async function send(token: string | null) {
    return callGateway({
      path: `/${path.join("/")}`,
      method: request.method,
      token,
      body,
      search,
    });
  }

  try {
    let token = await getAuthToken();
    let result = await send(token);

    if (result.status === 401) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        token = refreshed.accessToken;
        result = await send(token);
      }
    }

    if (result.status === 204 || result.status === 205) {
      return new NextResponse(null, { status: result.status });
    }

    return NextResponse.json(result.body ?? null, { status: result.status });
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
