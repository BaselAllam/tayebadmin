import { Plus } from "lucide-react";
import { useState } from "react";
import { ArchivedPill, DataTable, FormDialog, PageHeader, SelectField, StatusPill, SwitchField, TextAreaField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ContactRequest, type ContactStatus, type Faq } from "@/lib/data-store";
import { useI18n } from "@/lib/i18n";
import { useGetContactUs, useGetFaqs } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { createFaqs, updateContactUs, updateFaqs } from "@/services/CoreServices";

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
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <ContactTab />
        </TabsContent>
        <TabsContent value="faqs" className="space-y-4">
          <FaqTab />
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