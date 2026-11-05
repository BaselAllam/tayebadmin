import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataTable, FormDialog, ImageUploadField, PageHeader, SelectField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { imgUrl } from "@/services/api";
import { useGetOurBranches, useGetSiteContent, useGetSiteImages } from "@/hooks/useSiteData";
import { createOurBranches, createSiteContent, createSitesImages, deleteOurBranch, deleteSiteImg, OurBranchesModel, SiteContentModel, SiteImagesModel, updateOurBranches, updateSiteContent, updateSitesImages } from "@/services/cmsService";
import { base64ToFile } from "@/services/CoreServices";


export default function CmsPage() {
    const { t } = useI18n();

  return (
    <>
      <PageHeader title={t("cms.title")} subtitle={t("cms.subtitle")} />

      <Tabs defaultValue="branches" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="branches">{t("cms.tab.branches")}</TabsTrigger>
          <TabsTrigger value="images">{t("cms.tab.images")}</TabsTrigger>
          <TabsTrigger value="content">{t("cms.tab.siteContent")}</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-4">
          <BranchesTab />
        </TabsContent>
        <TabsContent value="images" className="space-y-4">
          <SiteImagesTab />
        </TabsContent>
        <TabsContent value="content" className="space-y-4">
          <SiteContentTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

/* -------------------------------------------------------------- branches tab */

const emptyBranch = {
  name: "",
  city: "",
  number: "",
  address: "",
  email: "",
};

function BranchesTab() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [form, setForm] = useState(emptyBranch);
  const set = (patch: Partial<typeof emptyBranch>) => setForm((f) => ({ ...f, ...patch }));

  const { data: branches, isLoading: isBranchesLoading, error: isBranchesError, refetch } = useGetOurBranches();
  const { success, error } = useSimpleToast();

  const columns: Column<OurBranchesModel>[] = [
    { key: "name", header: t("cms.field.name"), cell: (b) => <span className="font-medium">{b.name}</span> },
    { key: "city", header: t("cms.field.city"), cell: (b) => b.city },
    { key: "number", header: t("cms.field.number"), cell: (b) => b.number },
    {
      key: "address",
      header: t("cms.field.address"),
      cell: (b) => <span className="line-clamp-2 max-w-[18rem] text-muted-foreground">{b.address}</span>,
    },
    { key: "email", header: t("cms.field.email"), cell: (b) => b.email },
  ];

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createOurBranches(form);
      if (res.status === 201) {
        await refetch();
        success(t("cms.common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("cms.someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const branch = branches?.find((x) => x.id === editingId);
      const formData = new FormData();
      formData.append("id", editingId as string);

      if (form.name !== branch?.name) formData.append("name", form.name);
      if (form.city !== branch?.city) formData.append("city", form.city);
      if (form.number !== branch?.number) formData.append("number", form.number);
      if (form.address !== branch?.address) formData.append("address", form.address);
      if (form.email !== branch?.email) formData.append("email", form.email);

      const res = await updateOurBranches(formData);
      if (res.status === 200) {
        await refetch();
        success(t("cms.common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("cms.someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await deleteOurBranch(id);
      if (res.status === 200) {
        await refetch();
        setEditingId(null);
        setOpen(false);
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
    }
  };

  if (isBranchesLoading) return <LoadingSpinner />;
  if (isBranchesError) return <ErrorMessage />;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            setEditingId(null);
            setForm(emptyBranch);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t("cms.action.create")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={branches}
        onEdit={(b) => {
          setEditingId(b.id);
          setForm({
            name: b.name,
            city: b.city,
            number: b.number,
            address: b.address,
            email: b.email,
          });
          setOpen(true);
        }}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        wide
        title={`${editingId ? t("cms.action.edit") : t("cms.action.create")} — ${t("cms.tab.branches")}`}
        onSubmit={() => {
          if (isCreateUpdateLoading) return;
          if (editingId) void handleUpdate();
          else void handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t("cms.field.name")} value={form.name} onChange={(v) => set({ name: v })} />
          <TextField label={t("cms.field.city")} value={form.city} onChange={(v) => set({ city: v })} />
          <TextField label={t("cms.field.number")} value={form.number} onChange={(v) => set({ number: v })} />
          <TextField label={t("cms.field.email")} type="email" value={form.email} onChange={(v) => set({ email: v })} />
          <TextField
            label={t("cms.field.address")}
            value={form.address}
            onChange={(v) => set({ address: v })}
            className="sm:col-span-2"
          />
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={t("action.remove")}
          disabled={isCreateUpdateLoading || !editingId}
          onClick={() => handleDeleteBranch(editingId as string)}
        >
          {isCreateUpdateLoading ? <LoadingSpinner /> : <Trash2 className="size-4 text-destructive" />}
        </Button>
      </FormDialog>
    </>
  );
}

/* ---------------------------------------------------------- site images tab */

const emptySiteImage = {
  image: null as File | string | null,
  page: "",
  img_position: "",
};

function SiteImagesTab() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [form, setForm] = useState(emptySiteImage);
  const set = (patch: Partial<typeof emptySiteImage>) => setForm((f) => ({ ...f, ...patch }));

  const { data: siteImages, isLoading: isImagesLoading, error: isImagesError, refetch } = useGetSiteImages();
  const { success, error } = useSimpleToast();

  const pageOptions = [
    { value: "Home", label: t("cms.page.home") },
    { value: "About", label: t("cms.page.about") },
    { value: "Contact", label: t("cms.page.contact") },
    { value: "Gallery", label: t("cms.page.gallery") },
    { value: "Destinations", label: t("cms.page.destinations") },
    { value: "Tours", label: t("cms.page.tours") },
    { value: "Holy", label: t("cms.page.holy") },
    { value: "Faqs", label: t("cms.page.faqs") },
    { value: "Why Egypt", label: t("cms.page.whyEgypt") },
    { value: "When Visit", label: t("cms.page.whenVisit") },
    { value: "Travel Guide", label: t("cms.page.travelGuide") },
    { value: "Practical Info", label: t("cms.page.practicalInfo") },
  ];

  const positionOptions = [
    { value: "Hero", label: t("cms.position.hero") },
    // { value: "background", label: t("cms.position.background") },
    // { value: "thumbnail", label: t("cms.position.thumbnail") },
    { value: "Section", label: t("cms.position.section") },
  ];

  const openEdit = (s: SiteImagesModel) => {
    setEditingId(s.id);
    setForm({ image: s.image, page: s.page, img_position: s.img_position });
    setOpen(true);
  };

  const resolvedImageSrc = (image: File | string | null) => {
    if (image instanceof File) return URL.createObjectURL(image);
    if (typeof image === "string" && image) {
      return image.startsWith("data:") || image.startsWith("http") ? image : `${imgUrl}${image}`;
    }
    return "";
  };

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createSitesImages(form);
      if (res.status === 201) {
        await refetch();
        success(t("cms.common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("cms.someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const siteImage = siteImages?.find((x) => x.id === editingId);
      const formData = new FormData();
      formData.append("id", editingId as string);

      if (form.page !== siteImage?.page) formData.append("page", form.page);
      if (form.img_position !== siteImage?.img_position) formData.append("img_position", form.img_position);

      if (form.image && form.image !== siteImage?.image) {
        if (typeof form.image === "string" && form.image.startsWith("data:image")) {
          formData.append("image", base64ToFile(form.image));
        } else if (form.image instanceof File) {
          formData.append("image", form.image);
        }
      }

      const res = await updateSitesImages(formData);
      if (res.status === 200) {
        await refetch();
        success(t("cms.common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("cms.someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleDeleteSiteImg = async (id: string) => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await deleteSiteImg(id);
      if (res.status === 200) {
        await refetch();
        setOpen(false);
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
    }
  };

  if (isImagesLoading) return <LoadingSpinner />;
  if (isImagesError) return <ErrorMessage />;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            setEditingId(null);
            setForm(emptySiteImage);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t("cms.action.create")}
        </Button>
      </div>

      {siteImages.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">{t("cms.common.noData")}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {siteImages.map((s) => (
            <div key={s.id} className="surface-card overflow-hidden">
              <img src={`${imgUrl}${s.image}`} alt="" loading="lazy" className="h-40 w-full object-cover" />
              <div className="space-y-1 p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{pageOptions.find((p) => p.value === s.page)?.label ?? s.page}</span>
                  <span className="text-muted-foreground">
                    {positionOptions.find((p) => p.value === s.img_position)?.label ?? s.img_position}
                  </span>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                    {t("cms.action.edit")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        title={`${editingId ? t("cms.action.edit") : t("cms.action.create")} — ${t("cms.tab.images")}`}
        onSubmit={() => {
          if (isCreateUpdateLoading) return;
          if (editingId) void handleUpdate();
          else void handleCreate();
        }}
      >
        <div className="grid gap-4">
          <SelectField
            label={t("cms.field.page")}
            value={form.page}
            onChange={(v) => set({ page: v })}
            options={pageOptions}
          />
          <SelectField
            label={t("cms.field.imgPosition")}
            value={form.img_position}
            onChange={(v) => set({ img_position: v })}
            options={positionOptions}
          />
          <ImageUploadField
            label={t("cms.field.img")}
            value={resolvedImageSrc(form.image)}
            onChange={(v) => set({ image: v })}
          />
          {form.image ? (
            <img
              src={resolvedImageSrc(form.image)}
              alt=""
              className="h-40 w-full rounded-lg border border-border object-cover"
            />
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t("action.remove")}
            disabled={isCreateUpdateLoading || !editingId}
            onClick={() => handleDeleteSiteImg(editingId as string)}
          >
            {isCreateUpdateLoading ? <LoadingSpinner /> : <Trash2 className="size-4 text-destructive" />}
          </Button>
        </div>
      </FormDialog>
    </>
  );
}


const emptySiteContent = {
  page: "",
  content_key: "",
  content: "",
  content_de: "",
};

function SiteContentTab() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [form, setForm] = useState(emptySiteContent);
  const set = (patch: Partial<typeof emptySiteContent>) => setForm((f) => ({ ...f, ...patch }));

  const { data: siteContent, isLoading: isContentLoading, error: isContentError, refetch } = useGetSiteContent();
  const { success, error } = useSimpleToast();

  const pageOptions = [
    { value: "Home", label: t("cms.page.home") },
    { value: "About", label: t("cms.page.about") },
    { value: "Contact", label: t("cms.page.contact") },
    { value: "Destinations", label: t("cms.page.destinations") },
    { value: "Tours", label: t("cms.page.tours") },
    { value: "Holy", label: t("cms.page.holy") },
    { value: "Faqs", label: t("cms.page.faqs") },
    { value: "Footer", label: t("cms.page.footer") },
    { value: "Gallery", label: t("cms.page.gallery") },
    { value: "Why Egypt", label: t("cms.page.whyEgypt") },
    { value: "When Visit", label: t("cms.page.whenVisit") },
    { value: "Travel Guide", label: t("cms.page.travelGuide") },
    { value: "Practical Info", label: t("cms.page.practicalInfo") },
  ];

  const contentKeyOptions = [
    { value: "title", label: t("cms.keyoptions.title") },
    { value: "description", label: t("cms.page.description") },
    { value: "hero_title", label: t("cms.page.hero_title") },
    { value: "hero_description", label: t("cms.page.hero_description") },
    { value: "slogan", label: t("cms.page.slogan") },
  ];

  const columns: Column<SiteContentModel>[] = [
    { key: "key", header: t("cms.field.key"), cell: (c) => <span className="font-mono text-xs font-medium">{c.content_key}</span> },
    {
      key: "page",
      header: t("cms.field.page"),
      cell: (c) => pageOptions.find((p) => p.value === c.page)?.label ?? c.page,
    },
    {
      key: "text_en",
      header: t("cms.field.textEn"),
      cell: (c) => <span className="line-clamp-2 max-w-[16rem] text-muted-foreground">{c.content}</span>,
    },
    {
      key: "text_ar",
      header: t("cms.field.textAr"),
      cell: (c) => <span dir="rtl" className="line-clamp-2 max-w-[16rem] text-muted-foreground">{c.content_de}</span>,
    },
  ];

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createSiteContent(form);
      if (res.status === 201) {
        await refetch();
        success(t("cms.common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("cms.someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const content = siteContent?.find((x) => x.id === editingId);
      const formData = new FormData();
      formData.append("id", editingId as string);

      if (form.content_key !== content?.content_key) formData.append("content_key", form.content_key);
      if (form.page !== content?.page) formData.append("page", form.page);
      if (form.content !== content?.content) formData.append("content", form.content);
      if (form.content_de !== content?.content_de) formData.append("content_de", form.content_de);

      const res = await updateSiteContent(formData);
      if (res.status === 200) {
        await refetch();
        success(t("cms.common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("cms.someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  if (isContentLoading) return <LoadingSpinner />;
  if (isContentError) return <ErrorMessage />;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          disabled={isCreateUpdateLoading}
          onClick={() => {
            setEditingId(null);
            setForm(emptySiteContent);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("cms.action.create")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={siteContent}
        onEdit={(c) => {
          setEditingId(c.id);
          setForm({
            content_key: c.content_key,
            page: c.page,
            content: c.content,
            content_de: c.content_de,
          });
          setOpen(true);
        }}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        wide
        isLoading={isCreateUpdateLoading}
        title={`${editingId ? t("cms.action.edit") : t("cms.action.create")} — ${t("cms.tab.siteContent")}`}
        onSubmit={() => {
          if (isCreateUpdateLoading) return;
          if (editingId) void handleUpdate();
          else void handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={t("cms.field.key")}
            value={form.content_key}
            onChange={(v) => set({ content_key: v })}
            options={contentKeyOptions}
          />
          <SelectField
            label={t("cms.field.page")}
            value={form.page}
            onChange={(v) => set({ page: v })}
            options={pageOptions}
          />
          <TextField
            label={t("cms.field.textEn")}
            value={form.content}
            onChange={(v) => set({ content: v })}
            className="sm:col-span-2"
          />
          <TextField
            label={t("cms.field.textAr")}
            value={form.content_de}
            onChange={(v) => set({ content_de: v })}
            className="sm:col-span-2"
          />
        </div>
      </FormDialog>
    </>
  );
}