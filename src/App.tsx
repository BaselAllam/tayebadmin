import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./lib/i18n";
import ScrollToTop from "@/components/ScrollToTop";
import DashboardPage from "./routes/index";
import { AdminShell } from "./components/admin/AdminShell";
import NotFoundComponent from "./routes/NotFound";
import UsersPage from "./routes/users";
import SiteCoresPage from "./routes/site-cores";
import PackagesPage from "./routes/packages";
import PackageTypesPage from "./routes/packagestypes";
import BookingsPage from "./routes/packages.bookings";
import ProfilePage from "./routes/profile";
import { DataProvider } from "./lib/data-store";
import GuestRoute from "./contexts/GuestRoute";
import LoginPage from "./routes/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { SimpleToastProvider } from "./components/ui/toaster";
import ActivitiesPage from "./routes/activities";
import CmsPage from "./routes/cms";
import { HighlightsPageTemplates } from "./routes/PackageHighlightsTemplates";
import { BenefitsTemplatesPage } from "./routes/PackageBenefitsTemplates";
import { ItineraryTemplatesPage } from "./routes/PackageItineraryTemplates";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <I18nProvider>
        <BrowserRouter>
          <ScrollToTop />
          <SimpleToastProvider>
          <Sonner />
          <DataProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route element={<AdminShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/site-cores" element={<SiteCoresPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/packages/types" element={<PackageTypesPage />} />
                <Route path="/packages/bookings" element={<BookingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/cms" element={<CmsPage />} />
                <Route path="/packages/highlights" element={<HighlightsPageTemplates />} />
                <Route path="/packages/benefits" element={<BenefitsTemplatesPage />} />
                <Route path="/packages/itineraries" element={<ItineraryTemplatesPage />} />
              </Route>
              <Route path="*" element={<NotFoundComponent />} />
            </Routes>
          </DataProvider>
          </SimpleToastProvider>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;