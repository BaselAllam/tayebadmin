import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { FormDialog, SelectField, TextField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useGetCities } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import { UserProfileModel } from "@/contexts/AuthContext";
import { createUserAddress, updateUsersAddress, type UserAddressModel } from "@/services/UsersServices";

const emptyAddress = {
  city_id: "",
  area_id: "",
  street_name: "",
  apartment_number: "",
  flat_number: "",
};

const extractError = (e: any, fallback: string) => {
  const errors = e?.response?.data?.data;
  return errors ? Object.values(errors).flat().join(", ") : e?.message || fallback;
};

interface Props {
  user: UserProfileModel | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<unknown>;
}

export default function UserAddressesDialog({ user, open, onOpenChange, onChanged }: Props) {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: cities } = useGetCities();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);
  const set = (patch: Partial<typeof emptyAddress>) => setForm((f) => ({ ...f, ...patch }));
  const [isSaving, setIsSaving] = useState(false);

  const cityOfArea = (areaId?: string) => cities?.find((c) => c.area_city?.some((a) => a.id === areaId));

  const areaOptions = (cities?.find((c) => c.id === form.city_id)?.area_city ?? [])
    .filter((a) => !a.is_archived || a.id === form.area_id)
    .map((a) => ({ value: a.id, label: `${a.area_name} (${a.delivery_fee})` }));

  const openForm = (address?: UserAddressModel) => {
    if (address) {
      setEditingId(address.id);
      setForm({
        city_id: cityOfArea(address.area?.id)?.id ?? "",
        area_id: address.area?.id ?? "",
        street_name: address.street_name,
        apartment_number: String(address.apartment_number ?? ""),
        flat_number: String(address.flat_number ?? ""),
      });
    } else {
      setEditingId(null);
      setForm(emptyAddress);
    }
    setFormOpen(true);
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!form.area_id) return error(t("address.areaRequired"));
    setIsSaving(true);
    try {
      const res = await createUserAddress({
        user_id: user.id,
        area_id: form.area_id,
        street_name: form.street_name,
        apartment_number: Number(form.apartment_number) || 0,
        flat_number: Number(form.flat_number) || 0,
      });
      if (res.status === 201) {
        await onChanged();
        success(t("common.saved"));
        setFormOpen(false);
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    const address = user?.user_addresses?.find((a) => a.id === editingId);
    if (!editingId || !address) return;
    if (!form.area_id) return error(t("address.areaRequired"));
    setIsSaving(true);

    const formData = new FormData();
    formData.append("id", editingId);
    if (form.area_id !== address.area?.id) formData.append("area", form.area_id);
    if (form.street_name !== address.street_name) formData.append("street_name", form.street_name);
    if (Number(form.apartment_number) !== Number(address.apartment_number)) formData.append("apartment_number", String(Number(form.apartment_number) || 0));
    if (Number(form.flat_number) !== Number(address.flat_number)) formData.append("flat_number", String(Number(form.flat_number) || 0));

    try {
      const res = await updateUsersAddress(formData);
      if (res.status === 200) {
        await onChanged();
        success(t("common.saved"));
        setFormOpen(false);
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsSaving(false);
    }
  };

  const addresses = user?.user_addresses ?? [];

  return (
    <>
      {/* Addresses list */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("address.title")} — {user?.first_name} {user?.last_name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-end">
            <Button type="button" size="sm" className="gap-1" onClick={() => openForm()}>
              <Plus className="size-4" />
              {t("address.add")}
            </Button>
          </div>

          {addresses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("address.empty")}</p>
          ) : (
            <ul className="divide-y overflow-hidden rounded-md border">
              {addresses.map((a) => {
                const city = cityOfArea(a.area?.id);
                return (
                  <li key={a.id} className="flex items-start justify-between gap-3 px-3 py-3">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-sm font-medium">
                        {city ? `${city.city_name} — ` : ""}
                        {a.area?.area_name}
                      </p>
                      <p className="break-words text-sm text-muted-foreground">{a.street_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("field.apartmentNumber")}: {a.apartment_number} · {t("field.flatNumber")}: {a.flat_number}
                      </p>
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="shrink-0" onClick={() => openForm(a)}>
                      <Pencil className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Address form — sibling of the list dialog, not a child */}
      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isLoading={isSaving}
        title={editingId ? t("address.edit") : t("address.add")}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <SelectField
            label={t("field.city")}
            value={form.city_id}
            onChange={(v) => set({ city_id: v, area_id: "" })}
            options={(cities ?? [])
              .filter((c) => !c.is_archived || c.id === form.city_id)
              .map((c) => ({ value: c.id, label: c.city_name }))}
          />
          <SelectField
            label={t("field.area")}
            value={form.area_id}
            onChange={(v) => set({ area_id: v })}
            options={areaOptions}
          />
          <div className="sm:col-span-2">
            <TextField label={t("field.streetName")} value={form.street_name} onChange={(v) => set({ street_name: v })} />
          </div>
          <TextField label={t("field.apartmentNumber")} type="number" value={form.apartment_number} onChange={(v) => set({ apartment_number: v })} />
          <TextField label={t("field.flatNumber")} type="number" value={form.flat_number} onChange={(v) => set({ flat_number: v })} />
        </div>
      </FormDialog>
    </>
  );
}