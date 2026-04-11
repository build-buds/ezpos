import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function importVapidKey(base64urlKey: string, isPrivate: boolean) {
  // Convert base64url to raw bytes
  const padding = "=".repeat((4 - (base64urlKey.length % 4)) % 4);
  const base64 = (base64urlKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  if (isPrivate) {
    return await crypto.subtle.importKey(
      "pkcs8",
      buildPkcs8(raw),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
  } else {
    return await crypto.subtle.importKey(
      "raw",
      raw,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      []
    );
  }
}

function buildPkcs8(rawPrivateKey: Uint8Array): ArrayBuffer {
  // Wrap raw 32-byte EC private key in PKCS8 DER structure for P-256
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8Footer = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00,
  ]);
  
  // We need the public key too for PKCS8, but for signing we can skip it
  // Use a simpler JWK import instead
  const result = new Uint8Array(pkcs8Header.length + rawPrivateKey.length);
  result.set(pkcs8Header);
  result.set(rawPrivateKey, pkcs8Header.length);
  return result.buffer;
}

// Simpler approach: use JWK for key import
async function importKeys() {
  // For the private key, convert raw to JWK
  const padding1 = "=".repeat((4 - (VAPID_PRIVATE_KEY.length % 4)) % 4);
  const privBase64 = (VAPID_PRIVATE_KEY + padding1).replace(/-/g, "+").replace(/_/g, "/");
  
  const padding2 = "=".repeat((4 - (VAPID_PUBLIC_KEY.length % 4)) % 4);
  const pubBase64 = (VAPID_PUBLIC_KEY + padding2).replace(/-/g, "+").replace(/_/g, "/");
  const pubRaw = Uint8Array.from(atob(pubBase64), (c) => c.charCodeAt(0));
  
  // Extract x and y from uncompressed public key (first byte 0x04, then 32 bytes x, 32 bytes y)
  const x = btoa(String.fromCharCode(...pubRaw.slice(1, 33))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const y = btoa(String.fromCharCode(...pubRaw.slice(33, 65))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  
  const jwk = {
    kty: "EC",
    crv: "P-256",
    x,
    y,
    d: VAPID_PRIVATE_KEY,
  };

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  return { privateKey };
}

function base64urlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function createVapidAuthHeader(endpoint: string, privateKey: CryptoKey) {
  const aud = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12; // 12 hours

  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud,
    exp,
    sub: "mailto:ezpos@lovable.app",
  };

  const enc = new TextEncoder();
  const headerB64 = base64urlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(enc.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    enc.encode(unsignedToken)
  );

  // Convert DER signature to raw r||s
  const sigArray = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  
  if (sigArray[0] === 0x30) {
    // DER encoded
    const rLen = sigArray[3];
    const rStart = 4;
    const rBytes = sigArray.slice(rStart, rStart + rLen);
    const sLen = sigArray[rStart + rLen + 1];
    const sStart = rStart + rLen + 2;
    const sBytes = sigArray.slice(sStart, sStart + sLen);
    
    r = rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes;
    s = sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes;
    
    // Pad to 32 bytes if needed
    if (r.length < 32) { const padded = new Uint8Array(32); padded.set(r, 32 - r.length); r = padded; }
    if (s.length < 32) { const padded = new Uint8Array(32); padded.set(s, 32 - s.length); s = padded; }
  } else {
    // Already raw
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32, 64);
  }
  
  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);

  const token = `${unsignedToken}.${base64urlEncode(rawSig)}`;

  return {
    authorization: `vapid t=${token}, k=${VAPID_PUBLIC_KEY}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const { privateKey } = await importKeys();
    let sent = 0;

    for (const sub of subs) {
      try {
        const vapidHeaders = await createVapidAuthHeader(sub.endpoint, privateKey);

        // Create push message payload
        const payload = JSON.stringify({
          title: notif.title,
          body: notif.body,
          data: { type: notif.type, ...((notif.data as Record<string, unknown>) || {}) },
          tag: `ezpos-${notif.type}-${notif.id}`,
        });

        // For a real implementation, you'd need to encrypt the payload using 
        // the subscription's p256dh and auth keys (RFC 8291).
        // For now, we send a simple notification.
        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            ...vapidHeaders,
            "Content-Type": "application/octet-stream",
            "TTL": "86400",
          },
          body: new TextEncoder().encode(payload),
        });

        if (response.status === 201 || response.status === 200) {
          sent++;
        } else if (response.status === 410 || response.status === 404) {
          // Subscription expired, clean up
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      } catch (err) {
        console.error(`Failed to send push to ${sub.endpoint}:`, err);
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
