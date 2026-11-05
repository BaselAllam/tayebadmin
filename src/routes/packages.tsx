import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader, StatusPill } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { PackageDetailsForm } from "@/components/Packages/PackageForm";
import { HighlightsSection } from "@/components/Packages/PackageHighlights";
import { ItinerarySection } from "@/components/Packages/PackageItinerary";
import { BenefitsSection } from "@/components/Packages/PackageBenefits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDestinations, useGetPackage, useGetPackageTypes } from "@/hooks/useSiteData";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { PackageModel } from "@/services/PackagesServices";
import { imgUrl } from "@/services/api";
import { DestinationsSection } from "@/components/Packages/PackageDestination";
import { PackagePricingSection } from "@/components/Packages/PackagePricing";

export default function PackagesPage() {
  const { t, lang} = useI18n();
  const isAr = lang === 'ar';
  const { data: packages, isLoading: isPackagesLoading, error: isPackagesError } = useGetPackage();
  const { data: types, isLoading: isTypesLoading, error: isTypesError } = useGetPackageTypes();
  const { data: destinations, isLoading: isDestinationsLoading, error: isDestinationsError } = useGetDestinations();
  const [view, setView] = useState<"list" | "form">("list");
  const [detailsId, setDetailsId] = useState<string | number | null>(null);

  const details = detailsId ? packages?.find((p) => p.id === detailsId) ?? null : null;

  const openCreate = () => {
    setDetailsId(null);
    setView("form");
  };

  const openEdit = (p: PackageModel) => {
    setDetailsId(p.id);
    setView("form");
  };

  if (isPackagesLoading) return <LoadingSpinner/>;
  if (isPackagesError) return <ErrorMessage/>;

  if (view === "list") {
    return (
      <>
        <PageHeader
          title={t("pkg.title")}
          subtitle={t("pkg.subtitle")}
          action={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="size-4" />
              {t("action.newPackage")}
            </Button>
          }
        />

        {packages.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((p) => (
              <article key={p.id} className="surface-card flex flex-col overflow-hidden">
                <img
                  src={`${imgUrl}${p.package_img}`}
                  alt={p.package_title}
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold leading-snug">{p.package_title}</h2>
                    <StatusPill
                      label={p.is_active ? t("common.active") : t("status.inactive")}
                      tone={p.is_active ? "success" : "neutral"}
                    />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {p.package_description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <StatusPill label={isAr ? p.package_type.type_title_de : p.package_type.type_title} tone="neutral" />
                    <StatusPill label={`${String(p.package_duration)} ${t('days')} ${p.package_duration > 0 ? p.package_duration-1 : 0} ${t('nights')}`} tone="neutral" />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                  {p.package_destinations.map((dest) => (
                      <StatusPill label={isAr ? dest.destination.destination_name_de : dest.destination.destination_name} tone="info" />
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="font-display text-lg font-semibold text-primary">
                      {/* {money(p.package_price, p.price_currency)} */}
                    </span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" aria-label={t("action.edit")} onClick={() => openEdit(p)}>
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted/60 py-1">
                      {p.package_highlights.length} · {t("pkg.highlights")}
                    </span>
                    <span className="rounded-md bg-muted/60 py-1">
                      {p.package_itinerary.length} · {t("pkg.itinerary")}
                    </span>
                    <span className="rounded-md bg-muted/60 py-1">
                      {p.package_include.length} · {t("pkg.benefits")}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </>
    );
  }


  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="flex w-full overflow-x-auto justify-start md:grid md:grid-cols-6 md:justify-center">
        <TabsTrigger value="details" className="shrink-0">{t("tab.details")}</TabsTrigger>
        <TabsTrigger value="highlights" disabled={!details} className="shrink-0">
          {t("tab.highlights")}
        </TabsTrigger>
        <TabsTrigger value="itinerary" disabled={!details} className="shrink-0">
          {t("tab.itinerary")}
        </TabsTrigger>
        <TabsTrigger value="benefits" disabled={!details} className="shrink-0">
          {t("tab.benefits")}
        </TabsTrigger>
        <TabsTrigger value="destinations" disabled={!details} className="shrink-0">
          {t("tab.destinations")}
        </TabsTrigger>
        <TabsTrigger value="pricing" disabled={!details} className="shrink-0">
          {t("tab.pricing")}
        </TabsTrigger>
      </TabsList>

        <TabsContent value="details" className="mt-6">
          <PackageDetailsForm
            value={details}
            isEditing={details === null ? false : true}
            destinations={destinations}
            packageTypes={types}
            onBack={() => setView("list")}
          />
        </TabsContent>

        <TabsContent value="highlights" className="mt-6">
          <HighlightsSection
            items={details?.package_highlights ?? []}
            disabled={!details}
            package_id={details?.id}
          />
        </TabsContent>

        <TabsContent value="itinerary" className="mt-6">
          <ItinerarySection
            items={details?.package_itinerary ?? []}
            disabled={!details}
            package_id={details?.id}
          />
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <BenefitsSection
            items={details?.package_include ?? []}
            disabled={!details}
            package_id={details?.id}
          />
        </TabsContent>

        <TabsContent value="destinations" className="mt-6">
          <DestinationsSection
            items={details?.package_destinations ?? []}
            disabled={!details}
            package_id={details?.id}
          />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PackagePricingSection
            items={details?.package_pricing ?? []}
            disabled={!details}
            package_id={details?.id}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => setView("list")}>
          {t("action.back")}
        </Button>
      </div>
    </div>
  )
}