import { NavLink, Link, useLocation, Outlet, matchPath } from "react-router-dom";
import { ChevronDown, Compass, LayoutDashboard, Layers, Languages, Menu, Package, Ticket, UserRound, Users, ActivityIcon, Layers2, LayoutTemplate } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n, type TKey } from "@/lib/i18n";
import { useGetUserData } from "@/hooks/useSiteData";
import LoadingSpinner from "../LoadingSpinner";
import ErrorMessage from "../ErrorMsg";
import NotGuestRoute from "@/contexts/NotGuestRoute";
import { Guard, modulesKeys } from "@/contexts/PermGurad";

type NavLeaf = { to: string; labelKey: TKey; icon: ReactNode; moduleName: string };

const mainNav: NavLeaf[] = [
  { to: "/", labelKey: "nav.dashboard", icon: <LayoutDashboard className="size-4" />, moduleName: modulesKeys.Dashboard },
  { to: "/users", labelKey: "nav.users", icon: <Users className="size-4" />, moduleName: modulesKeys.Users },
  { to: "/site-cores", labelKey: "nav.siteCores", icon: <Layers className="size-4" />, moduleName: modulesKeys.SiteCore },
  { to: "/activities", labelKey: "nav.activities", icon: <ActivityIcon className="size-4" />, moduleName: modulesKeys.Activities },
  { to: "/cms", labelKey: "nav.cms", icon: <Layers2 className="size-4" />, moduleName: modulesKeys.CMS },
];

const packagesNav: NavLeaf[] = [
  { to: "/packages", labelKey: "nav.packagesList", icon: <Package className="size-4" />, moduleName: modulesKeys.Packages },
  { to: "/packages/types", labelKey: "nav.packageTypes", icon: <Compass className="size-4" />, moduleName: modulesKeys.Packages },
  { to: "/packages/bookings", labelKey: "nav.bookings", icon: <Ticket className="size-4" />, moduleName: modulesKeys.Packages },
  { to: "/packages/benefits", labelKey: "nav.benefits", icon: <LayoutTemplate className="size-4" />, moduleName: modulesKeys.Packages },
  { to: "/packages/itineraries", labelKey: "nav.itineraries", icon: <LayoutTemplate className="size-4" />, moduleName: modulesKeys.Packages },
  { to: "/packages/highlights", labelKey: "nav.highlights", icon: <LayoutTemplate className="size-4" />, moduleName: modulesKeys.Packages },
];

const profileNav: NavLeaf = {
  to: "/profile",
  labelKey: "nav.profile",
  icon: <UserRound className="size-4" />,
  moduleName: modulesKeys.Users
};

const allRoutesConfig = [...mainNav, ...packagesNav, profileNav];

function NavItem({ item, onNavigate }: { item: NavLeaf; onNavigate?: (() => void) | undefined }) {
  const { t } = useI18n();
  const isExact = item.to === "/" || item.to === "/packages";

  return (
    <NavLink
      to={item.to}
      end={isExact}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`
      }
    >
      {item.icon}
      <span className="truncate">{t(item.labelKey)}</span>
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { t } = useI18n();
  const location = useLocation();
  const pathname = location.pathname;
  const [packagesOpen, setPackagesOpen] = useState(pathname.startsWith("/packages"));

  useEffect(() => {
    if (pathname.startsWith("/packages")) setPackagesOpen(true);
  }, [pathname]);

  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <div className="flex items-center gap-3 px-1">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Compass className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold">{t("app.name")}</p>
          <p className="truncate text-xs text-sidebar-foreground/70">{t("app.subtitle")}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {mainNav.map((item) => (
          <Guard key={item.to} module={item.moduleName}>
            <NavItem item={item} onNavigate={onNavigate} />
          </Guard>
        ))}

        <button
          type="button"
          onClick={() => setPackagesOpen((v) => !v)}
          aria-expanded={packagesOpen}
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Package className="size-4" />
          <span className="flex-1 text-start">{t("nav.packages")}</span>
          <ChevronDown
            className={`size-4 transition-transform ${packagesOpen ? "rotate-180" : ""}`}
          />
        </button>
        {packagesOpen ? (
          <div className="ms-4 flex flex-col gap-1 border-s border-sidebar-border ps-2">
            {packagesNav.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ) : null}

        <div className="mt-2">
          <NavItem item={profileNav} onNavigate={onNavigate} />
        </div>
      </nav>
    </div>
  );
}

export function AdminShell({ }: { }) {
  const { t, lang, toggleLang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user, isLoading: isGetUserLoading, error: isGetUserError } = useGetUserData();
  
  const location = useLocation();
  const currentRoute = allRoutesConfig.find((item) =>
    matchPath({ path: item.to, end: item.to === "/" || item.to === "/packages" }, location.pathname)
  );

  const activeModule = currentRoute?.moduleName ?? "";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side={lang === "ar" ? "right" : "left"} className="w-72 border-0 p-0">
              <SheetTitle className="sr-only">{t("app.subtitle")}</SheetTitle>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <p className="truncate font-display text-sm font-semibold sm:text-base">
            {t("app.name")} · {t("app.subtitle")}
          </p>

          <div className="ms-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleLang} className="gap-2">
              <Languages className="size-4" />
              {lang === "en" ? "العربية" : "English"}
            </Button>
            {isGetUserLoading ? (
              <LoadingSpinner />
            ) : isGetUserError ? (
              <ErrorMessage />
            ) : (
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-border bg-muted/50 py-1 pe-3 ps-1 transition-colors hover:bg-muted"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {user ? user?.first_name.charAt(0) : "?"}
                </span>
                <span className="hidden max-w-[10rem] truncate text-sm sm:inline">
                  {`${user?.first_name} ${user?.last_name}`}
                </span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <NotGuestRoute module={activeModule}>
              <Outlet />
            </NotGuestRoute>
          </div>
        </main>
      </div>
    </div>
  );
}