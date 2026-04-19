import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_PRICE_IDR = 500000;
const DOKU_BASE_URL = "https://api-sandbox.doku.com"; // SANDBOX hardcoded
const REQUEST_TARGET = "/checkout/v1/payment";

async function sha256Base64(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function hmacSha256Base64(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = (claimsData.claims.email as string) || "customer@ezpos.app";

    const body = await req.json().catch(() => ({}));
    const successUrl: string = body.successUrl || "https://ezpos.lovable.app/checkout/success";

    const clientId = Deno.env.get("DOKU_CLIENT_ID")!;
    const secretKey = Deno.env.get("DOKU_SECRET_KEY")!;

    const invoiceNumber = `EZPOS-${userId.slice(0, 8)}-${Date.now()}`;

    const projectRef = (Deno.env.get("SUPABASE_URL") || "").match(/https?:\/\/([^.]+)/)?.[1] || "";
    const notificationUrl = `https://${projectRef}.supabase.co/functions/v1/doku-notification`;

    const payload = {
      order: {
        amount: PRO_PRICE_IDR,
        invoice_number: invoiceNumber,
        currency: "IDR",
        callback_url: `${successUrl}?invoice=${invoiceNumber}`,
        callback_url_cancel: successUrl,
        line_items: [
          { name: "EZPOS Pro - 1 Bulan", price: PRO_PRICE_IDR, quantity: 1 },
        ],
      },
      payment: { payment_due_date: 60 },
      customer: {
        id: userId,
        name: userEmail.split("@")[0],
        email: userEmail,
      },
      additional_info: {
        notification_url: notificationUrl,
        success_url: `${successUrl}?invoice=${invoiceNumber}`,
        failed_url: `${successUrl}?invoice=${invoiceNumber}&status=failed`,
      },
    };

    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().split(".")[0] + "Z";
    const bodyString = JSON.stringify(payload);
    const digest = await sha256Base64(bodyString);

    const signaturePayload =
      `Client-Id:${clientId}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${requestTimestamp}\n` +
      `Request-Target:${REQUEST_TARGET}\n` +
      `Digest:${digest}`;

    const signatureRaw = await hmacSha256Base64(secretKey, signaturePayload);
    const signature = `HMACSHA256=${signatureRaw}`;

    console.log("[DOKU sandbox] Creating checkout", { invoiceNumber, requestId });

    const dokuRes = await fetch(`${DOKU_BASE_URL}${REQUEST_TARGET}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        "Signature": signature,
      },
      body: bodyString,
    });

    const dokuJson = await dokuRes.json().catch(() => null);

    if (!dokuRes.ok) {
      console.error("[DOKU sandbox] Error response", dokuRes.status, dokuJson);
      return new Response(
        JSON.stringify({
          error: dokuJson?.message || dokuJson?.error?.message || `DOKU error ${dokuRes.status}`,
          details: dokuJson,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paymentUrl =
      dokuJson?.response?.payment?.url ||
      dokuJson?.payment?.url ||
      dokuJson?.url;

    if (!paymentUrl) {
      console.error("[DOKU sandbox] No payment URL in response", dokuJson);
      return new Response(
        JSON.stringify({ error: "No payment URL returned by DOKU", details: dokuJson }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("[DOKU sandbox] Checkout created", { invoiceNumber, paymentUrl });

    return new Response(
      JSON.stringify({ url: paymentUrl, invoice: invoiceNumber }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[DOKU sandbox] Exception", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
