import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable, FormDialog, PageHeader, SelectField, StatCard, StatusPill, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useGetAllUsers, useGetPackage, useGetPackageBookings } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { useSimpleToast } from "@/components/ui/toaster";
import { createPackageBookings, PackageBookingModel, updatePackageBookings } from "@/services/PackageBookingServices";

export type BookingStatus = "Submitted" | "InProgress" | "Approved" | "Cancelled";

export default function BookingsPage() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: bookings, isLoading: isBookingsLoading, error: isBookingsError, refetch } = useGetPackageBookings();
  const { data: packages, isLoading: isPackagesLoading, error: isPackagesError } = useGetPackage();
  const { data: users, isLoading: isUsersLoading, error: isUsersError } = useGetAllUsers();

  const emptyBooking = {
    user: "",
    package: "",
    package_pricing: "",
    number_of_adults: 1,
    number_of_childrens: 0,
    booking_status: "Submitted" as BookingStatus,
    paid_amount: 0,
    remaining_amount: 0,
    check_in_date: "",
    total_amount: 0,
  };

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [form, setForm] = useState(emptyBooking);
  const set = (patch: Partial<typeof emptyBooking>) => setForm((f) => ({ ...f, ...patch }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPackage = packages?.find((p) => p.id === form.package);
  const pricingOptions = selectedPackage?.package_pricing ?? [];

  useEffect(() => {
    if (form.package_pricing && !pricingOptions.some((p) => p.id === form.package_pricing)) {
      set({ package_pricing: "" });
    }
  }, [form.package]);

  const rows = filter === "all" ? bookings : bookings.filter((b) => b.booking_status === filter);

  const columns: Column<PackageBookingModel>[] = [
    {
      key: "package",
      header: t("field.package"),
      cell: (b) => <span className="font-medium">{b.package?.package_title ?? "—"}</span>,
    },
    { key: "user", header: t("field.user"), cell: (b) => `${b.user.first_name} ${b.user.last_name}` },
    {
      key: "pricing",
      header: t("pkg.pricing"),
      cell: (b) =>
        b.package_pricing
          ? `${b.package_pricing.title} · ${b.package_pricing.date_from} → ${b.package_pricing.date_to} · ${b.package_pricing.price} ${b.package_pricing.price_currency}`
          : "—",
    },
    { key: "adults", header: t("field.adults"), cell: (b) => b.number_of_adults },
    { key: "children", header: t("field.children"), cell: (b) => b.number_of_childrens },
    { key: "submitted", header: t("field.submittedAt"), cell: (b) => String(b.submitted_at).slice(0, 10) },
    { key: "paid", header: t("field.paidAmount"), cell: (b) => `${b.paid_amount} ` },
    { key: "remaining", header: t("field.remainingAmount"), cell: (b) => `${b.remaining_amount} ` },
    { key: "total", header: t("totalAmount"), cell: (b) => `${b.total_amount} ` },
    {
      key: "status",
      header: t("field.bookingStatus"),
      cell: (b) => <StatusPill label={String(b.booking_status)} tone={String(b.booking_status)} />,
    },
  ];

  const resetDialogState = () => {
    setEditingId(null);
    setForm(emptyBooking);
  };

  const openCreateDialog = () => {
    resetDialogState();
    setOpen(true);
  };

  const openEditDialog = (b: PackageBookingModel) => {
    setEditingId(b.id);
    setForm({
      package: b.package.id,
      package_pricing: b.package_pricing?.id ?? "",
      user: b.user.id,
      number_of_adults: b.number_of_adults,
      number_of_childrens: b.number_of_childrens,
      booking_status: b.booking_status as BookingStatus,
      paid_amount: b.paid_amount,
      remaining_amount: b.remaining_amount,
      check_in_date: b.check_in_date,
      total_amount: b.total_amount,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (editingId) {
        const formData = new FormData();
        const booking = bookings.find((x) => x.id === editingId);
        formData.append("id", editingId);
        if (form.user !== booking.user.id) formData.append("user_id", form.user);
        if (form.package !== booking.package.id) formData.append("package_id", form.package);
        if (form.package_pricing !== (booking.package_pricing?.id ?? "")) {
          formData.append("package_pricing_id", form.package_pricing);
        }
        if (form.booking_status !== booking.booking_status) formData.append("booking_status", form.booking_status);
        if (form.number_of_adults !== booking.number_of_adults) formData.append("number_of_adults", String(form.number_of_adults));
        if (form.number_of_childrens !== booking.number_of_childrens) formData.append("number_of_childrens", String(form.number_of_childrens));
        if (form.paid_amount !== booking.paid_amount) formData.append("paid_amount", String(form.paid_amount));
        if (form.remaining_amount !== booking.remaining_amount) formData.append("remaining_amount", String(form.remaining_amount));
        if (form.total_amount !== booking.total_amount) formData.append("total_amount", String(form.total_amount));
        if (form.check_in_date !== booking.check_in_date) formData.append("check_in_date", String(form.check_in_date));

        const res = await updatePackageBookings(formData as any);
        if (res.status === 200) {
          await refetch();
          success(t("common.saved"));
          setOpen(false);
          resetDialogState();
        }
      } else {
        const res = await createPackageBookings({
          user_id: form.user,
          package_id: form.package,
          package_pricing_id: form.package_pricing,
          number_of_adults: String(form.number_of_adults),
          number_of_childrens: String(form.number_of_childrens),
          booking_status: form.booking_status,
          paid_amount: String(form.paid_amount),
          remaining_amount: String(form.remaining_amount),
          check_in_date: form.check_in_date,
        });

        if (res.status === 201) {
          await refetch();
          success(t("common.saved"));
          setOpen(false);
          resetDialogState();
        }
      }
    } catch (e) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBookingsLoading) return <LoadingSpinner />;
  if (isBookingsError) return <ErrorMessage />;

  return (
    <>
      <PageHeader
        title={t("book.title")}
        subtitle={t("book.subtitle")}
        action={
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="size-4" />
            {t("book.create")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label={t("dash.stat.bookings")} value={bookings.length} />
        <StatCard
          label={t("dash.stat.pending")}
          value={bookings.filter((b) => b.booking_status === "Submitted").length}
        />
        <StatCard
          label={t("dash.stat.revenue")}
          value={bookings.reduce((s, b) => s + b.paid_amount, 0).toLocaleString("en-US")}
        />
        <StatCard
          label={t("dash.stat.outstanding")}
          value={bookings.reduce((s, b) => s + b.remaining_amount, 0).toLocaleString("en-US")}
        />
        <StatCard
          label={t("totalAmount")}
          value={bookings.reduce((s, b) => s + b.total_amount, 0).toLocaleString("en-US")}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "Submitted", "InProgress", "Approved", "Cancelled"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? t("common.all") : t(`book.status.${s}`)}
          </Button>
        ))}
      </div>

      <DataTable columns={columns} rows={rows} onEdit={openEditDialog} />

      <FormDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetDialogState();
        }}
        isLoading={isSubmitting}
        wide
        title={editingId ? t("book.edit") : t("book.create")}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {isPackagesLoading ? (
            <LoadingSpinner />
          ) : isPackagesError ? (
            <ErrorMessage />
          ) : (
            <SelectField
              label={t("field.package")}
              value={form.package}
              onChange={(v) => set({ package: v })}
              options={packages.map((p) => ({ value: p.id, label: p.package_title }))}
            />
          )}

          <SelectField
            label={t("pkg.pricing")}
            value={form.package_pricing}
            onChange={(v) => {
              const selected = pricingOptions.find((p) => String(p.id) === String(v));
              const newPrice = selected ? Number(selected.price) || 0 : 0;
              set({
                package_pricing: v,
                total_amount: newPrice,
              });
            }}
            options={pricingOptions.map((p) => ({
              value: p.id,
              label: `${p.title} · ${p.date_from} → ${p.date_to} · ${p.price} ${p.price_currency}`,
            }))}
          />

          {isUsersLoading ? (
            <LoadingSpinner />
          ) : isUsersError ? (
            <ErrorMessage />
          ) : (
            <SelectField
              label={t("field.user")}
              value={form.user}
              onChange={(v) => set({ user: v })}
              options={users.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))}
            />
          )}
          <TextField
            label={t("field.adults")}
            type="number"
            value={form.number_of_adults}
            onChange={(v) => set({ number_of_adults: Number(v) || 0 })}
          />
          <TextField
            label={t("field.children")}
            type="number"
            value={form.number_of_childrens}
            onChange={(v) => set({ number_of_childrens: Number(v) || 0 })}
          />
          <SelectField
            label={t("field.bookingStatus")}
            value={form.booking_status}
            onChange={(v) => set({ booking_status: v as BookingStatus })}
            options={[
              { value: "Submitted", label: t("book.status.Submitted") },
              { value: "InProgress", label: t("book.status.InProgress") },
              { value: "Cancelled", label: t("book.status.Cancelled") },
              { value: "Approved", label: t("book.status.Approved") },
            ]}
          />
          <TextField
            label={t("field.paidAmount")}
            type="number"
            value={form.paid_amount}
            onChange={(v) => set({ paid_amount: Number(v) || 0 })}
          />
          <TextField
            label={t("field.remainingAmount")}
            type="number"
            value={form.remaining_amount}
            onChange={(v) => set({ remaining_amount: Number(v) || 0 })}
          />
          <TextField
            label={t("field.checkInDate")}
            type="date"
            value={form.check_in_date}
            onChange={(v) => set({ check_in_date: v })}
          />
          <TextField
            label={t("totalAmount")}
            type="number"
            value={form.total_amount}
            onChange={(v) => set({total_amount: Number(v)})}
          />
        </div>
      </FormDialog>
    </>
  );
}