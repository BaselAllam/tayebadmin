import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ArchivedPill, DataTable, FormDialog, PageHeader, SelectField, SwitchField, TextAreaField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useGetAllUsers, useGetExpenses, useGetSuppliers } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { base64ToFile } from "@/services/CoreServices";
import { createExpenses, updateExpenses, type ExpensesModel } from "@/services/ExpensesServices";
import { imgUrl } from "@/services/api";

const today = () => new Date().toISOString().slice(0, 10);

const emptyExpense = {
  item: "",
  qty: "1",
  expense_amount: "",
  notes: "",
  unit_type: "",
  purchase_date: today(),
  purchased_by: "",
  supplier: '',
  is_archived: false,
  purchase_receipt: null as File | string | null,
};


function ReceiptField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: File | string | null;
  onChange: (v: File | null) => void;
}) {
  const preview = useMemo(() => (value instanceof File ? URL.createObjectURL(value) : value || ""), [value]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="min-w-0 space-y-1.5 sm:col-span-2">
      <Label>{label}</Label>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      {preview && (
        <a href={preview.startsWith("blob:") ? undefined : preview} target="_blank" rel="noreferrer">
          <img src={preview} alt={label} className="mt-2 max-h-48 max-w-full rounded-md border object-contain" />
        </a>
      )}
    </div>
  );
}

const personName = (u?: { first_name: string; last_name: string }) => (u ? `${u.first_name} ${u.last_name}` : "—");

export default function ExpensesPage() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: expenses, isLoading, error: isError, refetch } = useGetExpenses();
  const { data: suppliers } = useGetSuppliers();
  const { data: users } = useGetAllUsers();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyExpense);
  const set = (patch: Partial<typeof emptyExpense>) => setForm((f) => ({ ...f, ...patch }));
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);

  const purchaserOptions = useMemo(() => {
    const staff = (users ?? []).filter((u) => u.is_staff);
    return (staff.length ? staff : users ?? []).map((u) => ({
      value: u.id,
      label: `${u.first_name} ${u.last_name} · ${u.phone}`,
    }));
  }, [users]);

  const rows = useMemo(
    () => [...(expenses ?? [])].sort((a, b) => (b.purchase_date ?? "").localeCompare(a.purchase_date ?? "")),
    [expenses],
  );

  const columns: Column<ExpensesModel>[] = [
    { key: "item", header: t("field.item"), cell: (e) => <span className="font-medium">{e.item}</span> },
    { key: "qty", header: t("field.qty"), cell: (e) => e.qty },
    { key: "amount", header: t("field.expenseAmount"), cell: (e) => Number(e.expense_amount).toLocaleString() },
    {
      key: "purchasedBy",
      header: t("field.purchasedBy"),
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate">{personName(e.purchased_by)}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{e.purchased_by?.phone}</p>
        </div>
      ),
    },
    { key: "date", header: t("field.purchaseDate"), cell: (e) => e.purchase_date?.slice(0, 10) },
    {
      key: "receipt",
      header: t("field.receipt"),
      cell: (e) =>
        e.purchase_receipt ? (
          <a href={e.purchase_receipt} target="_blank" rel="noreferrer">
            <img src={`${imgUrl}${e.purchase_receipt}`} alt="" className="size-10 rounded border object-cover" />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "createdBy", header: t("field.createdBy"), cell: (e) => personName(e.created_by) },
    { key: "archived", header: t("common.status"), cell: (e) => <ArchivedPill archived={e.is_archived} /> },
  ];

  const handleCreate = async () => {
    if (!form.item.trim() || !form.purchased_by || !form.purchase_date) return error(t("expenses.requiredFields"));
    setIsCreateUpdateLoading(true);
    try {
      const res = await createExpenses({
        ...form,
        qty: Number(form.qty) || 0,
        expense_amount: Number(form.expense_amount) || 0,
      });
      if (res.status === 201) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      error(errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong"));
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleUpdate = async () => {
    const expense = expenses?.find((x) => x.id === editingId);
    if (!editingId || !expense) return;
    setIsCreateUpdateLoading(true);

    const formData = new FormData();
    formData.append("id", editingId);
    if (form.item !== expense.item) formData.append("item", form.item);
    if (Number(form.qty) !== Number(expense.qty)) formData.append("qty", String(Number(form.qty) || 0));
    if (Number(form.expense_amount) !== Number(expense.expense_amount)) formData.append("expense_amount", String(Number(form.expense_amount) || 0));
    if (form.notes !== (expense.notes ?? "")) formData.append("notes", form.notes);
    if (form.purchase_date !== expense.purchase_date?.slice(0, 10)) formData.append("purchase_date", form.purchase_date);
    if (form.purchased_by !== expense.purchased_by?.id) formData.append("purchased_by", form.purchased_by);
    if (form.is_archived !== expense.is_archived) formData.append("is_archived", String(form.is_archived));
    if (form.purchase_receipt && form.purchase_receipt !== expense.purchase_receipt) {
      if (typeof form.purchase_receipt === "string" && form.purchase_receipt.startsWith("data:image")) {
        formData.append("purchase_receipt", base64ToFile(form.purchase_receipt));
      } else if (form.purchase_receipt instanceof File) {
        formData.append("purchase_receipt", form.purchase_receipt);
      }
    }

    try {
      const res = await updateExpenses(formData);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      error(errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong"));
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t("expenses.title")}
        subtitle={t("expenses.subtitle")}
        action={
          <Button
            className="gap-2"
            disabled={isCreateUpdateLoading}
            onClick={() => {
              setEditingId(null);
              setForm({ ...emptyExpense, purchase_date: today() });
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
          onEdit={(e) => {
            setEditingId(e.id);
            setForm({
              item: e.item,
              qty: String(e.qty ?? ""),
              unit_type: e.unit_type ?? "",
              expense_amount: String(e.expense_amount ?? ""),
              notes: e.notes ?? "",
              purchase_date: e.purchase_date?.slice(0, 10) ?? today(),
              purchased_by: e.purchased_by?.id ?? "",
              is_archived: e.is_archived,
              supplier: e.supplier?.id ?? "",
              purchase_receipt: `${imgUrl}${e.purchase_receipt}` || null,
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
        title={editingId ? t("expenses.edit") : t("expenses.create")}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <TextField label={t("field.item")} value={form.item} onChange={(v) => set({ item: v })} />
          <SelectField label={t("field.supplier")} value={form.supplier} onChange={(v) => set({ supplier: v })} options={suppliers?.map((s) => ({ label: s.supplier_name, value: s.id })) ?? []} />
          <SelectField label={t("field.purchasedBy")} value={form.purchased_by} onChange={(v) => set({ purchased_by: v })} options={purchaserOptions} />
          <TextField label={t("field.qty")} type="number" value={form.qty} onChange={(v) => set({ qty: v })} />
          <TextField label={t("field.unitType")} value={form.unit_type} onChange={(v) => set({ unit_type: v })} />
          <TextField label={t("field.expenseAmount")} type="number" value={form.expense_amount} onChange={(v) => set({ expense_amount: v })} />
          <TextField label={t("field.purchaseDate")} type="date" value={form.purchase_date} onChange={(v) => set({ purchase_date: v })} />
          <div className="flex items-end">
            <SwitchField label={t("field.isArchived")} checked={form.is_archived} onChange={(v) => set({ is_archived: v })} />
          </div>
          <TextAreaField label={t("field.notes")} value={form.notes} onChange={(v) => set({ notes: v })} className="sm:col-span-2" rows={3} />
          <ReceiptField label={t("field.receipt")} value={form.purchase_receipt} onChange={(v) => set({ purchase_receipt: v })} />
        </div>
      </FormDialog>
    </>
  );
}