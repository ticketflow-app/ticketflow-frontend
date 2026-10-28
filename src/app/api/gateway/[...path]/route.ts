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

/**
 * Public gateway reads that must be forwarded anonymously. The inventory service
 * validates any bearer token it receives, so forwarding an expired or rotated
 * cookie would turn a public read into a 401 even though the route is public.
 */
function isPublicRead(method: string, path: string): boolean {
  return (
    method === "GET" &&
    /^\/api\/inventario\/eventos\/[^/]+\/disponibilidad$/.test(path)
  );
}

async function forward(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const { search } = new URL(request.url);
  const gatewayPath = `/${path.join("/")}`;
  const publicRead = isPublicRead(request.method, gatewayPath);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.json().catch(() => undefined) : undefined;

  async function send(token: string | null) {
    return callGateway({
      path: gatewayPath,
      method: request.method,
      token,
      body,
      search,
    });
  }

  try {
    let token = publicRead ? null : await getAuthToken();
    let result = await send(token);

    if (result.status === 401 && !publicRead) {
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
