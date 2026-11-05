import { Plus, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { SelectField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useGetPackage, useGetDestinations } from "@/hooks/useSiteData";
import { useSimpleToast } from "../ui/toaster";
import { assignPackageDestination, deletePackageDestination, PackageDestinationModel } from "@/services/PackagesServices";
import LoadingSpinner from "../LoadingSpinner";
import ErrorMessage from "../ErrorMsg";

const isTempRow = (id: string | number) => String(id).startsWith("temp-");

type RefetchFn = () => Promise<any>;

type DestinationsSectionProps = {
  items: PackageDestinationModel[];
  disabled?: boolean;
  package_id?: string;
};

export function DestinationsSection({ items, disabled = false, package_id }: DestinationsSectionProps) {
  const { t } = useI18n();
  const { refetch } = useGetPackage();
  const { success, error } = useSimpleToast();
  const { data: destinations, isLoading: isDestinationsLoading, error: isDestinationsError } = useGetDestinations();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [rows, setRows] = useState<PackageDestinationModel[]>(items ?? []);
  const [loadingRowId, setLoadingRowId] = useState<string | number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [selectedDestination, setSelectedDestination] = useState<Record<string, string>>({});

  useEffect(() => {
    setRows(items);
  }, [items]);

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addEmptyRow = () => {
    const emptyRow: PackageDestinationModel = {
      id: `temp-${Date.now()}`,
      destination: !destinations ? null : destinations[0],
    };
    setRows((r) => [...r, emptyRow]);
  };

  const handleRemoveRow = async (row: PackageDestinationModel) => {
    setIsCreateUpdateLoading(true);
    if (isTempRow(row.id)) {
      setRows((r) => r.filter((r2) => r2.id !== row.id));
      return;
    }

    setLoadingRowId(row.id);
    try {
      const res = await deletePackageDestination(row.id);
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
      setLoadingRowId(null);
    }
  };

  const handleCreateSingle = async (row: PackageDestinationModel) => {
    setIsCreateUpdateLoading(true);
    const destinationId = selectedDestination[String(row.id)];
    if (!destinationId) return;

    setLoadingRowId(row.id);
    try {
      const payload = {
        package_id: package_id,
        destination_id: destinationId,
      };
      const res = await assignPackageDestination(payload as any);
      if (res.status === 201) {
        await refetch();
        setSelectedDestination((prev) => {
          const next = { ...prev };
          delete next[String(row.id)];
          return next;
        });
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

  return (
    <section className="surface-card space-y-3 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("pkg.destinations")}</h2>
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
        <p className="text-sm text-muted-foreground">{t("common.noDestinations")}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((d) => {
            const isNew = isTempRow(d.id);
            const isLoading = loadingRowId === d.id;

            return (
              <div key={d.id} className="rounded-lg border border-border">
                <div className="flex items-center gap-2 p-3">

                  <div className="flex-1">
                    {isNew ? (
                      isDestinationsLoading ? (
                        <LoadingSpinner />
                      ) : isDestinationsError ? (
                        <ErrorMessage />
                      ) : (
                        <SelectField
                          label={t("pkg.destination")}
                          value={selectedDestination[String(d.id)] ?? ""}
                          onChange={(v) =>
                            setSelectedDestination((prev) => ({ ...prev, [String(d.id)]: v }))
                          }
                          options={destinations.map((p) => ({ value: p.id, label: p.destination_name }))}
                        />
                      )
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{t("pkg.destination")}</span>
                        <span className="text-sm font-medium">{d.destination?.destination_name}</span>
                      </div>
                    )}
                  </div>

                  {isNew ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isLoading || !selectedDestination[String(d.id)] || isCreateUpdateLoading}
                      onClick={() => handleCreateSingle(d)}
                      className="gap-1.5"
                    >
                      <Save className="size-3.5" />
                      {isCreateUpdateLoading ? t('loading') : t("action.create")}
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={t("action.remove")}
                    disabled={isLoading || isCreateUpdateLoading}
                    onClick={() => handleRemoveRow(d)}
                  >
                    {isCreateUpdateLoading ? <LoadingSpinner /> : <Trash2 className="size-4 text-destructive" />}
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