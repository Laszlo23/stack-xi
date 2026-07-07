import {
  LIFI_API_BASE,
  BASE_CHAIN_ID,
  getLifiApiKey,
  getLifiHeaders,
  isAllowedLifiChain,
  isAllowedLifiFromToken,
  isAllowedLifiToToken,
  isLifiConfigured,
} from "@/lib/swap/lifi-config";

export type LifiQuoteParams = {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress?: string;
  slippage?: number;
};

export function isLifiProxyConfigured(): boolean {
  return isLifiConfigured();
}

export async function proxyLifiQuote(params: LifiQuoteParams): Promise<unknown> {
  const key = getLifiApiKey();
  if (!key) {
    throw new Error("LI.FI API not configured");
  }

  const url = new URL(`${LIFI_API_BASE}/quote`);
  url.searchParams.set("fromChain", String(params.fromChain));
  url.searchParams.set("toChain", String(params.toChain));
  url.searchParams.set("fromToken", params.fromToken);
  url.searchParams.set("toToken", params.toToken);
  url.searchParams.set("fromAmount", params.fromAmount);
  url.searchParams.set("fromAddress", params.fromAddress);
  if (params.toAddress) url.searchParams.set("toAddress", params.toAddress);
  if (params.slippage != null) url.searchParams.set("slippage", String(params.slippage));

  const integrator = process.env.VITE_LIFI_INTEGRATOR?.trim() || "stack-xi";
  url.searchParams.set("integrator", integrator);

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      ...getLifiHeaders(),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LI.FI quote failed (${res.status})${body ? `: ${body.slice(0, 200)}` : ""}`);
  }

  return res.json();
}

export async function forwardLifiApiRequest(
  path: string,
  request: Request,
): Promise<Response> {
  const key = getLifiApiKey();
  if (!key) {
    return new Response(JSON.stringify({ error: "LI.FI API not configured" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${LIFI_API_BASE}/${normalizedPath}`);
  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const method = request.method.toUpperCase();
  const headers: Record<string, string> = {
    accept: "application/json",
    ...getLifiHeaders(),
  };

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await request.text();
    if (body) {
      headers["content-type"] = request.headers.get("content-type") ?? "application/json";
    }
  }

  const upstream = await fetch(targetUrl.toString(), {
    method,
    headers,
    body,
  });

  const responseBody = await upstream.text();
  return new Response(responseBody, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export function validateLifiQuoteRequest(params: {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
}): { ok: true } | { ok: false; error: string } {
  if (!isAllowedLifiChain(params.fromChain)) {
    return { ok: false, error: "fromChain not allowlisted" };
  }
  if (params.toChain !== BASE_CHAIN_ID) {
    return { ok: false, error: "toChain must be Base (8453)" };
  }
  if (!isAllowedLifiFromToken(params.fromChain, params.fromToken)) {
    return { ok: false, error: "fromToken not allowlisted" };
  }
  if (!isAllowedLifiToToken(params.toChain, params.toToken)) {
    return { ok: false, error: "toToken must be BCC or USDC on Base" };
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(params.fromAddress)) {
    return { ok: false, error: "fromAddress required" };
  }
  return { ok: true };
}
