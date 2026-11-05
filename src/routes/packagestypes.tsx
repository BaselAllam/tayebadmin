import { Plus } from "lucide-react";
import { useState } from "react";
import { ArchivedPill, DataTable, FormDialog, PageHeader, SwitchField, TextField, ImageUploadField, Thumb, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { type PackageType } from "@/lib/data-store";
import { useI18n } from "@/lib/i18n";
import { useSimpleToast } from "@/components/ui/toaster";
import { useGetPackageTypes } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { createPackageTypes, updatePackageTypes } from "@/services/PackagesServices";
import { imgUrl } from "@/services/api";
import { base64ToFile } from "@/services/CoreServices";

const emptyType = { type_title: "", type_title_de: "", type_img: null as File | string | null, is_archived: false, is_holy: false };

export default function PackageTypesPage() {
  const { t } = useI18n();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyType);
  const set = (patch: Partial<typeof emptyType>) => setForm((f) => ({ ...f, ...patch }));
  const { data: types, isLoading: isTypesLoading, error: isTypesError, refetch } = useGetPackageTypes();
  const { success, error } = useSimpleToast();

  const columns: Column<PackageType>[] = [
    { key: "img", header: t("field.typeImg"), cell: (r) => <Thumb src={`${imgUrl}${r.type_img}`} alt={r.type_title} /> },
    { key: "title", header: t("field.typeTitle"), cell: (r) => <span className="font-medium">{r.type_title}</span> },
    { key: "titleAr", header: t("field.typeTitleAr"), cell: (r) => r.type_title_de },
    {
      key: "count",
      header: t("nav.packagesList"),
      cell: (r) => types.filter((p) => p.id === r.id).length,
    },
    { key: "archived", header: t("common.status"), cell: (r) => <ArchivedPill archived={r.is_archived} /> },
  ];

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createPackageTypes(form as any);
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
    setIsCreateUpdateLoading(true);
    try {
      const formData = new FormData();
      const type = types.find((x) => x.id === editingId);
      formData.append('id', editingId);
      if (form.type_title !== type.type_title) formData.append('type_title', form.type_title ?? "");
      if (form.type_title_de !== type.type_title_de) formData.append('type_title_de', form.type_title_de ?? "");
      if (form.is_archived !== type.is_archived) formData.append('is_archived', String(form.is_archived));
      if (form.is_holy !== type.is_holy) formData.append('is_holy', String(form.is_holy));

      if (form.type_img && form.type_img !== type?.type_img) {
      if (typeof form.type_img === "string" && form.type_img.startsWith("data:image")) {
        formData.append("type_img", base64ToFile(form.type_img));
      } else if (form.type_img instanceof File) {
        formData.append("type_img", form.type_img);
      }
    }
      const res = await updatePackageTypes(formData);
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

  if (isTypesLoading) return <LoadingSpinner />;
  if (isTypesError) return <ErrorMessage />;

  return (
    <>
      <PageHeader
        title={t("types.title")}
        subtitle={t("types.subtitle")}
        action={
          <Button
            className="gap-2"
            disabled={isCreateUpdateLoading}
            onClick={() => {
              setEditingId(null);
              setForm(emptyType);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            {isCreateUpdateLoading ? t('loading') : t("types.create")}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={types}
        onEdit={(r) => {
          setEditingId(r.id);
          setForm({
            type_title: r.type_title,
            type_title_de: r.type_title_de,
            type_img: r.type_img,
            is_archived: r.is_archived,
            is_holy: r.is_holy
          });
          setOpen(true);
        }}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        title={editingId ? t("types.edit") : t("types.create")}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t("field.typeTitle")} value={form.type_title} onChange={(v) => set({ type_title: v })} />
          <TextField label={t("field.typeTitleAr")} value={form.type_title_de} onChange={(v) => set({ type_title_de: v })} />
            <ImageUploadField 
              label={t("field.img")} 
              value={
                form.type_img instanceof File 
                  ? URL.createObjectURL(form.type_img)
                  : typeof form.type_img === "string" && form.type_img
                    ? (form.type_img.startsWith("data:") || form.type_img.startsWith("http") 
                        ? form.type_img 
                        : `${imgUrl}${form.type_img}`)
                    : ""
              } 
              onChange={(v) => set({ type_img: v })} 
            />
          {/* <ImageUploadField label={t("field.typeImg")} value={form.type_img} onChange={(v) => set({ type_img: v })} className="sm:col-span-2" /> */}
        </div>
        <SwitchField label={t("field.isArchived")} checked={form.is_archived} onChange={(v) => set({ is_archived: v })} />
          <SwitchField label={t("field.isHoly")} checked={form.is_holy} onChange={(v) => set({ is_holy: v })} />
      </FormDialog>
    </>
  );
}
