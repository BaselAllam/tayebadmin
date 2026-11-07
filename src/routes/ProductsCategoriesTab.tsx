import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable, FormDialog, StatusPill, SwitchField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { base64ToFile } from "@/services/CoreServices";
import { createProductCategories, updateProductCategories, type ProductsCategoriesModel } from "@/services/ProductsServices";
import { useGetProductsCategories } from "@/hooks/useSiteData";
import { imgUrl } from "@/services/api";

const emptyCategory = {
  category_name: "",
  category_name_ar: "",
  is_active: true,
  image: null as File | string | null,
};

function ImageField({
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

export default function ProductCategoriesTab() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: categories, isLoading, error: isError, refetch } = useGetProductsCategories();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const set = (patch: Partial<typeof emptyCategory>) => setForm((f) => ({ ...f, ...patch }));
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);

  const columns: Column<ProductsCategoriesModel>[] = [
    {
      key: "image",
      header: t("field.image"),
      cell: (c) =>
        c.image ? (
          <a href={`${imgUrl}${c.image}`} target="_blank" rel="noreferrer">
            <img src={`${imgUrl}${c.image}`} alt="" className="size-10 rounded border object-cover" />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "name", header: t("field.categoryName"), cell: (c) => <span className="font-medium">{c.category_name}</span> },
    { key: "nameAr", header: t("field.categoryNameAr"), cell: (c) => c.category_name_ar },
    { key: "created", header: t("field.createdAt"), cell: (c) => c.created_at?.slice(0, 10) },
    {
      key: "status",
      header: t("common.status"),
      cell: (c) => (
        <StatusPill
          label={c.is_active ? t("status.active") : t("status.inactive")}
          tone={c.is_active ? "success" : "neutral"}
        />
      ),
    },
  ];

  const handleCreate = async () => {
    if (!form.category_name.trim()) return error(t("categories.requiredFields"));
    setIsCreateUpdateLoading(true);
    try {
      const res = await createProductCategories(form);
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
    const category = categories?.find((x) => x.id === editingId);
    if (!editingId || !category) return;
    setIsCreateUpdateLoading(true);

    const formData = new FormData();
    formData.append("id", editingId);
    if (form.category_name !== category.category_name) formData.append("category_name", form.category_name);
    if (form.category_name_ar !== category.category_name_ar) formData.append("category_name_ar", form.category_name_ar);
    if (form.is_active !== category.is_active) formData.append("is_active", String(form.is_active));

    if (form.image && form.image !== category.image) {
      if (typeof form.image === "string" && form.image.startsWith("data:image")) {
        formData.append("image", base64ToFile(form.image));
      } else if (form.image instanceof File) {
        formData.append("image", form.image);
      }
    }

    try {
      const res = await updateProductCategories(formData);
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

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          disabled={isCreateUpdateLoading}
          onClick={() => {
            setEditingId(null);
            setForm(emptyCategory);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t("loading") : t("action.create")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={categories}
        onEdit={(c) => {
          setEditingId(c.id);
          setForm({
            category_name: c.category_name ?? "",
            category_name_ar: c.category_name_ar ?? "",
            is_active: c.is_active,
            image: `${imgUrl}${c.image}` || null,
          });
          setOpen(true);
        }}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        wide
        title={`${editingId ? t("action.edit") : t("action.create")} — ${t("cores.tab.categories")}`}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <TextField label={t("field.categoryName")} value={form.category_name} onChange={(v) => set({ category_name: v })} />
          <TextField label={t("field.categoryNameAr")} value={form.category_name_ar} onChange={(v) => set({ category_name_ar: v })} />
          <div className="sm:col-span-2">
            <SwitchField label={t("field.isActive")} checked={form.is_active} onChange={(v) => set({ is_active: v })} />
          </div>
          <ImageField label={t("field.image")} value={form.image} onChange={(v) => set({ image: v })} />
        </div>
      </FormDialog>
    </>
  );
}