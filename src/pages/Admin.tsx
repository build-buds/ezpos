import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  Users, Store, Package, Receipt, Wallet, TrendingUp, Loader2,
  ChevronLeft, ChevronRight, ShieldCheck,
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import {
  useAdminOverview, useAdminTimeline, useAdminBusinesses, useAdminUsers, useBusinessDetail,
} from "@/hooks/useAdminStats";

const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <p className="text-2xl font-extrabold mt-2 tabular-nums">{value}</p>
    {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
  </Card>
);

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Aktif", cls: "bg-primary/15 text-primary" },
    dormant: { label: "Pasif", cls: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
    inactive: { label: "Belum Aktif", cls: "bg-muted text-muted-foreground" },
  };
  const v = map[s] ?? map.inactive;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.cls}`}>{v.label}</span>;
};

const AdminPage = () => {
  const [tab, setTab] = useState("overview");
  const [granularity, setGranularity] = useState<"day" | "week">("day");
  const [page, setPage] = useState(0);
  const [selectedBiz, setSelectedBiz] = useState<string | null>(null);

  const overview = useAdminOverview();
  const timeline = useAdminTimeline(granularity);
  const businesses = useAdminBusinesses(page);
  const users = useAdminUsers();
  const detail = useBusinessDetail(selectedBiz);

  return (
    <MobileLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 pb-24">
        <header className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl md:text-2xl font-extrabold">Admin Dashboard</h1>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="businesses">Toko</TabsTrigger>
            <TabsTrigger value="users">User</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {overview.isLoading || !overview.data ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard icon={Users} label="Total Signup" value={String(overview.data.totals.totalUsers)} />
                  <StatCard icon={Store} label="Buka Toko" value={String(overview.data.totals.ownersWithBusiness)}
                    sub={fmtPct(overview.data.totals.conversionSignupToBusiness) + " dari signup"} />
                  <StatCard icon={Package} label="Total Produk" value={String(overview.data.totals.totalProducts)} />
                  <StatCard icon={Receipt} label="Total Transaksi" value={String(overview.data.totals.totalTransactions)} />
                  <StatCard icon={Wallet} label="GMV Total" value={fmtIDR(overview.data.totals.totalGmv)} />
                  <StatCard icon={TrendingUp} label="Conv. Aktivasi"
                    value={fmtPct(overview.data.totals.conversionSignupToActive)} sub="Signup → Transaksi" />
                </div>

                <Card className="p-4">
                  <h2 className="text-sm font-bold mb-3">Funnel Onboarding</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overview.data.funnel} layout="vertical" margin={{ left: 20, right: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="step" type="category" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: "hsl(var(--muted))" }}
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                          formatter={(v: number) => [v, "User/Toko"]}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {overview.data.funnel.slice(0, -1).map((f, i) => {
                      const next = overview.data.funnel[i + 1];
                      const rate = f.value ? next.value / f.value : 0;
                      return (
                        <div key={f.step} className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-[10px] text-muted-foreground truncate">{f.step} → {next.step}</p>
                          <p className="text-sm font-bold tabular-nums">{fmtPct(rate)}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold">Timeline Pendaftaran & Aktivasi</h2>
                    <div className="flex gap-1">
                      {(["day", "week"] as const).map((g) => (
                        <Button key={g} size="sm" variant={granularity === g ? "default" : "outline"}
                          onClick={() => setGranularity(g)} className="h-7 text-xs">
                          {g === "day" ? "30 Hari" : "12 Minggu"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64">
                    {timeline.isLoading || !timeline.data ? (
                      <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeline.data.series}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="signups" name="Signup" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="businesses" name="Buka Toko" stroke="#D4FF00" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="activations" name="Transaksi 1st" stroke="#10B981" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* BUSINESSES */}
          <TabsContent value="businesses" className="space-y-3 mt-4">
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Toko</th>
                      <th className="px-3 py-2 font-semibold">Owner</th>
                      <th className="px-3 py-2 font-semibold">Kategori</th>
                      <th className="px-3 py-2 font-semibold text-right">Produk</th>
                      <th className="px-3 py-2 font-semibold text-right">Tx</th>
                      <th className="px-3 py-2 font-semibold text-right">GMV</th>
                      <th className="px-3 py-2 font-semibold">Tx Terakhir</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.isLoading && (
                      <tr><td colSpan={9} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></td></tr>
                    )}
                    {businesses.data?.rows.map((b) => (
                      <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{b.name}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{b.email}</td>
                        <td className="px-3 py-2 text-xs">{b.category}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{b.products}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{b.transactions}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-xs">{fmtIDR(b.gmv)}</td>
                        <td className="px-3 py-2 text-xs">{fmtDate(b.last_tx)}</td>
                        <td className="px-3 py-2">{statusBadge(b.status)}</td>
                        <td className="px-3 py-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedBiz(b.id)} className="h-7 text-xs">Detail</Button>
                        </td>
                      </tr>
                    ))}
                    {businesses.data && businesses.data.rows.length === 0 && (
                      <tr><td colSpan={9} className="py-8 text-center text-muted-foreground text-sm">Tidak ada data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {businesses.data && (
                <div className="flex items-center justify-between p-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {businesses.data.total} toko · halaman {page + 1} dari {Math.max(1, Math.ceil(businesses.data.total / businesses.data.pageSize))}
                  </p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="h-7">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline"
                      disabled={(page + 1) * businesses.data.pageSize >= businesses.data.total}
                      onClick={() => setPage((p) => p + 1)} className="h-7">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <Card className="p-4">
              <h2 className="text-sm font-bold mb-2">User Drop-off (signup tapi belum buka toko)</h2>
              {users.isLoading || !users.data ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="overflow-x-auto -mx-4">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold">Daftar</th>
                        <th className="px-3 py-2 font-semibold">Hari</th>
                        <th className="px-3 py-2 font-semibold">Login Terakhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.data.dropoff.map((u) => (
                        <tr key={u.id} className="border-t border-border">
                          <td className="px-3 py-2 text-xs">{u.email}</td>
                          <td className="px-3 py-2 text-xs">{fmtDate(u.created_at)}</td>
                          <td className="px-3 py-2 text-xs tabular-nums">{u.days_since}</td>
                          <td className="px-3 py-2 text-xs">{fmtDate(u.last_sign_in_at)}</td>
                        </tr>
                      ))}
                      {users.data.dropoff.length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-muted-foreground text-sm">Semua user sudah buka toko 🎉</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-bold mb-2">Admin Aktif</h2>
              {users.data?.admins.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 text-xs">
                  <span>{a.email}</span>
                  <Badge variant="secondary">admin</Badge>
                </div>
              ))}
            </Card>
          </TabsContent>
        </Tabs>

        <Sheet open={!!selectedBiz} onOpenChange={(o) => !o && setSelectedBiz(null)}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{detail.data?.business.name ?? "Detail Toko"}</SheetTitle>
            </SheetHeader>
            {detail.isLoading || !detail.data ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Owner: <span className="text-foreground">{detail.data.business.owner_email}</span></p>
                  <p>Kategori: <span className="text-foreground">{detail.data.business.category}</span></p>
                  <p>Dibuat: <span className="text-foreground">{fmtDate(detail.data.business.created_at)}</span></p>
                  {detail.data.business.phone && <p>Telp: <span className="text-foreground">{detail.data.business.phone}</span></p>}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-2">Transaksi Terakhir (20)</h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {detail.data.transactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-xs border-b border-border/50 py-1.5">
                        <div>
                          <p>{fmtDate(t.created_at)}</p>
                          <p className="text-muted-foreground">{t.payment_method}{t.order_type ? ` · ${t.order_type}` : ""}</p>
                        </div>
                        <p className="font-bold tabular-nums">{fmtIDR(t.total)}</p>
                      </div>
                    ))}
                    {detail.data.transactions.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">Belum ada transaksi</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-2">Produk ({detail.data.products.length})</h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {detail.data.products.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs border-b border-border/50 py-1.5">
                        <span>{p.name}</span>
                        <span className="tabular-nums">{fmtIDR(p.price)} · stok {p.stock}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MobileLayout>
  );
};

export default AdminPage;