import { Eye, EyeOff, Plus, Search } from "lucide-react";
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
import { createUser, setUsersPassword, updateUsersData } from "@/services/UsersServices";
import { useSimpleToast } from "@/components/ui/toaster";
import PhoneInput from "@/components/PhoneInput";
import { Label } from "@/components/ui/label";
import { NATIONALITY_KEYS } from "./profile";

const emptyUser = {
  phone: "",
  first_name: "",
  last_name: "",
  gender: "",
  user_status: "",
  user_role: "",
  nationality: "",
};

const statusTone: Record<UserStatus, string> = {
  active: "success",
  inactive: "neutral",
  blocked: "danger",
};

export default function UsersPage() {
  const { t } = useI18n();
  const {user} = useAuth();
  const [query, setQuery] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyUser);
  const {data: users, isLoading: isUsersLoading, error: isUsersError, refetch} = useGetAllUsers();
  const { success, error } = useSimpleToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);

  const set = (patch: Partial<typeof emptyUser>) => setForm((f) => ({ ...f, ...patch }));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users?.filter((u) =>
      `${u.first_name} ${u.last_name} ${u.phone}`.toLowerCase().includes(q),
    );
  }, [users, query]);

  const changePassword = async () => {
    setIsCreateUpdateLoading(true);

    try {
      const formData = new FormData();
      formData.append('id', editingId);
      formData.append('password', password);
      formData.append('confirm_password', confirmPassword);
      const res = await setUsersPassword(formData);
      if (res.status === 200) {
        await refetch();
        setPassword("");
        setConfirmPassword("");
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
          user_role: "",
          nationality: "",
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
    if (form.user_role !== user.user_role) formData.append('user_role', form.user_role);
    if (form.user_status !== user.user_status) formData.append('user_status', form.user_status);
    if (form.nationality !== user.nationality) formData.append('nationality', form.nationality);

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
      user_role: u.user_role,
      user_status: u.user_status,
      nationality: u.nationality,
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
    { key: "role", header: t("field.role"), cell: (u) => <StatusPill label={u?.user_role} tone="info" /> },
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
          {user.user_role != 'admin' ? null : <SelectField
            label={t("field.role")}
            value={form.user_role}
            onChange={(v) => set({ user_role: v as Role })}
            options={[
              { value: "admin", label: t("role.admin") },
              { value: "staff", label: t("role.staff") },
              { value: "client", label: t("role.client") },
            ]}
          />}
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
          <SelectField
            label={t("field.nationality")}
            value={form.nationality}
            onChange={(v) => set({ nationality: v as typeof NATIONALITY_KEYS[number] })}
            options={NATIONALITY_KEYS.map((key) => ({
              value: key,
              label: t(`${key}`),
            }))}
          />
          {
            form.user_role === 'client' || user.user_role != 'admin' || !editingId ? 
            <div/> :
            <div className="space-y-4 w-full">
              
            <div className="relative w-full">
              <TextField 
                label={t("field.password")}
                value={password}
                onChange={(v) => setPassword(v)}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-10 w-full" 
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative w-full">
              <TextField
                label={t("field.confirm_password")}
                value={confirmPassword}
                onChange={(v) => setConfirmPassword(v)} 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={changePassword} disabled={isCreateUpdateLoading} className="gap-2">
              <Plus className="size-4" />
              {isCreateUpdateLoading ? t('loading') : t("users.updatePassword")}
            </Button>
          </div>
          }
        </div>
      </FormDialog>
    </>
  );
}
