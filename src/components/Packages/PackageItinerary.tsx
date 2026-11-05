import { Plus, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { SelectField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useGetPackage, useGetPackageItinerariesTemplates } from "@/hooks/useSiteData";
import { useSimpleToast } from "../ui/toaster";
import { assignPackageItinerary, deletePackageItinerary, PackageItineraryModel } from "@/services/PackagesServices";
import LoadingSpinner from "../LoadingSpinner";
import ErrorMessage from "../ErrorMsg";

type Props = {
  items: PackageItineraryModel[];
  disabled?: boolean;
  package_id?: string;
};

const isTempRow = (id: string | number) => String(id).startsWith("temp-");

export function ItinerarySection({ items, disabled = false, package_id }: Props) {
  const { t } = useI18n();
  const { refetch } = useGetPackage();
  const { success, error } = useSimpleToast();
  const { data: itineraries, isLoading: isItinerariesLoading, error: isItinerariesError } = useGetPackageItinerariesTemplates();
  const [rows, setRows] = useState<PackageItineraryModel[]>(items);
  const [loadingRowId, setLoadingRowId] = useState<string | number | null>(null);
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState('');

  useEffect(() => {
    setRows(items);
  }, [items]);

  const addEmptyRow = () => {
    const emptyRow: PackageItineraryModel = {
      id: `temp-${Date.now()}`,
      itinerary: !itineraries ? null : itineraries[0],
    };
    setRows((r) => [...r, emptyRow]);
  };

  const handleRemoveRow = async (row: PackageItineraryModel) => {
    setIsCreateUpdateLoading(true);
    if (isTempRow(row.id)) {
      setRows((r) => r.filter((r2) => r2.id !== row.id));
      return;
    }

    setLoadingRowId(row.id);
    try {
      const res = await deletePackageItinerary(row.id);
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

  const handleCreateSingle = async (row: PackageItineraryModel) => {
    setIsCreateUpdateLoading(true);
    if (!selectedItinerary) return;
    setLoadingRowId(row.id);
    try {
      const payload = {
        package_id: package_id,
        itinerary_id: selectedItinerary,
      };

      const res = await assignPackageItinerary(payload as any);
      if (res.status === 201) {
        await refetch();
        setSelectedItinerary('');
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
        <h2 className="text-base font-semibold">{t("pkg.itinerary")}</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={disabled || loadingRowId !== null}
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
          {rows.map((it) => {
            const isNew = isTempRow(it.id);
            const isLoading = loadingRowId === it.id;

            return (
              <div key={it.id} className="rounded-lg border border-border p-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {isNew ? (
                    isItinerariesLoading ? (
                      <LoadingSpinner />
                    ) : isItinerariesError ? (
                      <ErrorMessage />
                    ) : (
                      <SelectField
                        label={t("nav.itineraries")}
                        value={selectedItinerary}
                        onChange={(v) => setSelectedItinerary(v)}
                        options={itineraries.map((p) => ({ value: p.id, label: p.itinerary_title }))}
                      />
                    )
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{t("nav.itineraries")}</span>
                      <span className="text-sm font-medium">{it.itinerary?.itinerary_title}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  {isNew ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isCreateUpdateLoading || !selectedItinerary || isLoading}
                      onClick={() => handleCreateSingle(it)}
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
                    disabled={isCreateUpdateLoading || isLoading}
                    onClick={() => handleRemoveRow(it)}
                  >
                    {isCreateUpdateLoading ? <LoadingSpinner/> : <Trash2 className="size-4 text-destructive" />}
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