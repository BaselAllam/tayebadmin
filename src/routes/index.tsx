import { CalendarClock, DollarSign, MapPin, Package, Ticket, Users, Wallet } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable, PageHeader, StatCard, StatusPill, type Column } from "@/components/admin/kit";
import { useI18n } from "@/lib/i18n";
import { useGetDashboard } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { BookingStatus } from "./packages.bookings";
import { useMemo } from "react";
import { PackageBookingModel } from "@/services/PackageBookingServices";

const statusTone: Record<string, string> = {
  Pending: "warning",
  InProgress: "info",
  Approved: "success",
  Cancelled: "danger",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const { data: dashboard, isLoading: isDashboardLoading, error: isDashboardError } = useGetDashboard();

  const PIE_COLORS = {
    Approved: "var(--success)",
    Submitted: "var(--warning)",
    InProgress: "var(--primary)",
    Cancelled: "var(--destructive)"
  };

  const pieData = useMemo(() => {
    if (!dashboard?.booking_by_status) return [];
    return Object.entries(dashboard.booking_by_status).map(([statusKey, count]) => ({
      name: statusKey,
      value: count
    }));
  }, [dashboard?.booking_by_status]);

  const pendingColumns: Column<PackageBookingModel>[] = [
    {
      key: "package",
      header: t("field.package"),
      cell: (b) => (
        <span className="font-medium">
          {b.package.package_title}
        </span>
      ),
    },
    {
      key: "user",
      header: t("field.user"),
      cell: (b) => `${b.user.first_name} ${b.user.last_name}`,
    },
    {
      key: "travelers",
      header: t("dash.travelers"),
      cell: (b) => `${b.number_of_adults} + ${b.number_of_childrens}`,
    },
    { key: "submitted", header: t("field.submittedAt"), cell: (b) => b.submitted_at.slice(0, 10) },
    {
      key: "paid",
      header: t("field.paidAmount"),
      cell: (b) => b.paid_amount,
    },
    {
      key: "remaining",
      header: t("field.remainingAmount"),
      cell: (b) => b.remaining_amount
    },
    {
      key: "status",
      header: t("common.status"),
      cell: (b) => (
        <StatusPill
          label={b.booking_status as BookingStatus}
          tone={statusTone[b.booking_status as BookingStatus] ?? "neutral"}
        />
      ),
    },
  ];

  if (isDashboardLoading) return <LoadingSpinner/>;
  if (isDashboardError) return <ErrorMessage/>;

  return (
    <>
      <div className="gradient-hero rounded-2xl p-6 sm:p-8 [&_h1]:text-sidebar-foreground [&_p]:text-sidebar-foreground/80">
        <PageHeader title={t("dash.title")} subtitle={t("dash.subtitle")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dash.stat.packages")}
          value={dashboard?.active_packages}
          hint={`${dashboard?.active_packages} ${t("common.total").toLowerCase()}`}
          icon={<Package className="size-5" />}
        />
        <StatCard
          label={t("dash.stat.bookings")}
          value={dashboard?.total_bookings}
          icon={<Ticket className="size-5" />}
        />
        <StatCard
          label={t("dash.stat.pending")}
          value={dashboard?.pending_bookings}
          icon={<CalendarClock className="size-5" />}
        />
        <StatCard
          label={t("dash.stat.revenue")}
          value={dashboard?.collected_revenue.toLocaleString("en-US")}
          icon={<DollarSign className="size-5" />}
        />
        <StatCard
          label={t("dash.stat.outstanding")}
          value={dashboard?.outstanding_balance.toLocaleString("en-US")}
          icon={<Wallet className="size-5" />}
        />
        <StatCard
          label={t("dash.stat.users")}
          value={dashboard?.users}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label={t("dash.stat.destinations")}
          value={dashboard?.destinations}
          icon={<MapPin className="size-5" />}
        />
        <StatCard
          label={t("dash.stat.requests")}
          value={dashboard?.contact_requests}
          hint={`${dashboard?.contact_requests} ${t("contact.status.new")}`}
          icon={<Ticket className="size-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
      {/* Packages Performance Bar Chart */}
      <div className="surface-card p-4 lg:col-span-2">
        <h2 className="text-base font-semibold">{t("dash.packagePerf")}</h2>
        <div className="mt-4 h-72 w-full">
          {dashboard?.packages_performance?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.packages_performance} margin={{ left: -20, right: 8 }}>
                <XAxis
                  dataKey="package_name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval={0}
                  height={50}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar 
                  dataKey="package_total_rev" 
                  name={t("dash.stat.bookings")} 
                  fill="var(--primary)" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No performance data available
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {dashboard?.packages_performance?.map((p) => (
            <div
              key={p.package_name}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
            >
              <span className="truncate pe-2">{p.package_name}</span>
              <span className="shrink-0 font-semibold text-primary">
                {p.package_total_rev}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings by Status Pie Chart */}
      <div className="surface-card p-4">
        <h2 className="text-base font-semibold">{t("dash.bookingsByStatus")}</h2>
        <div className="mt-2 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
              >
                {pieData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[entry.name] || "var(--primary)"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {Object.entries(dashboard?.booking_by_status || {}).map(([statusKey, count]) => (
            <div key={statusKey} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[statusKey] }}
              />
              <span className="flex-1">{statusKey}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dash.pendingBookings")}</h2>
        <DataTable columns={pendingColumns} rows={dashboard.pending_bookings_data} />
      </section>
    </>
  );
}
