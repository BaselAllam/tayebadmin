import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { ArchivedPill, DataTable, FormDialog, SwitchField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useGetCities } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { createAreas, createCities, updateAreas, updateCities, type AreaModel, type CitiesModel } from "@/services/CoreServices";

const emptyCity = {
  city_name: "",
  city_name_ar: "",
  is_archived: false,
};

const emptyArea = {
  area_name: "",
  area_name_ar: "",
  delivery_fee: "",
  is_archived: false,
};

const extractError = (e: any, fallback: string) => {
  const errors = e?.response?.data?.data;
  return errors ? Object.values(errors).flat().join(", ") : e?.message || fallback;
};

export default function CitiesTab() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: cities, isLoading, error: isError, refetch } = useGetCities();
  
  const [cityOpen, setCityOpen] = useState(false);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [cityForm, setCityForm] = useState(emptyCity);
  const setCity = (patch: Partial<typeof emptyCity>) => setCityForm((f) => ({ ...f, ...patch }));
  const [isCitySaving, setIsCitySaving] = useState(false);

  const [areaOpen, setAreaOpen] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [areaForm, setAreaForm] = useState(emptyArea);
  const setArea = (patch: Partial<typeof emptyArea>) => setAreaForm((f) => ({ ...f, ...patch }));
  const [isAreaSaving, setIsAreaSaving] = useState(false);
  const currentCity = cities?.find((c) => c.id === editingCityId);

  const columns: Column<CitiesModel>[] = [
    { key: "name", header: t("field.cityName"), cell: (c) => <span className="font-medium">{c.city_name}</span> },
    { key: "nameAr", header: t("field.cityNameAr"), cell: (c) => c.city_name_ar },
    { key: "areas", header: t("cities.areas"), cell: (c) => c.area_city?.length ?? 0 },
    { key: "archived", header: t("common.status"), cell: (c) => <ArchivedPill archived={c.is_archived} /> },
  ];

  const handleCreateCity = async () => {
    setIsCitySaving(true);
    try {
      const res = await createCities(cityForm);
      if (res.status === 201) {
        await refetch();
        success(t("common.saved"));
        setCityOpen(false);
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsCitySaving(false);
    }
  };

  const handleUpdateCity = async () => {
    if (!editingCityId || !currentCity) return;
    setIsCitySaving(true);

    const formData = new FormData();
    formData.append("id", editingCityId);
    if (cityForm.city_name !== currentCity.city_name) formData.append("city_name", cityForm.city_name);
    if (cityForm.city_name_ar !== currentCity.city_name_ar) formData.append("city_name_ar", cityForm.city_name_ar);
    if (cityForm.is_archived !== currentCity.is_archived) formData.append("is_archived", String(cityForm.is_archived));

    try {
      const res = await updateCities(formData);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
        setCityOpen(false);
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsCitySaving(false);
    }
  };

  const openAreaDialog = (area?: AreaModel) => {
    if (area) {
      setEditingAreaId(area.id);
      setAreaForm({
        area_name: area.area_name,
        area_name_ar: area.area_name_ar,
        delivery_fee: String(area.delivery_fee ?? ""),
        is_archived: area.is_archived,
      });
    } else {
      setEditingAreaId(null);
      setAreaForm(emptyArea);
    }
    setAreaOpen(true);
  };

  const handleCreateArea = async () => {
    if (!editingCityId) return;
    setIsAreaSaving(true);
    try {
      const res = await createAreas({
        city_id: editingCityId,
        area_name: areaForm.area_name,
        area_name_ar: areaForm.area_name_ar,
        delivery_fee: Number(areaForm.delivery_fee) || 0,
        is_archived: areaForm.is_archived,
      });
      if (res.status === 201) {
        await refetch();
        success(t("common.saved"));
        setAreaOpen(false);
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsAreaSaving(false);
    }
  };

  const handleUpdateArea = async () => {
    const area = currentCity?.area_city?.find((a) => a.id === editingAreaId);
    if (!editingAreaId || !area) return;
    setIsAreaSaving(true);

    const formData = new FormData();
    formData.append("id", editingAreaId);
    if (areaForm.area_name !== area.area_name) formData.append("area_name", areaForm.area_name);
    if (areaForm.area_name_ar !== area.area_name_ar) formData.append("area_name_ar", areaForm.area_name_ar);
    if (Number(areaForm.delivery_fee) !== Number(area.delivery_fee)) formData.append("delivery_fee", String(Number(areaForm.delivery_fee) || 0));
    if (areaForm.is_archived !== area.is_archived) formData.append("is_archived", String(areaForm.is_archived));

    try {
      const res = await updateAreas(formData);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
        setAreaOpen(false);
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsAreaSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          disabled={isCitySaving}
          onClick={() => {
            setEditingCityId(null);
            setCityForm(emptyCity);
            setCityOpen(true);
          }}
        >
          <Plus className="size-4" />
          {isCitySaving ? t("loading") : t("action.create")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={cities}
        onEdit={(c) => {
          setEditingCityId(c.id);
          setCityForm({
            city_name: c.city_name,
            city_name_ar: c.city_name_ar,
            is_archived: c.is_archived,
          });
          setCityOpen(true);
        }}
      />

      {/* City dialog */}
      <FormDialog
        open={cityOpen}
        onOpenChange={setCityOpen}
        isLoading={isCitySaving}
        wide
        title={`${editingCityId ? t("action.edit") : t("action.create")} — ${t("cores.tab.cities")}`}
        onSubmit={() => {
          if (editingCityId) handleUpdateCity();
          else handleCreateCity();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <TextField label={t("field.cityName")} value={cityForm.city_name} onChange={(v) => setCity({ city_name: v })} />
          <TextField label={t("field.cityNameAr")} value={cityForm.city_name_ar} onChange={(v) => setCity({ city_name_ar: v })} />
          <div className="sm:col-span-2">
            <SwitchField label={t("field.isArchived")} checked={cityForm.is_archived} onChange={(v) => setCity({ is_archived: v })} />
          </div>

          {/* Areas of this city (only after the city exists) */}
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{t("cities.areas")}</h4>
              {editingCityId && (
                <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => openAreaDialog()}>
                  <Plus className="size-3.5" />
                  {t("cities.addArea")}
                </Button>
              )}
            </div>

            {!editingCityId ? (
              <p className="text-sm text-muted-foreground">{t("cities.saveCityFirst")}</p>
            ) : currentCity?.area_city?.length ? (
              <ul className="divide-y rounded-md border">
                {currentCity.area_city.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {a.area_name} <span className="text-muted-foreground">· {a.area_name_ar}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("field.deliveryFee")}: {a.delivery_fee}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArchivedPill archived={a.is_archived} />
                      <Button type="button" size="icon" variant="ghost" onClick={() => openAreaDialog(a)}>
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("cities.noAreas")}</p>
            )}
          </div>
        </div>
      </FormDialog>

      <FormDialog
        open={areaOpen}
        onOpenChange={setAreaOpen}
        isLoading={isAreaSaving}
        title={`${editingAreaId ? t("action.edit") : t("action.create")} — ${t("cities.area")}`}
        onSubmit={() => {
          if (editingAreaId) handleUpdateArea();
          else handleCreateArea();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t("field.areaName")} value={areaForm.area_name} onChange={(v) => setArea({ area_name: v })} />
          <TextField label={t("field.areaNameAr")} value={areaForm.area_name_ar} onChange={(v) => setArea({ area_name_ar: v })} />
          <TextField
            label={t("field.deliveryFee")}
            type="number"
            value={areaForm.delivery_fee}
            onChange={(v) => setArea({ delivery_fee: v })}
          />
          <div className="flex items-end">
            <SwitchField label={t("field.isArchived")} checked={areaForm.is_archived} onChange={(v) => setArea({ is_archived: v })} />
          </div>
        </div>
      </FormDialog>
    </>
  );
}