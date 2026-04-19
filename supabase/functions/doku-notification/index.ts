import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

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
    const rawBody = await req.text();
    const clientId = Deno.env.get("DOKU_CLIENT_ID")!;
    const secretKey = Deno.env.get("DOKU_SECRET_KEY")!;

    const requestId = req.headers.get("Request-Id") || "";
    const requestTimestamp = req.headers.get("Request-Timestamp") || "";
    const incomingSignature = req.headers.get("Signature") || "";
    const requestTarget = "/doku-notification";

    // Verify signature
    const digest = await sha256Base64(rawBody);
    const signaturePayload =
      `Client-Id:${clientId}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${requestTimestamp}\n` +
      `Request-Target:${requestTarget}\n` +
      `Digest:${digest}`;

    const expected = `HMACSHA256=${await hmacSha256Base64(secretKey, signaturePayload)}`;

    const signatureValid = incomingSignature === expected;
    if (!signatureValid) {
      console.warn("DOKU signature mismatch", {
        incoming: incomingSignature,
        expected,
        requestId,
        requestTimestamp,
      });
      // Still log payload for debugging but reject
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    console.log("DOKU notification received", JSON.stringify(payload));

    const status: string = (
      payload?.transaction?.status ||
      payload?.order?.status ||
      payload?.status ||
      ""
    ).toUpperCase();

    const invoiceNumber: string =
      payload?.order?.invoice_number ||
      payload?.transaction?.original_request_id ||
      "";

    if (status !== "SUCCESS") {
      console.log("Non-success status, skipping subscription update:", status);
      return new Response(JSON.stringify({ ok: true, status }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract user id prefix from invoice: EZPOS-{userIdPrefix}-{ts}
    const match = invoiceNumber.match(/^EZPOS-([a-f0-9]{8})-(\d+)$/i);
    if (!match) {
      console.error("Invalid invoice format:", invoiceNumber);
      return new Response(JSON.stringify({ error: "Invalid invoice format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIdPrefix = match[1];

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find user by id prefix
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersError) {
      console.error("listUsers error", usersError);
      return new Response(JSON.stringify({ error: "User lookup failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = usersData.users.find((u) => u.id.startsWith(userIdPrefix));
    if (!user) {
      console.error("User not found for prefix:", userIdPrefix);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Upsert subscription
    const { data: existing } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { error: updErr } = await adminClient
        .from("subscriptions")
        .update({
          plan: "pro",
          status: "active",
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (updErr) {
        console.error("Update subscription error", updErr);
        return new Response(JSON.stringify({ error: "DB update failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: insErr } = await adminClient
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: "pro",
          status: "active",
          expires_at: expiresAt,
        });
      if (insErr) {
        console.error("Insert subscription error", insErr);
        return new Response(JSON.stringify({ error: "DB insert failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("doku-notification error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
