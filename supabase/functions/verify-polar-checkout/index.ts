import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const POLAR_ACCESS_TOKEN = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!POLAR_ACCESS_TOKEN) {
      throw new Error("POLAR_ACCESS_TOKEN is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { checkoutId } = await req.json();
    if (!checkoutId) {
      return new Response(JSON.stringify({ error: "checkoutId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify checkout with Polar
    const response = await fetch(`https://api.polar.sh/v1/checkouts/${checkoutId}`, {
      headers: { Authorization: `Bearer ${POLAR_ACCESS_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Polar API error: ${response.status}`);
    }

    const checkout = await response.json();

    // SECURITY: ensure this checkout was created for the calling user
    const checkoutOwner =
      checkout.external_customer_id ||
      checkout.customer?.external_id ||
      checkout.metadata?.user_id;
    if (!checkoutOwner || checkoutOwner !== user.id) {
      return new Response(
        JSON.stringify({ error: "Checkout does not belong to this user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (checkout.status === "succeeded") {
      // Use service role to insert/update subscription
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      // Check if subscription exists
      const { data: existing } = await adminClient
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await adminClient
          .from("subscriptions")
          .update({
            plan: "pro",
            status: "active",
            polar_customer_id: checkout.customer_id || null,
            polar_subscription_id: checkout.subscription_id || null,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await adminClient.from("subscriptions").insert({
          user_id: user.id,
          plan: "pro",
          status: "active",
          polar_customer_id: checkout.customer_id || null,
          polar_subscription_id: checkout.subscription_id || null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({ status: checkout.status }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error verifying checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
