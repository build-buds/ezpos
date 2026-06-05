import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const uid = userData.user.id;

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? "overview";

    if (type === "overview") {
      // Pull data sets we need
      const [{ data: users }, { data: businesses }, { data: products }, { data: txs }] = await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from("businesses").select("id, owner_id, category, created_at"),
        admin.from("products").select("business_id"),
        admin.from("transactions").select("business_id, total, created_at"),
      ]);

      const totalUsers = users?.users.length ?? 0;
      const totalBusinesses = businesses?.length ?? 0;
      const ownersWithBusiness = new Set((businesses ?? []).map((b: any) => b.owner_id)).size;
      const ownersWithCategory = new Set(
        (businesses ?? []).filter((b: any) => !!b.category).map((b: any) => b.owner_id)
      ).size;
      const businessesWithProducts = new Set((products ?? []).map((p: any) => p.business_id)).size;
      const businessesWithTx = new Set((txs ?? []).map((t: any) => t.business_id)).size;
      const totalGmv = (txs ?? []).reduce((s: number, t: any) => s + (Number(t.total) || 0), 0);
      const totalTx = txs?.length ?? 0;

      const funnel = [
        { step: "Signup", value: totalUsers },
        { step: "Pilih Kategori", value: ownersWithCategory },
        { step: "Buka Toko", value: ownersWithBusiness },
        { step: "Tambah Produk", value: businessesWithProducts },
        { step: "Transaksi 1st", value: businessesWithTx },
      ];

      return json({
        totals: {
          totalUsers,
          totalBusinesses,
          ownersWithBusiness,
          businessesWithProducts,
          businessesWithTx,
          totalProducts: products?.length ?? 0,
          totalTransactions: totalTx,
          totalGmv,
          conversionSignupToActive: totalUsers ? businessesWithTx / totalUsers : 0,
          conversionSignupToBusiness: totalUsers ? ownersWithBusiness / totalUsers : 0,
        },
        funnel,
      });
    }

    if (type === "timeline") {
      const gran = url.searchParams.get("granularity") === "week" ? "week" : "day";
      const buckets = gran === "week" ? 12 : 30;
      const stepMs = gran === "week" ? 7 * 86400000 : 86400000;
      const now = startOfDay(new Date());
      // for week, align to monday
      if (gran === "week") {
        const dow = (now.getUTCDay() + 6) % 7;
        now.setUTCDate(now.getUTCDate() - dow);
      }
      const start = new Date(now.getTime() - (buckets - 1) * stepMs);

      const [{ data: users }, { data: businesses }, { data: txs }] = await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from("businesses").select("id, created_at").gte("created_at", start.toISOString()),
        admin.from("transactions").select("business_id, created_at").order("created_at", { ascending: true }),
      ]);

      // First transaction per business
      const firstTxMap = new Map<string, string>();
      for (const t of (txs ?? []) as any[]) {
        if (!firstTxMap.has(t.business_id)) firstTxMap.set(t.business_id, t.created_at);
      }

      const series = Array.from({ length: buckets }, (_, i) => {
        const bStart = new Date(start.getTime() + i * stepMs);
        const bEnd = new Date(bStart.getTime() + stepMs);
        const label = gran === "day" ? isoDay(bStart) : `W${isoDay(bStart)}`;
        const inBucket = (iso: string) => {
          const t = new Date(iso).getTime();
          return t >= bStart.getTime() && t < bEnd.getTime();
        };
        return {
          label,
          date: bStart.toISOString(),
          signups: (users?.users ?? []).filter((u: any) => inBucket(u.created_at)).length,
          businesses: (businesses ?? []).filter((b: any) => inBucket(b.created_at)).length,
          activations: Array.from(firstTxMap.values()).filter((iso) => inBucket(iso)).length,
        };
      });

      return json({ granularity: gran, series });
    }

    if (type === "businesses") {
      const page = Math.max(0, Number(url.searchParams.get("page") ?? "0"));
      const pageSize = 20;
      const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const emailMap = new Map<string, string>((users?.users ?? []).map((u: any) => [u.id, u.email ?? ""]));

      const [{ data: businesses }, { data: products }, { data: txs }] = await Promise.all([
        admin.from("businesses").select("id, name, owner_id, category, created_at").order("created_at", { ascending: false }),
        admin.from("products").select("business_id"),
        admin.from("transactions").select("business_id, total, created_at"),
      ]);

      const productCount = new Map<string, number>();
      for (const p of (products ?? []) as any[]) productCount.set(p.business_id, (productCount.get(p.business_id) ?? 0) + 1);

      const txStats = new Map<string, { count: number; gmv: number; last: string | null }>();
      for (const t of (txs ?? []) as any[]) {
        const cur = txStats.get(t.business_id) ?? { count: 0, gmv: 0, last: null as string | null };
        cur.count += 1;
        cur.gmv += Number(t.total) || 0;
        if (!cur.last || new Date(t.created_at) > new Date(cur.last)) cur.last = t.created_at;
        txStats.set(t.business_id, cur);
      }

      const now = Date.now();
      const all = (businesses ?? []).map((b: any) => {
        const ts = txStats.get(b.id);
        const products = productCount.get(b.id) ?? 0;
        const lastTx = ts?.last ?? null;
        let status: "active" | "dormant" | "inactive" = "inactive";
        if (lastTx) {
          const days = (now - new Date(lastTx).getTime()) / 86400000;
          status = days <= 7 ? "active" : days <= 30 ? "dormant" : "inactive";
        } else if (products > 0) status = "dormant";
        return {
          id: b.id,
          name: b.name,
          email: emailMap.get(b.owner_id) ?? "",
          category: b.category,
          created_at: b.created_at,
          products,
          transactions: ts?.count ?? 0,
          gmv: ts?.gmv ?? 0,
          last_tx: lastTx,
          status,
        };
      });

      return json({
        total: all.length,
        page,
        pageSize,
        rows: all.slice(page * pageSize, page * pageSize + pageSize),
      });
    }

    if (type === "users") {
      const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const { data: businesses } = await admin.from("businesses").select("owner_id");
      const ownerSet = new Set((businesses ?? []).map((b: any) => b.owner_id));
      const now = Date.now();
      const dropoff = (users?.users ?? [])
        .filter((u: any) => !ownerSet.has(u.id))
        .map((u: any) => ({
          id: u.id,
          email: u.email ?? "",
          created_at: u.created_at,
          days_since: Math.floor((now - new Date(u.created_at).getTime()) / 86400000),
          last_sign_in_at: u.last_sign_in_at ?? null,
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const { data: admins } = await admin
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminRows = (admins ?? []).map((a: any) => ({
        id: a.user_id,
        email: (users?.users ?? []).find((u: any) => u.id === a.user_id)?.email ?? "",
      }));

      return json({ dropoff, admins: adminRows, totalUsers: users?.users.length ?? 0 });
    }

    if (type === "business_detail") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "id required" }, 400);
      const [{ data: biz }, { data: txs }, { data: products }] = await Promise.all([
        admin.from("businesses").select("id, name, owner_id, category, created_at, address, phone").eq("id", id).maybeSingle(),
        admin
          .from("transactions")
          .select("id, total, payment_method, order_type, created_at, items")
          .eq("business_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        admin.from("products").select("id, name, price, stock").eq("business_id", id),
      ]);
      if (!biz) return json({ error: "Not found" }, 404);

      const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const owner = (users?.users ?? []).find((u: any) => u.id === biz.owner_id);

      return json({
        business: { ...biz, owner_email: owner?.email ?? "" },
        transactions: txs ?? [],
        products: products ?? [],
      });
    }

    return json({ error: "Unknown type" }, 400);
  } catch (e) {
    console.error("admin-stats error", e);
    return json({ error: (e as Error).message }, 500);
  }
});