import { Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import { useState } from "react";
import { TextField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { createPackageHighlightsTemplate, deletePackageHighlightsTemplate, PackageHighlightsModelTemplate, updatePackageHighlightsTemplate } from "@/services/HighlightsTemplateServices";
import { useSimpleToast } from "@/components/ui/toaster";
import { useGetPackageHighlightsTemplates } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";

type DialogMode = "create" | "edit";

export function HighlightsPageTemplates() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: highlights, isLoading: isHighlightsLoading, error: isHighlightsError, refetch } = useGetPackageHighlightsTemplates();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [activeRow, setActiveRow] = useState<PackageHighlightsModelTemplate | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const openCreateDialog = () => {
    setDialogMode("create");
    setActiveRow(null);
    setDraftValue("");
    setDialogOpen(true);
  };

  const openEditDialog = (row: PackageHighlightsModelTemplate) => {
    setDialogMode("edit");
    setActiveRow(row);
    setDraftValue(row.highlights_title);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isCreateUpdateLoading) return;
    setDialogOpen(false);
    setActiveRow(null);
    setDraftValue("");
  };

  const reportError = (e: any) => {
    const errors = e.response?.data?.data;
    const message = errors
      ? Object.values(errors).flat().join(", ")
      : e.message || t("someThingWentWrong");
    error(message);
  };

  const handleSave = async () => {
    if (!draftValue.trim()) return;
    setIsCreateUpdateLoading(true);

    try {
      if (dialogMode === "create") {
        const res = await createPackageHighlightsTemplate({
          highlights_title: draftValue,
        } as any);
        if (res.status === 201) {
          await refetch();
          success(t("common.saved"));
          setDialogOpen(false);
        }
      } else if (activeRow) {
        const formData = new FormData();
        formData.append("id", String(activeRow.id));
        formData.append("highlights_title", draftValue);

        const res = await updatePackageHighlightsTemplate(formData as any);
        if (res.status === 200) {
          await refetch();
          success(t("common.saved"));
          setDialogOpen(false);
        }
      }
    } catch (e: any) {
      reportError(e);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsCreateUpdateLoading(true);
    setDeletingId(id);
    try {
      const res = await deletePackageHighlightsTemplate(id);
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
        <h2 className="text-base font-semibold">{t("pkg.highlights")}</h2>
        <Button type="button" size="sm" className="gap-2" disabled={isCreateUpdateLoading} onClick={openCreateDialog}>
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("action.add")}
        </Button>
      </div>

      {isHighlightsLoading ? (
        <LoadingSpinner />
      ) : isHighlightsError ? (
        <ErrorMessage />
      ) : highlights.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          <Sparkles className="size-5" />
          <p>{t("common.noData")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {highlights.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
            >
              <span className="text-sm">{h.highlights_title}</span>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={t("action.edit")}
                  onClick={() => openEditDialog(h)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={t("action.remove")}
                  disabled={deletingId === h.id || isCreateUpdateLoading}
                  onClick={() => handleDelete(String(h.id))}
                >
                  {isCreateUpdateLoading ? <LoadingSpinner /> : <Trash2 className="size-4 text-destructive" />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? t("pkg.addhighlights") : t("pkg.edithighlights")}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <TextField
              label={t("field.highlightsTitle")}
              value={draftValue}
              onChange={setDraftValue}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={isCreateUpdateLoading}>
              {t("action.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isCreateUpdateLoading || !draftValue.trim()}
            >
              {isCreateUpdateLoading ? t('loading') : dialogMode === "create" ? t("action.create") : t("action.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}