import { ArrowDownRight, ArrowUpRight, Clock, Receipt, RefreshCw, ShoppingCart, Star, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PageHeader, StatusPill } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useGetDashboard } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import type { DashboardModel, DashboardRange, KpiValue } from "@/services/DashboardServices";

const RANGES: DashboardRange[] = ["today", "week", "month", "year"];
const REVENUE_COLOR = "#2a78d6";
const EXPENSE_COLOR = "#eb6834";

const fmt = (n: number) => Math.round(n || 0).toLocaleString();
const compact = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${+(n / 1_000).toFixed(1)}k` : String(Math.round(n));

const normStatus = (s: string) => s.toLowerCase().replace(/[\s-]+/g, "_");
const STATUS_BAR: Record<string, string> = {
  pending: "bg-amber-500",
  preparing: "bg-blue-500",
  out_for_delivery: "bg-violet-500",
  delivered: "bg-green-600",
  cancelled: "bg-red-500",
};
const STATUS_TONE: Record<string, string> = {
  pending: "warning",
  preparing: "info",
  out_for_delivery: "info",
  delivered: "success",
  cancelled: "danger",
};

/* ------------------------------------------------------------------ shared */

function Card({ title, aside, children, className = "" }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border bg-card p-4 text-card-foreground ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {aside && <div className="text-xs text-muted-foreground">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

function Empty() {
  const { t } = useI18n();
  return <p className="py-6 text-center text-sm text-muted-foreground">{t("dashboard.noData")}</p>;
}

function BarRow({ label, value, max, display, barClass = "bg-primary" }: { label: string; value: number; max: number; display: string; barClass?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 border-t py-2 text-sm first:border-t-0">
      <span className="w-28 shrink-0 truncate sm:w-32">{label}</span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 shrink-0 text-end tabular-nums">{display}</span>
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  return src ? (
    <img src={src} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
  ) : (
    <div className="size-10 shrink-0 rounded-md border border-dashed" />
  );
}

/* --------------------------------------------------------------------- KPI */

function Delta({ kpi }: { kpi: KpiValue }) {
  const { t } = useI18n();
  if (kpi.change_pct === null || kpi.change_pct === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const up = kpi.change_pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${up ? "text-green-600" : "text-red-600"}`}>
      <Icon className="size-3.5" />
      {Math.abs(kpi.change_pct)}% <span className="text-muted-foreground">{t("dashboard.vsPrevious")}</span>
    </span>
  );
}

function KpiCard({ label, icon: Icon, value, footer }: { label: string; icon: typeof Wallet; value: string; footer: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/50 p-3.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{label}</span>
        <Icon className="size-4 shrink-0" />
      </div>
      <p className="my-1 truncate text-2xl font-medium tabular-nums">{value}</p>
      {footer}
    </div>
  );
}

/* ------------------------------------------------------------------- chart */

function RevenueChart({ data }: { data: DashboardModel["revenue_vs_expenses"] }) {
  const { t } = useI18n();
  const [hover, setHover] = useState<number | null>(null);

  const W = 640, H = 230, L = 46, R = 14, T = 12, B = 26;
  const n = data.length;
  const top = Math.max(1, ...data.map((d) => Math.max(d.revenue, d.expenses)));
  const step = Math.pow(10, Math.floor(Math.log10(top)));
  const yMax = Math.ceil(top / step) * step;
  const x = (i: number) => (n === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (n - 1));
  const y = (v: number) => T + (1 - v / yMax) * (H - T - B);
  const line = (key: "revenue" | "expenses") => data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[key])}`).join(" ");
  const area = n > 1 ? `${line("revenue")} L${x(n - 1)},${H - B} L${x(0)},${H - B} Z` : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    data.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    });
    setHover(best);
  };

  if (!n) return <Empty />;
  const h = hover !== null ? data[hover] : null;

  return (
    <div>
      <div className="mb-2 flex min-h-5 flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: REVENUE_COLOR }} />{t("dashboard.revenue")}</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: EXPENSE_COLOR }} />{t("dashboard.expenses")} ({t("dashboard.dashed")})</span>
        </div>
        {h && (
          <span className="tabular-nums">
            {h.label}: <b className="font-medium" style={{ color: REVENUE_COLOR }}>{fmt(h.revenue)}</b> · <b className="font-medium" style={{ color: EXPENSE_COLOR }}>{fmt(h.expenses)}</b>
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-pan-y"
        role="img"
        aria-label={t("dashboard.revenueVsExpenses")}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground" fontSize={11}>{compact(v)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground" fontSize={11}>{d.label}</text>
        ))}
        {area && <path d={area} fill={REVENUE_COLOR} opacity={0.1} />}
        {n > 1 && <path d={line("revenue")} fill="none" stroke={REVENUE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {n > 1 && <path d={line("expenses")} fill="none" stroke={EXPENSE_COLOR} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.revenue)} r={hover === i ? 5 : 3} fill={REVENUE_COLOR} />
            <circle cx={x(i)} cy={y(d.expenses)} r={hover === i ? 5 : 3} fill={EXPENSE_COLOR} />
          </g>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="3 3" />}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------- page */

export default function DashboardPage() {
  const { t } = useI18n();
  const [range, setRange] = useState<DashboardRange>("week");
  const { data, isLoading, error, refetch, isFetching } = useGetDashboard(range);

  const statusLabel = (s: string) => {
    const key = `order.status.${normStatus(s)}`;
    const label = t(`order.status.${normStatus(s)}` as Parameters<typeof t>[0]);
    return label;
  };

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        action={
          <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            {t("dashboard.refresh")}
          </Button>
        }
      />

      <Tabs value={range} onValueChange={(v) => setRange(v as DashboardRange)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-fit">
          {RANGES.map((r) => (
            <TabsTrigger key={r} value={r}>{t(`dashboard.range.${r}`)}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingSpinner />
      ) : error || !data ? (
        <ErrorMessage />
      ) : (
        <div className={`space-y-4 transition-opacity ${isFetching ? "opacity-70" : ""}`}>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <KpiCard label={t("dashboard.revenue")} icon={Wallet} value={fmt(data.kpis.revenue.value)} footer={<Delta kpi={data.kpis.revenue} />} />
            <KpiCard label={t("dashboard.orders")} icon={ShoppingCart} value={fmt(data.kpis.orders.value)} footer={<Delta kpi={data.kpis.orders} />} />
            <KpiCard label={t("dashboard.avgOrderValue")} icon={Receipt} value={fmt(data.kpis.avg_order_value.value)} footer={<Delta kpi={data.kpis.avg_order_value} />} />
            <KpiCard label={t("dashboard.netProfit")} icon={TrendingUp} value={fmt(data.kpis.net_profit.value)} footer={<Delta kpi={data.kpis.net_profit} />} />
            <KpiCard label={t("dashboard.newCustomers")} icon={UserPlus} value={fmt(data.kpis.new_customers.value)} footer={<Delta kpi={data.kpis.new_customers} />} />
            <KpiCard
              label={t("dashboard.pendingOrders")}
              icon={Clock}
              value={fmt(data.kpis.pending_orders)}
              footer={
                <span className={`text-xs ${data.kpis.pending_orders > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                  {data.kpis.pending_orders > 0 ? t("dashboard.needsAction") : t("dashboard.allClear")}
                </span>
              }
            />
          </div>

          {/* Revenue vs expenses */}
          <Card title={t("dashboard.revenueVsExpenses")}>
            <RevenueChart data={data.revenue_vs_expenses} />
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Orders by status */}
            <Card title={t("dashboard.ordersByStatus")} aside={t("dashboard.live")}>
              {data.orders_by_status.length ? (
                (() => {
                  const max = Math.max(...data.orders_by_status.map((s) => s.count));
                  return data.orders_by_status.map((s) => (
                    <BarRow
                      key={s.status}
                      label={statusLabel(s.status)}
                      value={s.count}
                      max={max}
                      display={fmt(s.count)}
                      barClass={STATUS_BAR[normStatus(s.status)] ?? "bg-slate-400"}
                    />
                  ));
                })()
              ) : (
                <Empty />
              )}
            </Card>

            {/* Sales by category */}
            <Card title={t("dashboard.salesByCategory")} aside={t("dashboard.percentOfRevenue")}>
              {data.sales_by_category.length ? (
                data.sales_by_category.map((c) => (
                  <BarRow key={c.category_id} label={c.category_name} value={c.percent} max={Math.max(...data.sales_by_category.map((x) => x.percent))} display={`${Math.round(c.percent)}%`} />
                ))
              ) : (
                <Empty />
              )}
            </Card>

            {/* Top sellers */}
            <Card title={t("dashboard.topSellers")} aside={t("dashboard.unitsRevenue")}>
              {data.top_products.length ? (
                data.top_products.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 border-t py-2 text-sm first:border-t-0">
                    <span className="w-4 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
                    <Thumb src={p.image} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{p.product_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.category_name}</p>
                    </div>
                    <span className="shrink-0 text-end text-xs tabular-nums">
                      {fmt(p.units_sold)} · {fmt(p.revenue)}
                    </span>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </Card>

            {/* Low stock */}
            <Card title={t("dashboard.lowStock")} aside={data.low_stock.length ? <StatusPill label={`${data.low_stock.length}`} tone="warning" /> : null}>
              {data.low_stock.length ? (
                data.low_stock.map((p) => {
                  const critical = p.stock_qty <= 0 || (p.days_left !== null && p.days_left <= 3);
                  return (
                    <div key={p.id} className="flex items-center gap-3 border-t py-2 text-sm first:border-t-0">
                      <Thumb src={p.image} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{p.product_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.product_name_ar}</p>
                      </div>
                      <StatusPill
                        label={
                          p.stock_qty <= 0
                            ? t("products.outOfStock")
                            : `${p.stock_qty} ${t("dashboard.left")}${p.days_left !== null ? ` · ~${Math.ceil(p.days_left)} ${t("dashboard.days")}` : ""}`
                        }
                        tone={critical ? "danger" : "warning"}
                      />
                    </div>
                  );
                })
              ) : (
                <Empty />
              )}
            </Card>
          </div>

          {/* Recent orders */}
          <Card title={t("dashboard.recentOrders")}>
            {data.recent_orders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="py-1.5 pe-3 text-start font-normal">{t("dashboard.order")}</th>
                      <th className="py-1.5 pe-3 text-start font-normal">{t("field.user")}</th>
                      <th className="py-1.5 pe-3 text-start font-normal">{t("field.area")}</th>
                      <th className="py-1.5 pe-3 text-start font-normal">{t("dashboard.total")}</th>
                      <th className="py-1.5 pe-3 text-start font-normal">{t("common.status")}</th>
                      <th className="py-1.5 text-start font-normal">{t("field.createdAt")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_orders.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="py-2 pe-3 font-mono text-xs">#{o.id.slice(0, 6).toUpperCase()}</td>
                        <td className="py-2 pe-3">{o.user?.first_name} {o.user?.last_name}</td>
                        <td className="py-2 pe-3">{o.area?.area_name}</td>
                        <td className="py-2 pe-3 tabular-nums">{fmt(o.total)}</td>
                        <td className="py-2 pe-3"><StatusPill label={statusLabel(o.status)} tone={STATUS_TONE[normStatus(o.status)] ?? "neutral"} /></td>
                        <td className="py-2 text-muted-foreground">{o.created_at?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty />
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Sales by delivery area */}
            <Card title={t("dashboard.salesByArea")} aside={t("dashboard.orders")}>
              {data.sales_by_area.length ? (
                data.sales_by_area.map((a) => (
                  <BarRow key={a.area_id} label={a.area_name} value={a.orders} max={Math.max(...data.sales_by_area.map((x) => x.orders))} display={fmt(a.orders)} />
                ))
              ) : (
                <Empty />
              )}
            </Card>

            {/* Reviews */}
            <Card title={t("dashboard.reviews")} aside={`${data.reviews.new_today} ${t("dashboard.newToday")}`}>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium">{data.reviews.average ? data.reviews.average.toFixed(1) : "—"}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {fmt(data.reviews.count)} {t("dashboard.reviewsCount")}
                </span>
              </div>
              {data.reviews.latest.length ? (
                data.reviews.latest.map((r) => {
                  const rate = Number(r.rate) || 0;
                  return (
                    <div key={r.id} className="border-t py-2 text-sm first:border-t-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{r.user?.first_name} {r.user?.last_name}</span>
                        <span className="flex shrink-0 items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`size-3.5 ${i <= rate ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                          ))}
                          {rate <= 2 && <StatusPill label={t("dashboard.lowRating")} tone="danger" />}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{r.review}</p>
                    </div>
                  );
                })
              ) : (
                <Empty />
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}