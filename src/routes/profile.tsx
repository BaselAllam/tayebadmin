import { LogOut, Pencil, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { PageHeader, SelectField, StatusPill, TextField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { type Gender } from "@/lib/data-store";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserData } from "@/hooks/useSiteData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { updateUserData } from "@/services/AuthService";
import { useSimpleToast } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data: user, isLoading: isGetUserLoading, error: isGetUserError, refetch } = useGetUserData();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone: user?.phone ?? "",
    gender: (user?.gender ?? "male") as Gender,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { logout } = useAuth();
  const { success, error, warning, info, toast } = useSimpleToast();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
    setShowLogoutDialog(false);
  };

  if (!user) return null;
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {

    const formData = new FormData();
    for (const [key, value] of Object.entries(form)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    }
    setIsSaving(true);
    try {
      const res = await updateUserData(formData as any);
       if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
      }
    } catch (e) {
      const errors = e.response?.data?.data;
      const message = errors ? Object.values(errors).flat().join(', ') : e.message || t('someThingWentWrong');
      error(message);
    } finally {
      setEditing(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
        action={
          !editing ? (
            <Button className="gap-2" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              {t("profile.editData")}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {isGetUserLoading ? <LoadingSpinner/> : isGetUserError ? <ErrorMessage/> : 
        <div className="surface-card p-6 text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {user?.first_name.charAt(0)}
            {user?.last_name.charAt(0)}
          </span>
          <p className="mt-3 text-lg font-semibold">{`${user?.first_name} ${user?.last_name}`}</p>
          <div className="mt-2 flex justify-center gap-2">
            <StatusPill label={user?.user_status} tone="success" />
          </div>
          <div className="mt-5 space-y-2 text-start text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" /> {user?.phone}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="size-4" /> {user?.gender}
            </p>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-start group" onClick={() => setShowLogoutDialog(true)}>
              <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-xs font-bold text-red-500">{t('logout')}</span>
            </button>
          </div>
        </div>
        }

        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">
            {editing ? t("profile.editData") : t("profile.viewData")}
          </h2>

          {editing ? (
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label={t("field.firstName")} value={form.first_name} onChange={(v) => set({ first_name: v })} />
                <TextField label={t("field.lastName")} value={form.last_name} onChange={(v) => set({ last_name: v })} />
                <TextField label={t("field.phone")} value={form.phone} onChange={(v) => set({ phone: v })} />
                <SelectField
                  label={t("field.gender")}
                  value={form.gender}
                  onChange={(v) => set({ gender: v as Gender })}
                  options={[
                    { value: "male", label: t("gender.male") },
                    { value: "female", label: t("gender.female") },
                    { value: "other", label: t("gender.other") },
                  ]}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{t("action.save")}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  {t("action.cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                [t("field.firstName"), user?.first_name],
                [t("field.lastName"), user?.last_name],
                [t("field.phone"), user?.phone],
                [t("field.gender"), user?.gender],
                [t("field.userStatus"), user?.user_status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-muted/50 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('logoutSubTitle')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('logout')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
}
