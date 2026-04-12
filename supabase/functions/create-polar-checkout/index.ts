import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const POLAR_ACCESS_TOKEN = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!POLAR_ACCESS_TOKEN) {
      console.error("POLAR_ACCESS_TOKEN is not configured");
      return jsonResponse({ error: "Payment service not configured", code: "POLAR_NOT_CONFIGURED" }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No Authorization header provided");
      return jsonResponse({ error: "Not authenticated. Please log in again.", code: "MISSING_AUTH_HEADER" }, 401);
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) {
      console.error("Authorization header does not contain a bearer token");
      return jsonResponse({ error: "Invalid authentication token. Please log in again.", code: "INVALID_AUTH_HEADER" }, 401);
    }

    console.log("Auth header present, verifying user token...");

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      console.error("User verification failed:", userError?.message ?? "No user returned");
      return jsonResponse({ error: "Invalid session. Please log in again.", code: "INVALID_SESSION" }, 401);
    }

    console.log("User verified:", user.id);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      console.error("Invalid JSON body");
      return jsonResponse({ error: "Invalid request body", code: "INVALID_JSON" }, 400);
    }

    const { productId, successUrl } = body as { productId?: string; successUrl?: string };
    if (typeof productId !== "string" || typeof successUrl !== "string") {
      console.error("Missing fields - productId:", !!productId, "successUrl:", !!successUrl);
      return jsonResponse({ error: "productId and successUrl are required", code: "MISSING_FIELDS" }, 400);
    }

    try {
      new URL(successUrl);
    } catch {
      console.error("Invalid successUrl provided:", successUrl);
      return jsonResponse({ error: "successUrl is not valid", code: "INVALID_SUCCESS_URL" }, 400);
    }

    console.log("Creating Polar checkout for product:", productId);

    const response = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [productId],
        success_url: successUrl,
        external_customer_id: user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Polar API error:", response.status, errorData);
      return jsonResponse({ error: `Checkout service error (${response.status})`, code: "POLAR_API_ERROR" }, 502);
    }

    const checkout = await response.json();
    console.log("Checkout created successfully:", checkout.id);

    return jsonResponse({ url: checkout.url });
  } catch (error) {
    console.error("Unexpected error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Internal server error", code: "UNEXPECTED_ERROR" }, 500);
  }
});
