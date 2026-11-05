import { Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { ArchivedPill, DataTable, FormDialog, PageHeader, SelectField, StatusPill, SwitchField, TextAreaField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useGetAllUsers, useGetOurReviews } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { createOurReviews, updateOurReviews, type OurReviewsModel } from "@/services/ReviewsServices";

const emptyReview = {
  user_id: "",
  order_id: "",
  rate: "5",
  review: "",
  is_archived: false,
  is_top: false,
};

const RATE_OPTIONS = ["1", "2", "3", "4", "5"].map((v) => ({ value: v, label: `${v} ★` }));

function Stars({ rate }: { rate: string }) {
  const n = Math.max(0, Math.min(5, Number(rate) || 0));
  return (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap" aria-label={`${n}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${i <= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: reviews, isLoading, error: isError, refetch } = useGetOurReviews();
  const { data: users } = useGetAllUsers(); // only needed to pick the author when creating

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyReview);
  const set = (patch: Partial<typeof emptyReview>) => setForm((f) => ({ ...f, ...patch }));
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);

  const editingReview = reviews?.find((r) => r.id === editingId);
  const shortId = (id?: string) => (id ? `#${id.slice(0, 8)}` : "—");

  // newest first
  const rows = useMemo(
    () => [...(reviews ?? [])].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")),
    [reviews],
  );

  const columns: Column<OurReviewsModel>[] = [
    {
      key: "user",
      header: t("field.user"),
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {r.user?.first_name?.charAt(0)}
            {r.user?.last_name?.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {r.user?.first_name} {r.user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground" dir="ltr">
              {r.user?.phone}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "order",
      header: t("field.order"),
      cell: (r) => (
        <div className="flex flex-col items-start gap-1">
          <span className="font-mono text-xs">{shortId(r.order?.id)}</span>
          {r.order?.status && <StatusPill label={r.order.status} tone="neutral" />}
        </div>
      ),
    },
    { key: "rate", header: t("field.rate"), cell: (r) => <Stars rate={r.rate} /> },
    {
      key: "review",
      header: t("field.review"),
      cell: (r) => <span className="line-clamp-2 max-w-[20rem] text-muted-foreground">{r.review}</span>,
    },
    { key: "created", header: t("field.createdAt"), cell: (r) => r.created_at?.slice(0, 10) },
    {
      key: "top",
      header: t("field.isTop"),
      cell: (r) => (r.is_top ? <StatusPill label={t("reviews.top")} tone="success" /> : <span className="text-muted-foreground">—</span>),
    },
    { key: "archived", header: t("common.status"), cell: (r) => <ArchivedPill archived={r.is_archived} /> },
  ];

  const handleCreate = async () => {
    if (!form.user_id || !form.order_id.trim()) return error(t("reviews.userOrderRequired"));
    setIsCreateUpdateLoading(true);
    try {
      const res = await createOurReviews(form);
      if (res.status === 201) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleUpdate = async () => {
    const review = reviews?.find((x) => x.id === editingId);
    if (!editingId || !review) return;
    setIsCreateUpdateLoading(true);

    const formData = new FormData();
    formData.append("id", editingId);
    if (form.rate !== String(review.rate)) formData.append("rate", form.rate);
    if (form.review !== review.review) formData.append("review", form.review);
    if (form.is_archived !== review.is_archived) formData.append("is_archived", String(form.is_archived));
    if (form.is_top !== review.is_top) formData.append("is_top", String(form.is_top));

    try {
      const res = await updateOurReviews(formData);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t("reviews.title")}
        subtitle={t("reviews.subtitle")}
        action={
          <Button
            className="gap-2"
            disabled={isCreateUpdateLoading}
            onClick={() => {
              setEditingId(null);
              setForm(emptyReview);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            {isCreateUpdateLoading ? t("loading") : t("action.create")}
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorMessage />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onEdit={(r) => {
            setEditingId(r.id);
            setForm({
              ...emptyReview,
              rate: String(r.rate),
              review: r.review,
              is_archived: r.is_archived,
              is_top: r.is_top,
            });
            setOpen(true);
          }}
        />
      )}

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        wide
        title={editingId ? t("reviews.edit") : t("reviews.create")}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          {/* author + order are only sent on create (the PATCH doesn't take them) */}
          {!editingId && (
            <>
              <SelectField
                label={t("field.user")}
                value={form.user_id}
                onChange={(v) => set({ user_id: v })}
                options={(users ?? []).map((u) => ({
                  value: u.id,
                  label: `${u.first_name} ${u.last_name} · ${u.phone}`,
                }))}
              />
              <TextField label={t("field.orderId")} value={form.order_id} onChange={(v) => set({ order_id: v })} />
            </>
          )}
          {editingReview && (
            <div className="grid gap-3 rounded-md border bg-muted/40 p-3 text-sm sm:col-span-2 sm:grid-cols-2 [&>*]:min-w-0">
              <div>
                <p className="text-xs text-muted-foreground">{t("field.user")}</p>
                <p className="truncate font-medium">
                  {editingReview.user?.first_name} {editingReview.user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {editingReview.user?.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("field.order")}</p>
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs">{shortId(editingReview.order?.id)}</span>
                  {editingReview.order?.status && <StatusPill label={editingReview.order.status} tone="neutral" />}
                </p>
                <p className="text-xs text-muted-foreground">{editingReview.order?.created_at?.slice(0, 10)}</p>
              </div>
            </div>
          )}
          <SelectField label={t("field.rate")} value={form.rate} onChange={(v) => set({ rate: v })} options={RATE_OPTIONS} />
          <div className="flex items-end gap-6">
            <SwitchField label={t("field.isTop")} checked={form.is_top} onChange={(v) => set({ is_top: v })} />
            <SwitchField label={t("field.isArchived")} checked={form.is_archived} onChange={(v) => set({ is_archived: v })} />
          </div>
          <TextAreaField
            label={t("field.review")}
            value={form.review}
            onChange={(v) => set({ review: v })}
            className="sm:col-span-2"
            rows={4}
          />
        </div>
      </FormDialog>
    </>
  );
}