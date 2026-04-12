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
      return jsonResponse({ error: "Payment service not configured" }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No Authorization header provided");
      return jsonResponse({ error: "Not authenticated. Please log in again." }, 401);
    }

    console.log("Auth header present, verifying user...");

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User verification failed:", userError?.message ?? "No user returned");
      return jsonResponse({ error: "Invalid session. Please log in again." }, 401);
    }

    console.log("User verified:", user.id);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      console.error("Invalid JSON body");
      return jsonResponse({ error: "Invalid request body" }, 400);
    }

    const { productId, successUrl } = body as { productId?: string; successUrl?: string };
    if (!productId || !successUrl) {
      console.error("Missing fields - productId:", !!productId, "successUrl:", !!successUrl);
      return jsonResponse({ error: "productId and successUrl are required" }, 400);
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
      return jsonResponse({ error: `Checkout service error (${response.status})` }, 502);
    }

    const checkout = await response.json();
    console.log("Checkout created successfully:", checkout.id);

    return jsonResponse({ url: checkout.url });
  } catch (error) {
    console.error("Unexpected error:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  }
});
