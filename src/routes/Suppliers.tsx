import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, FormDialog, PageHeader, TextAreaField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useGetSuppliers } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import PhoneInput from "@/components/PhoneInput";
import { createSuppliers, updateSuppliers, type SuppliersModel } from "@/services/SuppliersServices";

const emptySupplier = {
  supplier_name: "",
  supplier_email: "",
  supplier_phone: "",
  supplier_address: "",
  contact_person_name: "",
  contact_person_phone: "",
  contact_person_position: "",
};

type SupplierForm = typeof emptySupplier;
const FIELDS = Object.keys(emptySupplier) as (keyof SupplierForm)[];

export default function SuppliersPage() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: suppliers, isLoading, error: isError, refetch } = useGetSuppliers();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySupplier);
  const set = (patch: Partial<SupplierForm>) => setForm((f) => ({ ...f, ...patch }));
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers?.filter((s) =>
      `${s.supplier_name} ${s.supplier_email} ${s.supplier_phone} ${s.contact_person_name} ${s.contact_person_phone}`
        .toLowerCase()
        .includes(q),
    );
  }, [suppliers, query]);

  const columns: Column<SuppliersModel>[] = [
    { key: "name", header: t("field.supplierName"), cell: (s) => <span className="font-medium">{s.supplier_name}</span> },
    { key: "email", header: t("field.supplierEmail"), cell: (s) => s.supplier_email },
    { key: "phone", header: t("field.supplierPhone"), cell: (s) => <span dir="ltr">{s.supplier_phone}</span> },
    {
      key: "address",
      header: t("field.supplierAddress"),
      cell: (s) => <span className="line-clamp-2 max-w-[16rem] text-muted-foreground">{s.supplier_address}</span>,
    },
    {
      key: "contact",
      header: t("field.contactPerson"),
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.contact_person_name}</p>
          <p className="truncate text-xs text-muted-foreground">{s.contact_person_position}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{s.contact_person_phone}</p>
        </div>
      ),
    },
  ];

  const handleCreate = async () => {
    if (!form.supplier_name.trim()) return error(t("suppliers.requiredFields"));
    setIsCreateUpdateLoading(true);
    try {
      const res = await createSuppliers(form);
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
    const supplier = suppliers?.find((x) => x.id === editingId);
    if (!editingId || !supplier) return;
    setIsCreateUpdateLoading(true);

    const formData = new FormData();
    formData.append("id", editingId);
    FIELDS.forEach((k) => {
      if (form[k] !== (supplier[k] ?? "")) formData.append(k, form[k]);
    });

    try {
      const res = await updateSuppliers(formData);
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
        title={t("suppliers.title")}
        subtitle={t("suppliers.subtitle")}
        action={
          <Button
            className="gap-2"
            disabled={isCreateUpdateLoading}
            onClick={() => {
              setEditingId(null);
              setForm(emptySupplier);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            {isCreateUpdateLoading ? t("loading") : t("action.create")}
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-2.5 size-4 text-muted-foreground start-3" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("action.search")} className="ps-9" />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorMessage />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onEdit={(s) => {
            setEditingId(s.id);
            setForm({
              supplier_name: s.supplier_name ?? "",
              supplier_email: s.supplier_email ?? "",
              supplier_phone: s.supplier_phone ?? "",
              supplier_address: s.supplier_address ?? "",
              contact_person_name: s.contact_person_name ?? "",
              contact_person_phone: s.contact_person_phone ?? "",
              contact_person_position: s.contact_person_position ?? "",
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
        title={editingId ? t("suppliers.edit") : t("suppliers.create")}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <h4 className="text-sm font-semibold sm:col-span-2">{t("suppliers.sectionSupplier")}</h4>
          <TextField label={t("field.supplierName")} value={form.supplier_name} onChange={(v) => set({ supplier_name: v })} />
          <TextField label={t("field.supplierEmail")} type="email" value={form.supplier_email} onChange={(v) => set({ supplier_email: v })} />
          <div className="space-y-1.5">
            <Label>{t("field.supplierPhone")}</Label>
            <PhoneInput
              value={form.supplier_phone}
              onChange={(value) => set({ supplier_phone: value })}
              placeholder="+1 (555) 123-4567"
              showFlag={true}
            />
          </div>
          <TextAreaField
            label={t("field.supplierAddress")}
            value={form.supplier_address}
            onChange={(v) => set({ supplier_address: v })}
            rows={2}
          />

          <h4 className="pt-2 text-sm font-semibold sm:col-span-2">{t("suppliers.sectionContact")}</h4>
          <TextField label={t("field.contactPersonName")} value={form.contact_person_name} onChange={(v) => set({ contact_person_name: v })} />
          <TextField label={t("field.contactPersonPosition")} value={form.contact_person_position} onChange={(v) => set({ contact_person_position: v })} />
          <div className="space-y-1.5">
            <Label>{t("field.contactPersonPhone")}</Label>
            <PhoneInput
              value={form.contact_person_phone}
              onChange={(value) => set({ contact_person_phone: value })}
              placeholder="+1 (555) 123-4567"
              showFlag={true}
            />
          </div>
        </div>
      </FormDialog>
    </>
  );
}