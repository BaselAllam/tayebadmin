import { Plus, Trash2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { SelectField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useGetPackage, useGetPackageHighlightsTemplates } from "@/hooks/useSiteData";
import { useSimpleToast } from "../ui/toaster";
import { assignPackageHighlight, deletePackageHighlight, PackageHighlightsModel } from "@/services/PackagesServices";
import LoadingSpinner from "../LoadingSpinner";
import ErrorMessage from "../ErrorMsg";

type Props = {
  items: PackageHighlightsModel[];
  disabled?: boolean;
  package_id?: string
};

const isTempRow = (id: string | number) => String(id).startsWith("temp-");

export function HighlightsSection({ items, disabled = false, package_id }: Props) {
  const { t } = useI18n();
  const { refetch } = useGetPackage();
  const { success, error } = useSimpleToast();
  const { data: highlights, isLoading: isHighlightsLoading, error: isHighlightsError } = useGetPackageHighlightsTemplates();
  const [rows, setRows] = useState<PackageHighlightsModel[]>(items);
  const [loadingRowId, setLoadingRowId] = useState<string | number | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState('');
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);

  useEffect(() => {
    setRows(items);
  }, [items]);

  const addEmptyRow = () => {
    const emptyRow: PackageHighlightsModel = {
      id: `temp-${Date.now()}`,
      highlights: !highlights ? null : highlights[0],
    };
    setRows((r) => [...r, emptyRow]);
  };

  const handleRemoveRow = async (row: PackageHighlightsModel) => {
    setIsCreateUpdateLoading(true);
    if (isTempRow(row.id)) {
      setRows((r) => r.filter((r2) => r2.id !== row.id));
      return;
    }

    setLoadingRowId(row.id);
    try {
      const res = await deletePackageHighlight(row.id);
      if (res.status === 200) {
        await refetch();
        setSelectedHighlight('');
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

  const handleCreateSingle = async (row: PackageHighlightsModel) => {
    setIsCreateUpdateLoading(true);
    if (!selectedHighlight) return;
    setLoadingRowId(row.id);
    try {
      const payload = {
        package_id: package_id,
        highlight_id: selectedHighlight,
      };

      const res = await assignPackageHighlight(payload as any);
      if (res.status === 201) {
        await refetch();
        setSelectedHighlight('');
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
        <h2 className="text-base font-semibold">{t("pkg.highlights")}</h2>
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
          {rows.map((h) => {
            const isNew = isTempRow(h.id);
            const isLoading = loadingRowId === h.id;

            return (
              <div key={h.id} className="flex items-end gap-2">
                {isNew ? (
                  isHighlightsLoading ? (
                    <LoadingSpinner />
                  ) : isHighlightsError ? (
                    <ErrorMessage />
                  ) : (
                    <SelectField
                      label={t("nav.highlights")}
                      value={selectedHighlight}
                      onChange={(v) => setSelectedHighlight(v)}
                      options={highlights.map((p) => ({ value: p.id, label: p.highlights_title }))}
                    />
                  )
                ) : (
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{t("nav.highlights")}</span>
                    <span className="text-sm font-medium">{h.highlights?.highlights_title}</span>
                  </div>
                )}

                {isNew ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isLoading || !selectedHighlight || isCreateUpdateLoading}
                    onClick={() => handleCreateSingle(h)}
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
                  onClick={() => handleRemoveRow(h)}
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