import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Build JsonWebKey pair from base64url-encoded raw VAPID secrets,
// then import via @negrel/webpush which handles RFC 8291 encryption + RFC 8292 VAPID.
function b64urlPad(s: string): string {
  return s + "=".repeat((4 - (s.length % 4)) % 4);
}
function b64urlToBytes(s: string): Uint8Array {
  const b64 = b64urlPad(s).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
function bytesToB64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

let appServerPromise: Promise<webpush.ApplicationServer> | null = null;
function getAppServer() {
  if (!appServerPromise) {
    appServerPromise = (async () => {
      const pubRaw = b64urlToBytes(VAPID_PUBLIC_KEY); // 65 bytes, 0x04 || x(32) || y(32)
      if (pubRaw.length !== 65 || pubRaw[0] !== 0x04) {
        throw new Error("Invalid VAPID_PUBLIC_KEY (expected uncompressed P-256, 65 bytes)");
      }
      const x = bytesToB64url(pubRaw.slice(1, 33));
      const y = bytesToB64url(pubRaw.slice(33, 65));
      const d = VAPID_PRIVATE_KEY.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");

      const publicJwk: JsonWebKey = { kty: "EC", crv: "P-256", x, y, ext: true, key_ops: [] };
      const privateJwk: JsonWebKey = { kty: "EC", crv: "P-256", x, y, d, ext: true, key_ops: ["sign"] };

      const vapidKeys = await webpush.importVapidKeys(
        { publicKey: publicJwk, privateKey: privateJwk },
        { extractable: false },
      );

      return await webpush.ApplicationServer.new({
        contactInformation: "mailto:support@ezpos.id",
        vapidKeys,
      });
    })();
  }
  return appServerPromise;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SECURITY: require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { notification_id } = await req.json();

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get notification
    const { data: notif, error: notifError } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("id", notification_id)
      .single();

    if (notifError || !notif) {
      return new Response(
        JSON.stringify({ error: "Notification not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: only the owning user may trigger pushes for this notification
    if (notif.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push subscriptions for this user
    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", notif.user_id);

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appServer = await getAppServer();
    let sent = 0;

    const payload = JSON.stringify({
      title: notif.title,
      body: notif.body,
      data: { type: notif.type, ...((notif.data as Record<string, unknown>) || {}) },
      tag: `ezpos-${notif.type}-${notif.id}`,
    });

    for (const sub of subs) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          expirationTime: null,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };
        const subscriber = appServer.subscribe(subscription);
        await subscriber.pushTextMessage(payload, { ttl: 86400 });
        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Failed to send push to ${sub.endpoint}:`, msg);
        // Clean up expired subscriptions (404 Not Found / 410 Gone)
        if (/\b(404|410)\b/.test(msg) || /gone|not found/i.test(msg)) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ sent, total: subs.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-push-notification error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
