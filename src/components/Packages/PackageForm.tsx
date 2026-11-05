import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ImageUploadField, PageHeader, SelectField, SwitchField, TextAreaField, TextField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { createPackage, PackageModel, PackageTypeModel, updatePackage } from "@/services/PackagesServices";
import { base64ToFile, DestinationModel } from "@/services/CoreServices";
import { imgUrl } from "@/services/api";
import { useSimpleToast } from "../ui/toaster";
import { useGetPackage } from "@/hooks/useSiteData";

export const emptyPackage = {
  package_type: "",
  package_title: "",
  package_description: "",
  package_duration: 0,
  package_img: null as File | string | null,
  is_active: true,
};

type Props = {
  value: PackageModel;
  isEditing: boolean;
  destinations: DestinationModel[];
  packageTypes: PackageTypeModel[];
  onBack: () => void;
};

export function PackageDetailsForm({
  value,
  isEditing,
  packageTypes,
  onBack,
}: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState(value === null ? emptyPackage : {
    package_type: value.package_type.id,
    package_title: value.package_title,
    package_description: value.package_description,
    package_duration: value.package_duration,
    package_img: value.package_img,
    is_active: value.is_active,
  });
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const { refetch } = useGetPackage();
  const set = (patch: Partial<typeof emptyPackage>) => setForm((f) => ({ ...f, ...patch }));
  const { success, error } = useSimpleToast();

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createPackage(form);
      if (res.status === 201) {
        await refetch();
        success(t("common.saved"));
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

      formData.append("id", value.id);

      if (form.package_title !== value?.package_title) {
        formData.append("package_title", String(form.package_title));
      }

      if (form.package_description !== value?.package_description) {
        formData.append("package_description", String(form.package_description));
      }

      if (form.package_duration !== value?.package_duration) {
        formData.append("package_duration", String(form.package_duration));
      }

      if (form.package_type !== value?.package_type.id) {
        formData.append("package_type", String(form.package_type));
      }

      if (form.is_active !== value?.is_active) {
        formData.append("is_active", String(form.is_active));
      }

      if (form.package_img && form.package_img !== value?.package_img) {
        if (typeof form.package_img === "string" && form.package_img.startsWith("data:image")) {
          formData.append("package_img", base64ToFile(form.package_img));
        } else if (form.package_img instanceof File) {
          formData.append("package_img", form.package_img);
        }
      }
      const res = await updatePackage(formData as any);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (value) {
          handleUpdate();
        } else {
          handleCreate();
        }
      }}
    >
      <PageHeader
        title={isEditing ? t("pkg.edit") : t("pkg.create")}
        subtitle={t("pkg.subtitle")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="gap-2" onClick={onBack}>
              <ArrowLeft className="size-4" />
              {t("action.back")}
            </Button>
          </div>
        }
      />

      <section className="surface-card space-y-4 p-4 sm:p-6">
        <h2 className="text-base font-semibold">{t("pkg.details")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={t("field.packageType")}
            value={form.package_type}
            onChange={(v) => set({ package_type: v })}
            options={packageTypes.map((p) => ({ value: p.id, label: p.type_title }))}
          />
          <TextField
            label={t("field.packageTitle")}
            value={form.package_title}
            onChange={(v) => set({ package_title: v })}
          />
          <TextField
            label={t("field.packageDuration")}
            value={form.package_duration}
            onChange={(v) => set({ package_duration: Number(v) })}
            placeholder="6 days / 5 nights"
          />
          <TextAreaField
            label={t("field.packageDescription")}
            value={form.package_description}
            onChange={(v) => set({ package_description: v })}
            className="sm:col-span-2"
            rows={4}
          />
          <ImageUploadField 
            label={t("field.packageImg")} 
            value={
              form.package_img instanceof File 
                ? URL.createObjectURL(form.package_img)
                : typeof form.package_img === "string" && form.package_img
                  ? (form.package_img.startsWith("data:") || form.package_img.startsWith("http") 
                      ? form.package_img 
                      : `${imgUrl}${form.package_img}`)
                  : ""
            } 
            onChange={(v) => set({ package_img: v })} 
          />
          <div className="sm:col-span-2">
            <SwitchField
              label={t("field.isActive")}
              checked={form.is_active}
              onChange={(v) => set({ is_active: v })}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isCreateUpdateLoading}>{isCreateUpdateLoading ? t('loading') : isEditing ? t("action.update") : t("action.create")}</Button>
        </div>
      </section>
    </form>
  );
}