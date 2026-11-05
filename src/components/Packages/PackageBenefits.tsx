import { Check, Plus, Save, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { SelectField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useGetPackage, useGetPackageBenefitsTemplates } from "@/hooks/useSiteData";
import { useSimpleToast } from "../ui/toaster";
import { assignPackageBenefit, deletePackageBenefit, updatePackageBenefit, PackageBenefitsModel } from "@/services/PackagesServices";
import LoadingSpinner from "../LoadingSpinner";
import ErrorMessage from "../ErrorMsg";

type Props = {
  items: PackageBenefitsModel[];
  disabled?: boolean;
  package_id?: string;
};

const isTempRow = (id: string | number) => String(id).startsWith("temp-");

export function BenefitsSection({ items, disabled = false, package_id }: Props) {
  const { t } = useI18n();
  const { refetch } = useGetPackage();
  const { success, error } = useSimpleToast();
  const [rows, setRows] = useState<PackageBenefitsModel[]>(items);
  const [loadingRowId, setLoadingRowId] = useState<string | number | null>(null);
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const { data: benefits, isLoading: isBenefitsLoading, error: isBenefitsError } = useGetPackageBenefitsTemplates();
  const [selectedBenefit, setSelectedBenefit] = useState('');

  useEffect(() => {
    setRows(items);
  }, [items]);

  const addEmptyRow = () => {
    const emptyRow: PackageBenefitsModel = {
      id: `temp-${Date.now()}`,
      benefit: !benefits ? null : benefits[0],
      is_included: true
    };
    setRows((r) => [...r, emptyRow]);
  };

  const handleRemoveRow = async (row: PackageBenefitsModel) => {
    setIsCreateUpdateLoading(true);
    if (isTempRow(row.id)) {
      setRows((r) => r.filter((r2) => r2.id !== row.id));
      return;
    }

    setLoadingRowId(row.id);
    try {
      const res = await deletePackageBenefit(row.id);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors
        ? Object.values(errors).flat().join(", ")
        : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
      setLoadingRowId(null);
    }
  };

  const handleCreateSingle = async (row: PackageBenefitsModel) => {
    setIsCreateUpdateLoading(true);
    setLoadingRowId(row.id);
    try {
      const payload = {
        package_id: package_id,
        benefit_id: selectedBenefit,
        is_included: row.is_included
      };

      const res = await assignPackageBenefit(payload as any);
      if (res.status === 201) {
        await refetch();
        setSelectedBenefit('');
        success(t("common.saved"));
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors
        ? Object.values(errors).flat().join(", ")
        : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
      setLoadingRowId(null);
    }
  };

  const handleToggleIncluded = (row: PackageBenefitsModel) => {
    const nextValue = !row.is_included;

    setRows((r) =>
      r.map((r2) => (r2.id === row.id ? { ...r2, is_included: nextValue } : r2))
    );

    if (!isTempRow(row.id)) {
      handleUpdateIncluded(row.id, nextValue);
    }
  };

  const handleUpdateIncluded = async (id: string | number, is_included: boolean) => {
    setIsCreateUpdateLoading(true);
    setLoadingRowId(id);
    try {
      const res = await updatePackageBenefit({ id: String(id), is_included });
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors
        ? Object.values(errors).flat().join(", ")
        : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
      setLoadingRowId(null);
    }
  };

  return (
    <section className="surface-card space-y-3 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("pkg.benefits")}</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={disabled || loadingRowId !== null || isCreateUpdateLoading}
          onClick={addEmptyRow}
        >
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("action.add")}
        </Button>
      </div>

      {disabled ? (
        <p className="text-sm text-muted-foreground">{t("pkg.saveFirst")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((b) => {
            const isNew = isTempRow(b.id);
            const isLoading = loadingRowId === b.id;

            return (
              <div key={b.id} className="grid items-end gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                {isNew ? (
                  isBenefitsLoading ? (
                    <LoadingSpinner />
                  ) : isBenefitsError ? (
                    <ErrorMessage />
                  ) : (
                    <SelectField
                      label={t("nav.benefits")}
                      value={selectedBenefit}
                      onChange={(v) => setSelectedBenefit(v)}
                      options={benefits.map((p) => ({ value: p.id, label: p.benefit_title }))}
                    />
                  )
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{t("nav.benefits")}</span>
                    <span className="text-sm font-medium">{b.benefit?.benefit_title}</span>
                  </div>
                )}

                <Button
                  type="button"
                  variant={b.is_included ? "default" : "outline"}
                  className="gap-2"
                  disabled={isLoading || isCreateUpdateLoading}
                  onClick={() => handleToggleIncluded(b)}
                >
                  {b.is_included ? <Check className="size-4" /> : <X className="size-4" />}
                  {isCreateUpdateLoading ? t('loading') : t("field.isIncluded")}
                </Button>

                {isNew ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isLoading || !selectedBenefit || isCreateUpdateLoading}
                    onClick={() => handleCreateSingle(b)}
                    className="gap-1.5"
                  >
                    <Save className="size-3.5" />
                    {isCreateUpdateLoading ? t('loading') : t("action.create")}
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={t("action.remove")}
                  disabled={isLoading || isCreateUpdateLoading}
                  onClick={() => handleRemoveRow(b)}
                >
                  {isCreateUpdateLoading ? <LoadingSpinner /> : <Trash2 className="size-4 text-destructive" />}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}