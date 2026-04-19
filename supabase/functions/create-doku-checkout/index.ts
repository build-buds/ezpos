import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_PRICE_IDR = 500000;
const DOKU_BASE_URL = "https://api-sandbox.doku.com";
const REQUEST_TARGET = "/checkout/v1/payment";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64FromBytes(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

async function sha256Base64(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64FromBytes(new Uint8Array(hash));
}

async function hmacSha256Base64(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64FromBytes(new Uint8Array(signature));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("[DOKU sandbox] User verification failed", userError);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const successUrl = typeof body.successUrl === "string" && body.successUrl
      ? body.successUrl
      : "https://ezpos.lovable.app/checkout/success";

    const clientId = (Deno.env.get("DOKU_CLIENT_ID") || "").trim();
    const secretKey = (Deno.env.get("DOKU_SECRET_KEY") || "").trim();

    if (!clientId || !secretKey) {
      console.error("[DOKU sandbox] Missing DOKU credentials", {
        hasClientId: !!clientId,
        hasSecretKey: !!secretKey,
      });
      return jsonResponse({ error: "Payment service not configured" }, 500);
    }

    const invoiceNumber = `EZPOS-${user.id.slice(0, 8)}-${Date.now()}`;
    const projectRef = (supabaseUrl.match(/https?:\/\/([^.]+)/)?.[1] || "").trim();
    const notificationUrl = `https://${projectRef}.supabase.co/functions/v1/doku-notification`;

    const payload = {
      order: {
        amount: PRO_PRICE_IDR,
        invoice_number: invoiceNumber,
        currency: "IDR",
        callback_url: `${successUrl}?invoice=${invoiceNumber}`,
        callback_url_result: `${successUrl}?invoice=${invoiceNumber}`,
        callback_url_cancel: successUrl,
        auto_redirect: false,
        line_items: [
          {
            name: "EZPOS Pro - 1 Bulan",
            price: PRO_PRICE_IDR,
            quantity: 1,
          },
        ],
      },
      payment: {
        payment_due_date: 60,
      },
      customer: {
        id: user.id,
        name: user.email?.split("@")[0] || "customer",
        email: user.email || "customer@ezpos.app",
      },
      additional_info: {
        notification_url: notificationUrl,
        success_url: `${successUrl}?invoice=${invoiceNumber}`,
        failed_url: `${successUrl}?invoice=${invoiceNumber}&status=failed`,
      },
    };

    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const bodyString = JSON.stringify(payload);
    const digest = await sha256Base64(bodyString);
    const signaturePayload = [
      `Client-Id:${clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${requestTimestamp}`,
      `Request-Target:${REQUEST_TARGET}`,
      `Digest:${digest}`,
    ].join("\n");
    const signature = `HMACSHA256=${await hmacSha256Base64(secretKey, signaturePayload)}`;

    console.log("[DOKU sandbox] Creating checkout", {
      invoiceNumber,
      requestId,
      requestTimestamp,
      clientIdPrefix: clientId.slice(0, 12),
      secretKeyLength: secretKey.length,
      digest,
      signaturePayload,
    });

    const dokuRes = await fetch(`${DOKU_BASE_URL}${REQUEST_TARGET}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Digest: digest,
        Signature: signature,
      },
      body: bodyString,
    });

    const rawText = await dokuRes.text();
    let dokuJson: Record<string, any> | null = null;
    try {
      dokuJson = rawText ? JSON.parse(rawText) : null;
    } catch {
      dokuJson = null;
    }

    if (!dokuRes.ok) {
      console.error("[DOKU sandbox] Error response", {
        status: dokuRes.status,
        body: rawText,
        responseSignature: dokuRes.headers.get("Signature"),
      });
      return jsonResponse({
        error: dokuJson?.message || dokuJson?.error?.message || `DOKU error ${dokuRes.status}`,
        details: dokuJson ?? rawText,
      }, 502);
    }

    const paymentUrl =
      dokuJson?.response?.payment?.url ||
      dokuJson?.payment?.url ||
      dokuJson?.url;

    if (!paymentUrl) {
      console.error("[DOKU sandbox] No payment URL in response", rawText);
      return jsonResponse({ error: "No payment URL returned by DOKU", details: dokuJson ?? rawText }, 502);
    }

    console.log("[DOKU sandbox] Checkout created", { invoiceNumber, paymentUrl });
    return jsonResponse({ url: paymentUrl, invoice: invoiceNumber });
  } catch (error) {
    console.error("[DOKU sandbox] Exception", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Internal error" }, 500);
  }
});
