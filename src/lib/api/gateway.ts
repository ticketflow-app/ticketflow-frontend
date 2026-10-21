import { API_GATEWAY_URL } from "@/lib/config";

export interface GatewayRequest {
  path: string;
  method?: string;
  token?: string | null;
  body?: unknown;
  search?: string;
}

export interface GatewayResult {
  status: number;
  body: unknown;
}

/**
 * Server-side call to the API Gateway. Used by Route Handlers so the browser
 * never talks to the gateway directly.
 */
export async function callGateway({
  path,
  method = "GET",
  token,
  body,
  search = "",
}: GatewayRequest): Promise<GatewayResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_GATEWAY_URL}${path}${search}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  return { status: response.status, body: await parseBody(response) };
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
