import { Plus, Save, Trash2, Pencil, X } from "lucide-react";
import { useState, useEffect } from "react";
import { StatusPill } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useGetPackage } from "@/hooks/useSiteData";
import { useSimpleToast } from "../ui/toaster";
import { createPackagePricing, updatePackagePricing, PackagePricingModel } from "@/services/PackagesServices";
import LoadingSpinner from "../LoadingSpinner";

const isTempRow = (id: string | number) => String(id).startsWith("temp-");

const CURRENCIES = ['AED', 'EGP', 'SAR', 'KWD', 'QAR', 'OMR', 'BHD', 'YER', 'IQD', 'USD', 'DZD', 'EUR', 'GBP'];

const days = {
    0: 'No',
    1: 'Sun',
    2: 'Mon',
    3: 'Tue',
    4: 'Wed',
    5: 'Thr',
    6: 'Fri',
    7: 'Sat'
}

type PricingFormState = {
  title: string;
  description: string;
  price: string;
  price_currency: string;
  date_from: string;
  date_to: string;
  depature_day: string;
  is_active: boolean;
};

const emptyForm: PricingFormState = {
  title: "",
  description: "",
  price: "",
  price_currency: CURRENCIES[0],
  date_from: "",
  date_to: "",
  depature_day: "",
  is_active: true,
};

type PricingSectionProps = {
  items: PackagePricingModel[];
  disabled?: boolean;
  package_id?: string;
};

export function PackagePricingSection({ items, disabled = false, package_id }: PricingSectionProps) {
  const { t } = useI18n();
  const { refetch } = useGetPackage();
  const { success, error } = useSimpleToast();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [rows, setRows] = useState<PackagePricingModel[]>(items ?? []);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formState, setFormState] = useState<PricingFormState>(emptyForm);
  const [loadingRowId, setLoadingRowId] = useState<string | number | null>(null);

  useEffect(() => {
    setRows(items ?? []);
  }, [items]);

  const addEmptyRow = () => {
    const tempId = `temp-${Date.now()}`;
    setRows((r) => [...r, { id: tempId } as PackagePricingModel]);
    setFormState(emptyForm);
    setEditingId(tempId);
  };

  const startEdit = (row: PackagePricingModel) => {
    setFormState({
      title: row.title ?? "",
      description: row.description ?? "",
      price: row.price ?? "",
      price_currency: row.price_currency ?? "USD",
      date_from: row.date_from ?? "",
      date_to: row.date_to ?? "",
      depature_day: row.depature_day ?? "",
      is_active: row.is_active ?? true,
    });
    setEditingId(row.id);
  };

  const cancelEdit = (row: PackagePricingModel) => {
    if (isTempRow(row.id)) {
      setRows((r) => r.filter((r2) => r2.id !== row.id));
    }
    setEditingId(null);
    setFormState(emptyForm);
  };

  const updateField = <K extends keyof PricingFormState>(key: K, value: PricingFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (row: PackagePricingModel) => {
    if (!package_id) return;
    setIsCreateUpdateLoading(true);
    setLoadingRowId(row.id);
    try {
      const { depature_day, ...restFormState } = formState;
      const payload = {
        package_id,
        ...restFormState,
        ...(Number(depature_day) !== 0 && { depature_day }),
      };

      const res = await createPackagePricing(payload as any);
      if (res.status === 201 || res.status === 200) {
        await refetch();
        setEditingId(null);
        setFormState(emptyForm);
        success(t("common.saved"));
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
      setLoadingRowId(null);
    }
  };

  const handleUpdate = async (row: PackagePricingModel) => {
    if (!package_id) return;
    setIsCreateUpdateLoading(true);
    setLoadingRowId(row.id);
    try {
      const { depature_day, ...restFormState } = formState;
      const payload = {
        id: String(row.id),
        package_id,
        ...restFormState,
        ...(Number(depature_day) !== 0 && { depature_day }),
      };

      const res = await updatePackagePricing(payload as any);
      if (res.status === 200) {
        await refetch();
        setEditingId(null);
        setFormState(emptyForm);
        success(t("common.saved"));
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
      setLoadingRowId(null);
    }
  };

  const handleSave = async (row: PackagePricingModel) => {
    if (isTempRow(row.id)) {
      await handleCreate(row);
    } else {
      await handleUpdate(row);
    }
  };

  return (
    <section className="surface-card space-y-3 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("pkg.pricing")}</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={disabled || editingId !== null || loadingRowId !== null || isCreateUpdateLoading}
          onClick={addEmptyRow}
        >
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("action.add")}
        </Button>
      </div>

      {disabled ? (
        <p className="text-sm text-muted-foreground">{t("pkg.saveFirst")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("common.noPricing")}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const isNew = isTempRow(row.id);
            const isEditing = editingId === row.id;
            const isLoading = loadingRowId === row.id;

            if (isEditing) {
              return (
                <div key={row.id} className="space-y-3 rounded-lg border border-border p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>{t("pkg.pricingTitle")}</Label>
                      <Input value={formState.title} onChange={(e) => updateField("title", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("field.price")}</Label>
                      <Input
                        type="number"
                        value={formState.price}
                        onChange={(e) => updateField("price", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("field.currency")}</Label>
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={formState.price_currency}
                        onChange={(e) => updateField("price_currency", e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end gap-2 pb-1.5">
                      <Switch checked={formState.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
                      <Label>{t("common.active")}</Label>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("pkg.dateFrom")}</Label>
                      <Input
                        type="date"
                        value={formState.date_from}
                        onChange={(e) => updateField("date_from", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("pkg.dateTo")}</Label>
                      <Input
                        type="date"
                        value={formState.date_to}
                        onChange={(e) => updateField("date_to", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                    <Label>{t("pkg.departureDate")}</Label>
                    <select
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={formState.depature_day}
                        onChange={(e) => updateField("depature_day", e.target.value)}
                    >
                        {Object.entries(days).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                        ))}
                    </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>{t("description")}</Label>
                      <Textarea
                        rows={3}
                        value={formState.description}
                        onChange={(e) => updateField("description", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="ghost" disabled={isLoading} onClick={() => cancelEdit(row)}>
                      <X className="size-4" />
                      {t("action.cancel")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isLoading || !formState.title || !formState.price}
                      onClick={() => handleSave(row)}
                      className="gap-1.5"
                    >
                      {isLoading ? <LoadingSpinner /> : <Save className="size-3.5" />}
                      {isNew ? t("action.create") : t("action.save")}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div key={row.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{row.title}</span>
                    <StatusPill
                      label={row.is_active ? t("common.active") : t("status.inactive")}
                      tone={row.is_active ? "success" : "neutral"}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {row.price} {row.price_currency}
                  </p>
                  {row.depature_day && <p className="text-xs text-muted-foreground">
                    {row.date_from} → {row.date_to} · {t("pkg.departureDate")}: {days[Number(row.depature_day)]}
                  </p>}
                  {row.description ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{row.description}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={t("action.edit")}
                    disabled={isLoading || editingId !== null}
                    onClick={() => startEdit(row)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}