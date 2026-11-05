import { MapPin, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, FormDialog, PageHeader, SelectField, StatusPill, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Gender, type Role, type UserStatus } from "@/lib/data-store";
import { useI18n } from "@/lib/i18n";
import { useGetAllUsers } from "@/hooks/useSiteData";
import { useAuth, UserProfileModel } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { createUser, updateUsersData } from "@/services/UsersServices";
import { useSimpleToast } from "@/components/ui/toaster";
import PhoneInput from "@/components/PhoneInput";
import { Label } from "@/components/ui/label";
import UserAddressesDialog from "./Useraddressesdialog";

const emptyUser = {
  phone: "",
  first_name: "",
  last_name: "",
  gender: "",
  user_status: "",
};

const statusTone: Record<UserStatus, string> = {
  active: "success",
  inactive: "neutral",
  blocked: "danger",
};

export default function UsersPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyUser);
  const {data: users, isLoading: isUsersLoading, error: isUsersError, refetch} = useGetAllUsers();
  const { success, error } = useSimpleToast();
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);
  const [addressesUserId, setAddressesUserId] = useState<string | null>(null);
  const addressesUser = users?.find((u) => u.id === addressesUserId);

  const set = (patch: Partial<typeof emptyUser>) => setForm((f) => ({ ...f, ...patch }));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users?.filter((u) =>
      `${u.first_name} ${u.last_name} ${u.phone}`.toLowerCase().includes(q),
    );
  }, [users, query]);

  const handleSubmit = async () => {
    setIsCreateUpdateLoading(true);

    try {
      const res = await createUser(form);
      if (res.status === 201) {
        await refetch();
        setForm({
          phone: "",
          first_name: "",
          last_name: "",
          gender: "",
          user_status: "",
        });
        setOpen(false);
        success(t("common.saved"))
      }
    } catch (e) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(', ') : e.message || t('someThingWentWrong');
      error(message);
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleSave = async () => {
    setIsCreateUpdateLoading(true);
  
    const formData = new FormData();
    const user = users.find((x) => x.id === editingId);
    formData.append('id', editingId);
    if (form.first_name !== user.first_name) formData.append('first_name', form.first_name);
    if (form.last_name !== user.last_name) formData.append('last_name', form.last_name);
    if (form.phone !== user.phone) formData.append('phone', form.phone);
    if (form.gender !== user.gender) formData.append('gender', form.gender);
    if (form.user_status !== user.user_status) formData.append('user_status', form.user_status);

    try {
      const res = await updateUsersData(formData as any);
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

  const submit = () => {
    if (editingId) handleSave();
    else handleSubmit();
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyUser);
    setOpen(true);
  };

  const openEdit = (u: UserProfileModel) => {
    setEditingId(u.id);
    setForm({
      phone: u.phone,
      first_name: u.first_name,
      last_name: u.last_name,
      gender: u.gender,
      user_status: u.user_status,
    });
    setOpen(true);
  };

  const columns: Column<UserProfileModel>[] = [
    {
      key: "name",
      header: `${t("field.firstName")} / ${t("field.lastName")}`,
      cell: (u) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {u?.first_name.charAt(0)}
            {u?.last_name.charAt(0)}
          </span>
          <span className="font-medium">
            {u?.first_name} {u?.last_name}
          </span>
        </div>
      ),
    },
    { key: "phone", header: t("field.phone"), cell: (u) => u.phone },
    { key: "gender", header: t("field.gender"), cell: (u) => u?.gender },
    {
      key: "addresses",
      header: t("address.title"),
      cell: (u) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => setAddressesUserId(u.id)}
        >
          <MapPin className="size-3.5" />
          {u.user_addresses?.length ?? 0}
        </Button>
      ),
    },
    {
      key: "status",
      header: t("field.userStatus"),
      cell: (u) => <StatusPill label={u?.user_status} tone={statusTone[u.user_status]} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        action={
          <Button onClick={openCreate} disabled={isCreateUpdateLoading} className="gap-2">
            <Plus className="size-4" />
            {isCreateUpdateLoading ? t('loading') : t("users.create")}
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-2.5 size-4 text-muted-foreground start-3" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("action.search")}
          className="ps-9"
        />
      </div>
      
      {isUsersLoading ? <LoadingSpinner/> : isUsersError ? <ErrorMessage/> :
      <DataTable
        columns={columns}
        rows={rows}
        onEdit={openEdit}
      />
      }

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        title={editingId ? t("users.edit") : t("users.create")}
        onSubmit={submit}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t("field.firstName")} value={form.first_name} onChange={(v) => set({ first_name: v })} />
          <TextField label={t("field.lastName")} value={form.last_name} onChange={(v) => set({ last_name: v })} />
          <div className="space-y-1.5">
          <Label htmlFor="login-email">
              {t('login.phone')}
          </Label>
          <PhoneInput
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
            placeholder={'+1 (555) 123-4567'}
            required
            showFlag={true}
          />
          </div>
          <SelectField
            label={t("field.gender")}
            value={form.gender}
            onChange={(v) => set({ gender: v as Gender })}
            options={[
              { value: "male", label: t("gender.male") },
              { value: "female", label: t("gender.female") },
            ]}
          />
          <SelectField
            label={t("field.userStatus")}
            value={form.user_status}
            onChange={(v) => set({ user_status: v as UserStatus })}
            options={[
              { value: "active", label: t("status.active") },
              { value: "inactive", label: t("status.inactive") },
              { value: "blocked", label: t("status.blocked") },
            ]}
          />
        </div>
      </FormDialog>
      <UserAddressesDialog
        user={addressesUser}
        open={!!addressesUserId}
        onOpenChange={(o) => !o && setAddressesUserId(null)}
        onChanged={refetch}
      />
    </>
  );
}
