import { NavLink, Link, useLocation, Outlet, matchPath } from "react-router-dom";
import { LayoutDashboard, Layers, Languages, Menu, UserRound, Users, Star, DollarSign } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n, type TKey } from "@/lib/i18n";
import { useGetUserData } from "@/hooks/useSiteData";
import LoadingSpinner from "../LoadingSpinner";
import ErrorMessage from "../ErrorMsg";
import NotGuestRoute from "@/contexts/NotGuestRoute";
import logo from '@/assets/LogoTrans.png';

type NavLeaf = { to: string; labelKey: TKey; icon: ReactNode };

const mainNav: NavLeaf[] = [
  { to: "/", labelKey: "nav.dashboard", icon: <LayoutDashboard className="size-4" /> },
  { to: "/users", labelKey: "nav.users", icon: <Users className="size-4" /> },
  { to: "/site-cores", labelKey: "nav.siteCores", icon: <Layers className="size-4" /> },
  { to: "/reviews", labelKey: "nav.reviews", icon: <Star className="size-4" /> },
  { to: "/expenses", labelKey: "nav.expenses", icon: <DollarSign className="size-4" /> },
  { to: "/suppliers", labelKey: "nav.suppliers", icon: <Layers className="size-4" /> },
];

const profileNav: NavLeaf = {
  to: "/profile",
  labelKey: "nav.profile",
  icon: <UserRound className="size-4" />
};

const allRoutesConfig = [...mainNav, profileNav];

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

  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <div className="flex items-center gap-3 px-1">
        <span className="flex size-10 items-center justify-center rounded-xl text-sidebar-primary-foreground">
          <img src={logo} alt="Logo" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold">{t("app.name")}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {mainNav.map((item) => (
            <NavItem item={item} onNavigate={onNavigate} />
        ))}

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
            <NotGuestRoute >
              <Outlet />
            </NotGuestRoute>
          </div>
        </main>
      </div>
    </div>
  );
}