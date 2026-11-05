import { Activity as ActivityIcon, Eye, PencilLine } from "lucide-react";
import { useState } from "react";
import { PageHeader, StatCard, StatusPill } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, type TKey } from "@/lib/i18n";
import { useGetAllUsers, useGetUsersActivites } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { UserActivitiesModel } from "@/services/UsersServices";

export type ActivityAction = "View" | "Create" | "Update" | "Delete";

const actions: ActivityAction[] = ["View", "Create", "Update", "Delete"];

const actionTone: Record<ActivityAction, string> = {
  View: "info",
  Create: "success",
  Update: "warning",
  Delete: "danger",
};

export default function ActivitiesPage() {
  const { t, lang } = useI18n();
  const {data: users, isLoading: isUsersLoading, error: isUsersError} = useGetAllUsers();
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const {data: activities, isLoading: isActivitiesLoading, error: isActivitiesError} = useGetUsersActivites(userId, action);

  const actionLabel = (a: ActivityAction) => t(`act.action.${a}` as TKey);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    total: activities?.length,
    today: activities?.filter((a) => a.made_at.slice(0, 10) === today).length,
    views: activities?.filter((a) => a.action === "view").length,
    changes: activities?.filter((a) => ["Create", "Update", "Delete"].includes(a.action)).length,
  };

  const resetFilters = () => {
    setUserId("");
    setAction("");
  };

  if (isActivitiesLoading) return <LoadingSpinner/>;
  if (isActivitiesError) return <ErrorMessage/>;

  return (
    <div className="space-y-6">
      <PageHeader title={t("act.title")} subtitle={t("act.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("act.stat.total")}
          value={stats.total}
          icon={<ActivityIcon className="size-5" />}
        />
        <StatCard
          label={t("act.stat.today")}
          value={stats.today}
          icon={<ActivityIcon className="size-5" />}
        />
        <StatCard label={t("act.stat.views")} value={stats.views} icon={<Eye className="size-5" />} />
        <StatCard
          label={t("act.stat.changes")}
          value={stats.changes}
          icon={<PencilLine className="size-5" />}
        />
      </div>

      <div className="surface-card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">

        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("act.filter.user")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {t("act.filter.user")}: {t("common.all")}
            </SelectItem>
            {isUsersLoading ? <LoadingSpinner/> : isUsersError ? <ErrorMessage/> : users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {`${u.first_name} ${u.last_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("act.filter.action")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {t("act.filter.action")}: {t("common.all")}
            </SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>
                {actionLabel(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={resetFilters} className="shrink-0">
            {t("act.filter.reset")}
        </Button>
      </div>

      {/* mobile list */}
      <div className="space-y-3 lg:hidden">
        {activities?.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          activities?.map((row) => (
            <article key={row.id} className="surface-card space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{`${row.made_by.first_name} ${row.made_by.last_name}`}</p>
                <StatusPill label={actionLabel(row.action as ActivityAction)} tone={actionTone[row.action]} />
              </div>
              <p className="text-sm text-muted-foreground">{row.details}</p>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">{t("act.col.time")}</dt>
                  <dd>{formatTime(row.made_at)}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

      {/* desktop table */}
      <div className="hidden lg:block">
        {activities?.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    {(
                      [
                        "act.col.user",
                        "act.col.action",
                        "act.col.module",
                        "act.col.details",
                        "act.col.time",
                      ] as TKey[]
                    ).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {t(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activities?.map((row) => (
                    <tr key={row.id} className="border-t border-border/70 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{`${row.made_by.first_name} ${row.made_by.last_name}`}</td>
                      <td className="px-4 py-3">
                        <StatusPill label={actionLabel(row.action as ActivityAction)} tone={actionTone[row.action]} />
                      </td>
                      <td className="max-w-[22rem] px-4 py-3 text-muted-foreground">
                        {row.module}
                      </td>
                      <td className="max-w-[22rem] px-4 py-3 text-muted-foreground">
                        {row.details}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{formatTime(row.made_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}