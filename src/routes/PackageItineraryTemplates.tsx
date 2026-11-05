import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageUploadField, SelectField, TextField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { createPackageItineraryTemplate, deletePackageItineraryTemplate, PackageItineraryModelTemplate, updatePackageItineraryTemplate } from "@/services/ItineraryTemplateServices";
import { useSimpleToast } from "@/components/ui/toaster";
import { useGetDestinations, useGetPackageItinerariesTemplates } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { base64ToFile } from "@/services/CoreServices";
import { imgUrl } from "@/services/api";

type DialogMode = "create" | "edit";

const EMPTY_DRAFT = { itinerary_title: "", itinerary_description: "", itinerary_img: null as File | string | null, destination_id: "" };

export function ItineraryTemplatesPage() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: itinerary, isLoading: isItineraryLoading, error: isItineraryError, refetch } = useGetPackageItinerariesTemplates();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [activeRow, setActiveRow] = useState<PackageItineraryModelTemplate | null>(null);
  const { data: destinations, isLoading: isDestinationsLoading, error: isDestinationsError } = useGetDestinations();
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const openCreateDialog = () => {
    setDialogMode("create");
    setActiveRow(null);
    setDraft(EMPTY_DRAFT);
    setDialogOpen(true);
  };

  const openEditDialog = (row: PackageItineraryModelTemplate) => {
    setDialogMode("edit");
    setActiveRow(row);
    setDraft({
      itinerary_title: row.itinerary_title,
      itinerary_description: row.itinerary_description,
      destination_id: row.destination.id,
      itinerary_img: row.itinerary_img
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isCreateUpdateLoading) return;
    setDialogOpen(false);
    setActiveRow(null);
    setDraft(EMPTY_DRAFT);
  };

  const reportError = (e: any) => {
    const errors = e.response?.data?.data;
    const message = errors
      ? Object.values(errors).flat().join(", ")
      : e.message || t("someThingWentWrong");
    error(message);
  };

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createPackageItineraryTemplate(draft as any);
      if (res.status === 201) {
        await refetch();
        setDialogOpen(false);
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
    if (!draft.itinerary_title.trim() || !activeRow) return;
    setIsCreateUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", String(activeRow.id));

      if (draft.itinerary_title !== activeRow.itinerary_title) {
        formData.append("itinerary_title", draft.itinerary_title ?? "");
      }
      if (draft.itinerary_description !== activeRow.itinerary_description) {
        formData.append("itinerary_description", draft.itinerary_description ?? "");
      }
      if (draft.destination_id !== activeRow.destination.id) {
        formData.append("destination", draft.destination_id ?? "");
      }

      if (draft.itinerary_img && draft.itinerary_img !== activeRow?.itinerary_img) {
        if (typeof draft.itinerary_img === "string" && draft.itinerary_img.startsWith("data:image")) {
          formData.append("itinerary_img", base64ToFile(draft.itinerary_img));
        } else if (draft.itinerary_img instanceof File) {
          formData.append("itinerary_img", draft.itinerary_img);
        }
      }

      const res = await updatePackageItineraryTemplate(formData as any);
      if (res.status === 200) {
        await refetch();
        setDialogOpen(false);
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

  const handleSave = async () => {
    if (!draft.itinerary_title.trim()) return;
    if (dialogMode === "create") {
      handleCreate();
    } else {
      handleUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    setIsCreateUpdateLoading(true);
    setDeletingId(id);
    try {
      const res = await deletePackageItineraryTemplate(id);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
      }
    } catch (e: any) {
      reportError(e);
    } finally {
      setIsCreateUpdateLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <section className="surface-card space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("pkg.itinerary")}</h2>
        <Button type="button" size="sm" className="gap-2" disabled={isCreateUpdateLoading} onClick={openCreateDialog}>
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("action.add")}
        </Button>
      </div>

      {isItineraryLoading ? (
        <LoadingSpinner />
      ) : isItineraryError ? (
        <ErrorMessage />
      ) : itinerary.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          <Sparkles className="size-5" />
          <p>{t("common.noData")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {itinerary.map((it) => (
            <li
            key={it.id}
            className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <img
                src={`${imgUrl}${it.itinerary_img}`}
                alt={it.itinerary_title}
                className="size-12 rounded-md object-cover shrink-0 border"
              />

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{it.itinerary_title}</p>
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground font-normal">
                    {it.destination.destination_name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {it.itinerary_description}
                  </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t("action.edit")}
                onClick={() => openEditDialog(it)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t("action.remove")}
                disabled={deletingId === it.id || isCreateUpdateLoading}
                onClick={() => handleDelete(String(it.id))}
              >
                {isCreateUpdateLoading ? <LoadingSpinner /> : <Trash2 className="size-4 text-destructive" />}
              </Button>
            </div>
          </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? t("addItinerary") : t("editItinerary")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <TextField
              label={t("field.itineraryTitle")}
              value={draft.itinerary_title}
              onChange={(v) => setDraft((d) => ({ ...d, itinerary_title: v }))}
            />
            <TextField
              label={t("field.itineraryDescription")}
              value={draft.itinerary_description}
              onChange={(v) => setDraft((d) => ({ ...d, itinerary_description: v }))}
            />
            {isDestinationsLoading ? <LoadingSpinner/> : isDestinationsError ? <ErrorMessage/> : <SelectField
              label={t("pkg.destination")}
              value={draft.destination_id}
              onChange={(v) => setDraft((d) => ({ ...d, destination_id: v }))}
              options={destinations.map((p) => ({ value: p.id, label: p.destination_name }))}
            />}
             <ImageUploadField 
              label={t("field.img")} 
              value={
                draft.itinerary_img instanceof File 
                  ? URL.createObjectURL(draft.itinerary_img)
                  : typeof draft.itinerary_img === "string" && draft.itinerary_img
                    ? (draft.itinerary_img.startsWith("data:") || draft.itinerary_img.startsWith("http") 
                        ? draft.itinerary_img 
                        : `${imgUrl}${draft.itinerary_img}`)
                    : ""
              } 
              onChange={(v) => setDraft((d) => ({ ...d, itinerary_img: v }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={isCreateUpdateLoading}>
              {t("action.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isCreateUpdateLoading || !draft.itinerary_title.trim()}
            >
              {isCreateUpdateLoading ? t('loading') : dialogMode === "create" ? t("action.create") : t("action.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}