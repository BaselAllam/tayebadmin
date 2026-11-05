import { useRef, type ReactNode } from "react";
import { Image as ImageIcon, Pencil, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

/* ------------------------------------------------------------ page header */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------------------------------------- stat card */

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="surface-card flex items-start gap-3 p-4">
      {icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold leading-tight">{value}</p>
        {hint ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- data table */

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string | undefined;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onEdit,
}: {
  columns: Column<T>[];
  rows: T[];
  onEdit?: (row: T) => void;
}) {
  const { t } = useI18n();
  const hasActions = Boolean(onEdit);

  if (rows.length === 0) {
    return (
      <div className="surface-card p-10 text-center text-sm text-muted-foreground">
        {t("common.noData")}
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/60">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {c.header}
                </th>
              ))}
              {hasActions ? (
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("common.actions")}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border/70 hover:bg-muted/40">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
                {hasActions ? (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {onEdit ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={t("action.edit")}
                          onClick={() => onEdit(row)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- form parts */

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <Field label={label} className={className}>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  className,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string | undefined;
  rows?: number;
}) {
  return (
    <Field label={label} className={className}>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function ImageUploadField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string | undefined;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <Field label={label} className={className}>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt={label}
            className="size-16 shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
            <ImageIcon className="size-5" />
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="me-2 size-4" />
            {value ? t("action.replace") : t("action.upload")}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              {t("action.removeImage")}
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </Field>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string | undefined;
}) {
  return (
    <Field label={label} className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
      <Label className="text-sm">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  children,
  wide,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: () => void;
  children: ReactNode;
  wide?: boolean;
  isLoading: boolean;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("action.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? t('loading') : t("action.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ badges */

const tones: Record<string, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/20 text-warning-foreground border-warning/40",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/12 text-primary border-primary/25",
};

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: keyof typeof tones | string;
}) {
  return (
    <Badge variant="outline" className={`font-medium ${tones[tone] ?? tones["neutral"]}`}>
      {label}
    </Badge>
  );
}

export function ArchivedPill({ archived }: { archived: boolean }) {
  const { t } = useI18n();
  return (
    <StatusPill
      label={archived ? t("common.archived") : t("common.active")}
      tone={archived ? "neutral" : "success"}
    />
  );
}

export function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="size-12 rounded-lg border border-border object-cover"
    />
  );
}
