import { Plus } from "lucide-react";
import { useState } from "react";
import { ArchivedPill, DataTable, FormDialog, ImageUploadField, PageHeader, SelectField, StatusPill, SwitchField, TextAreaField, TextField, Thumb, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ContactRequest, type ContactStatus, type Destination, type Faq, type GalleryItem } from "@/lib/data-store";
import { useI18n } from "@/lib/i18n";
import { useGetContactUs, useGetDestinations, useGetFaqs, useGetGallery } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { base64ToFile, createDestinations, createFaqs, createGallery, updateContactUs, updateDestinations, updateFaqs, updateGallery } from "@/services/CoreServices";
import { imgUrl } from "@/services/api";

const contactTone: Record<ContactStatus, string> = {
  new: "warning",
  in_progress: "info",
  resolved: "success",
};

export default function SiteCoresPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader title={t("cores.title")} subtitle={t("cores.subtitle")} />

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="contact">{t("cores.tab.contact")}</TabsTrigger>
          <TabsTrigger value="faqs">{t("cores.tab.faqs")}</TabsTrigger>
          <TabsTrigger value="destinations">{t("cores.tab.destinations")}</TabsTrigger>
          <TabsTrigger value="gallery">{t("cores.tab.gallery")}</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <ContactTab />
        </TabsContent>
        <TabsContent value="faqs" className="space-y-4">
          <FaqTab />
        </TabsContent>
        <TabsContent value="destinations" className="space-y-4">
          <DestinationTab />
        </TabsContent>
        <TabsContent value="gallery" className="space-y-4">
          <GalleryTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ---------------------------------------------------------- contact requests */

const emptyContact = {
  full_name: "",
  user_email: "",
  user_phone: "",
  subject: "",
  message: "",
  created_at: new Date().toISOString().slice(0, 10),
  status: ''
};

function ContactTab() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyContact);
  const set = (patch: Partial<typeof emptyContact>) => setForm((f) => ({ ...f, ...patch }));
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const {data: contacts, isLoading: isContactsLoading, error: isContactsError, refetch} = useGetContactUs();
  const { success, error } = useSimpleToast();

  const columns: Column<ContactRequest>[] = [
    { key: "name", header: t("field.fullName"), cell: (c) => <span className="font-medium">{c.full_name}</span> },
    { key: "email", header: t("field.userEmail"), cell: (c) => c.user_email },
    { key: "phone", header: t("field.userPhone"), cell: (c) => c.user_phone },
    { key: "subject", header: t("field.subject"), cell: (c) => c.subject },
    {
      key: "message",
      header: t("field.message"),
      cell: (c) => <span className="line-clamp-2 max-w-[16rem] text-muted-foreground">{c.message}</span>,
    },
    { key: "created", header: t("field.createdAt"), cell: (c) => c.created_at.slice(0, 10) },
    {
      key: "status",
      header: t("common.status"),
      cell: (c) => <StatusPill label={c.status} tone={contactTone[c.status]} />,
    },
  ];

  const handleSave = async () => {
      setIsCreateUpdateLoading(true);
    
      const formData = new FormData();
      const contactUs = contacts.find((x) => x.id === editingId);
      formData.append('id', editingId);
      if (form.full_name !== contactUs.full_name) formData.append('full_name', form.full_name);
      if (form.message !== contactUs.message) formData.append('message', form.message);
      if (form.user_phone !== contactUs.user_phone) formData.append('user_phone', form.user_phone);
      if (form.subject !== contactUs.subject) formData.append('subject', form.subject);
      if (form.message !== contactUs.message) formData.append('message', form.message);
      if (form.status !== contactUs.status) formData.append('status', form.status);
      try {
        const res = await updateContactUs(formData as any);
          if (res.status === 200) {
          await refetch();
          success(t("common.saved"));
          setOpen(false);
        }
      } catch (e) {
        const errors = e.response?.data?.data;
        const message = errors ? Object.values(errors).flat().join(', ') : e.message || t('someThingWentWrong');
        error(message);
      } finally {
        setIsCreateUpdateLoading(false);
      }
    };

  if (isContactsLoading) return <LoadingSpinner/>;
  if (isContactsError) return <ErrorMessage/>;

  return (
    <>

      <DataTable
        columns={columns}
        rows={contacts}
        onEdit={(c) => {
          setEditingId(c.id);
          setForm({
            full_name: c.full_name,
            user_email: c.user_email,
            user_phone: c.user_phone,
            subject: c.subject,
            message: c.message,
            created_at: c.created_at,
            status: c.status,
          });
          setOpen(true);
        }}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        wide
        title={`${editingId ? t("action.edit") : t("action.create")} — ${t("cores.tab.contact")}`}
        onSubmit={() => {
          if (editingId) handleSave();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t("field.fullName")} value={form.full_name} onChange={(v) => set({ full_name: v })} />
          <TextField label={t("field.userEmail")} type="email" value={form.user_email} onChange={(v) => set({ user_email: v })} />
          <TextField label={t("field.userPhone")} value={form.user_phone} onChange={(v) => set({ user_phone: v })} />
          <TextField label={t("field.subject")} value={form.subject} onChange={(v) => set({ subject: v })} />
          <TextField label={t("field.createdAt")} type="date" value={form.created_at.slice(0, 10)} onChange={(v) => set({ created_at: v })} />
          <SelectField
            label={t("common.status")}
            value={form.status}
            onChange={(v) => set({ status: v as ContactStatus })}
            options={[
              { value: "Submitted", label: t("contact.status.Submitted") },
              { value: "Contacted", label: t("contact.status.Contacted") },
            ]}
          />
          <TextAreaField
            label={t("field.message")}
            value={form.message}
            onChange={(v) => set({ message: v })}
            className="sm:col-span-2"
            rows={4}
          />
        </div>
      </FormDialog>
    </>
  );
}

/* ----------------------------------------------------------------- faqs tab */

const emptyFaq = {
  faq_title: "",
  faq_title_de: "",
  faq_description: "",
  faq_description_de: "",
  is_archived: false,
};

function FaqTab() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [form, setForm] = useState(emptyFaq);
  const set = (patch: Partial<typeof emptyFaq>) => setForm((f) => ({ ...f, ...patch }));
  const {data: faqs, isLoading: isFaqsLoading, error: isFaqsError, refetch} = useGetFaqs();
  const { success, error, toast } = useSimpleToast();

  const columns: Column<Faq>[] = [
    { key: "title", header: t("field.faqTitle"), cell: (f) => <span className="font-medium">{f.faq_title}</span> },
    { key: "titleAr", header: t("field.faqTitleAr"), cell: (f) => f.faq_title_de },
    {
      key: "desc",
      header: t("field.faqDescription"),
      cell: (f) => <span className="line-clamp-2 max-w-[20rem] text-muted-foreground">{f.faq_description}</span>,
    },
    { key: "archived", header: t("common.status"), cell: (f) => <ArchivedPill archived={f.is_archived} /> },
  ];

  const handleCreate = async () => {
      setIsCreateUpdateLoading(true);
    
      try {
        const res = await createFaqs(form);
          if (res.status === 201) {
          await refetch();
          success(t("common.saved"));
          setOpen(false);
        }
      } catch (e) {
        const errors = e.response?.data?.data;
        const message = errors ? Object.values(errors).flat().join(', ') : e.message || t('someThingWentWrong');
        error(message);
      } finally {
        setIsCreateUpdateLoading(false);
      }
    };

  const handleUpdate = async () => {
      setIsCreateUpdateLoading(true);
    
      const formData = new FormData();
      const faq = faqs.find((x) => x.id === editingId);
      formData.append('id', editingId);
      if (form.faq_title !== faq.faq_title) formData.append('faq_title', form.faq_title);
      if (form.faq_title_de !== faq.faq_title_de) formData.append('faq_title_de', form.faq_title_de);
      if (form.faq_description !== faq.faq_description) formData.append('faq_description', form.faq_description);
      if (form.faq_description_de !== faq.faq_description_de) formData.append('faq_description_de', form.faq_description_de);
      if (form.is_archived !== faq.is_archived) formData.append('is_archived', String(form.is_archived));
      try {
        const res = await updateFaqs(formData as any);
          if (res.status === 200) {
          await refetch();
          success(t("common.saved"));
          setOpen(false);
        }
      } catch (e) {
        const errors = e.response?.data?.data;
        const message = errors ? Object.values(errors).flat().join(', ') : e.message || t('someThingWentWrong');
        error(message);
      } finally {
        setIsCreateUpdateLoading(false);
      }
    };

  if (isFaqsLoading) return <LoadingSpinner/>;
  if (isFaqsError) return <ErrorMessage/>;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          disabled={isCreateUpdateLoading}
          onClick={() => {
            setEditingId(null);
            setForm(emptyFaq);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("action.create")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={faqs}
        onEdit={(f) => {
          setEditingId(f.id);
          setForm({
            faq_title: f.faq_title,
            faq_title_de: f.faq_title_de,
            faq_description: f.faq_description,
            faq_description_de: f.faq_description_de,
            is_archived: f.is_archived,
          });
          setOpen(true);
        }}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        wide
        title={`${editingId ? t("action.edit") : t("action.create")} — ${t("cores.tab.faqs")}`}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t("field.faqTitle")} value={form.faq_title} onChange={(v) => set({ faq_title: v })} />
          <TextField label={t("field.faqTitleAr")} value={form.faq_title_de} onChange={(v) => set({ faq_title_de: v })} />
          <TextAreaField label={t("field.faqDescription")} value={form.faq_description} onChange={(v) => set({ faq_description: v })} />
          <TextAreaField label={t("field.faqDescriptionAr")} value={form.faq_description_de} onChange={(v) => set({ faq_description_de: v })} />
          <div className="sm:col-span-2">
            <SwitchField label={t("field.isArchived")} checked={form.is_archived} onChange={(v) => set({ is_archived: v })} />
          </div>
        </div>
      </FormDialog>
    </>
  );
}

/* --------------------------------------------------------- destinations tab */
const emptyDestination = {
  destination_name: "",
  destination_name_de: "",
  destination_description: "",
  destination_description_de: "",
  img: null as File | string | null,
  is_archived: false,
};

function DestinationTab() {
  const { t } = useI18n();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyDestination);
  
  const set = (patch: Partial<typeof emptyDestination>) => 
    setForm((f) => ({ ...f, ...patch }));

  const { data: destinations, isLoading: isDestinationsLoading, error: isDestinationsError, refetch } = useGetDestinations();
  const { success, error } = useSimpleToast();

  const columns: Column<Destination>[] = [
    { key: "img", header: t("field.img"), cell: (d) => <Thumb src={`${imgUrl}${d.img}`} alt={d.destination_name} /> },
    { key: "name", header: t("field.destinationName"), cell: (d) => <span className="font-medium">{d.destination_name}</span> },
    { key: "nameAr", header: t("field.destinationNameAr"), cell: (d) => d.destination_name_de },
    {
      key: "desc",
      header: t("field.destinationDescription"),
      cell: (d) => <span className="line-clamp-2 max-w-[18rem] text-muted-foreground">{d.destination_description}</span>,
    },
    { key: "archived", header: t("common.status"), cell: (d) => <ArchivedPill archived={d.is_archived} /> },
  ];

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createDestinations(form);
      if (res.status === 201) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
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
    setIsCreateUpdateLoading(true);
    try {
      const destination = destinations?.find((x) => x.id === editingId);
    const formData = new FormData();

    formData.append("id", editingId);

    if (destination.destination_name !== form.destination_name) {
      formData.append("destination_name", form.destination_name);
    }
    if (destination.destination_name_de !== form.destination_name_de) {
      formData.append("destination_name_de", form.destination_name_de);
    }
    if (destination.destination_description != form.destination_description) {
      formData.append("destination_description", form.destination_description);
    }
    if (destination.destination_description_de != form.destination_description_de) {
      formData.append("destination_description_de", form.destination_description_de);
    }
    if (destination.is_archived != form.is_archived) {
      formData.append("is_archived", String(form.is_archived));
    }

    if (form.img && form.img !== destination?.img) {
      if (typeof form.img === "string" && form.img.startsWith("data:image")) {
        formData.append("img", base64ToFile(form.img));
      } else if (form.img instanceof File) {
        formData.append("img", form.img);
      }
    }
      const res = await updateDestinations(formData);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  if (isDestinationsLoading) return <LoadingSpinner />;
  if (isDestinationsError) return <ErrorMessage />;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          disabled={isCreateUpdateLoading}
          onClick={() => {
            setEditingId(null);
            setForm(emptyDestination);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("action.create")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={destinations}
        onEdit={(d) => {
          setEditingId(d.id);
          setForm({
            destination_name: d.destination_name,
            destination_name_de: d.destination_name_de,
            destination_description: d.destination_description,
            destination_description_de: d.destination_description_de,
            img: d.img,
            is_archived: d.is_archived,
          });
          setOpen(true);
        }}
      />

      <FormDialog
        open={open}
        isLoading={isCreateUpdateLoading}
        onOpenChange={setOpen}
        wide
        title={`${editingId ? t("action.edit") : t("action.create")} — ${t("cores.tab.destinations")}`}
        onSubmit={() => {
          if (isCreateUpdateLoading) return;
          if (editingId) void handleUpdate();
          else void handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField 
            label={t("field.destinationName")} 
            value={form.destination_name} 
            onChange={(v) => set({ destination_name: v })} 
          />
          <TextField 
            label={t("field.destinationNameAr")} 
            value={form.destination_name_de} 
            onChange={(v) => set({ destination_name_de: v })} 
          />
          <TextAreaField 
            label={t("field.destinationDescription")} 
            value={form.destination_description} 
            onChange={(v) => set({ destination_description: v })} 
          />
          <TextAreaField 
            label={t("field.destinationDescriptionAr")} 
            value={form.destination_description_de} 
            onChange={(v) => set({ destination_description_de: v })} 
          />
          <ImageUploadField 
            label={t("field.img")} 
            value={
              form.img instanceof File 
                ? URL.createObjectURL(form.img)
                : typeof form.img === "string" && form.img
                  ? (form.img.startsWith("data:") || form.img.startsWith("http") 
                      ? form.img 
                      : `${imgUrl}${form.img}`)
                  : ""
            } 
            onChange={(v) => set({ img: v })} 
          />
          <div className="sm:col-span-2">
            <SwitchField 
              label={t("field.isArchived")} 
              checked={form.is_archived} 
              onChange={(v) => set({ is_archived: v })} 
            />
          </div>
        </div>
      </FormDialog>
    </>
  );
}

/* -------------------------------------------------------------- gallery tab */

const emptyGallery = { img: null as File | string | null, is_archived: false };

function GalleryTab() {
  const { t } = useI18n();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyGallery);
  const set = (patch: Partial<typeof emptyGallery>) => setForm((f) => ({ ...f, ...patch }));
  const { data: galleries, isLoading: isGalleryLoading, error: isGalleryError, refetch } = useGetGallery();
  const { success, error } = useSimpleToast();

  const openEdit = (g: GalleryItem) => {
    setEditingId(g.id);
    setForm({ img: g.img, is_archived: g.is_archived });
    setOpen(true);
  };

  const handleCreate = async () => {
    setIsCreateUpdateLoading(true);
    try {
      const res = await createGallery(form);
      if (res.status === 201) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
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
    setIsCreateUpdateLoading(true);
    try {
      const gallery = galleries?.find((x) => x.id === editingId);
      const formData = new FormData();

      formData.append("id", editingId);

      if (form.is_archived !== gallery?.is_archived) {
        formData.append("is_archived", String(form.is_archived));
      }

      if (form.img && form.img !== gallery?.img) {
        if (typeof form.img === "string" && form.img.startsWith("data:image")) {
          formData.append("img", base64ToFile(form.img));
        } 
        else if (form.img instanceof File) {
          formData.append("img", form.img);
        }
      }
      const res = await updateGallery(formData as any);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
      }
    } catch (e: any) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(", ") : e.message || t("someThingWentWrong");
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  if (isGalleryLoading) return <LoadingSpinner />;
  if (isGalleryError) return <ErrorMessage />;

  return (
    <>
      <div className="flex justify-end">
        <Button
          className="gap-2"
          disabled={isCreateUpdateLoading}
          onClick={() => {
            setEditingId(null);
            setForm(emptyGallery);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          {isCreateUpdateLoading ? t('loading') : t("action.create")}
        </Button>
      </div>

      {galleries.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">
          {t("common.noData")}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {galleries.map((g) => (
            <div key={g.id} className="surface-card overflow-hidden">
              <img src={`${imgUrl}${g.img}`} alt="" loading="lazy" className="h-40 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3">
                <ArchivedPill archived={g.is_archived} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(g)}>
                    {t("action.edit")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormDialog
        open={open}
        isLoading={isCreateUpdateLoading}
        onOpenChange={setOpen}
        title={`${editingId ? t("action.edit") : t("action.create")} — ${t("cores.tab.gallery")}`}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <ImageUploadField 
            label={t("field.img")} 
            value={
              form.img instanceof File 
                ? URL.createObjectURL(form.img)
                : typeof form.img === "string" && form.img
                  ? (form.img.startsWith("data:") || form.img.startsWith("http") 
                      ? form.img 
                      : `${imgUrl}${form.img}`)
                  : ""
            } 
            onChange={(v) => set({ img: v })} 
          />
        {form.img ? (
        <img 
          src={
            form.img instanceof File 
              ? URL.createObjectURL(form.img)
              : typeof form.img === "string" && (form.img.startsWith("data:") || form.img.startsWith("http"))
                ? form.img
                : `${imgUrl}${form.img}`
          } 
          alt="" 
          className="h-40 w-full rounded-lg border border-border object-cover" 
        />
      ) : null}
        <SwitchField label={t("field.isArchived")} checked={form.is_archived} onChange={(v) => set({ is_archived: v })} />
      </FormDialog>
    </>
  );
}
