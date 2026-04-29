import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider } from "@/contexts/AppContext";
import ApplicationForm from "./pages/ApplicationForm";
import Apply from "./pages/Apply";
import FindFacilitator from "./pages/FindFacilitator";
import NotFound from "./pages/NotFound";
import PortalLogin from "./pages/PortalLogin";
import PortalLayout from "./components/portal/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalApplication from "./pages/portal/PortalApplication";
import PortalAccommodation from "./pages/portal/PortalAccommodation";
import PortalCourse from "./pages/portal/PortalCourse";
import PortalEvents from "./pages/portal/PortalEvents";
import PortalFeedback from "./pages/portal/PortalFeedback";
import AuthEmailDebug from "./pages/portal/AuthEmailDebug";
import PublicFeedback from "./pages/PublicFeedback";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function LegacyAdminRedirect() {
  useEffect(() => {
    window.location.assign('https://app.stepwise.education');
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div>
        <p className="mb-4 text-foreground/70">The StepWise admin app has moved.</p>
        <a className="font-medium underline" href="https://app.stepwise.education">
          Continue to app.stepwise.education
        </a>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Routes>
            {/* Public: Application Form is the homepage */}
            <Route path="/" element={<ApplicationForm />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/facilitators" element={<FindFacilitator />} />
            <Route path="/feedback" element={<PublicFeedback />} />
            <Route path="/login" element={<LegacyAdminRedirect />} />

            {/* Participant Portal */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalDashboard />} />
              <Route path="application" element={<PortalApplication />} />
              <Route path="accommodation" element={<PortalAccommodation />} />
              <Route path="course" element={<PortalCourse />} />
              <Route path="events" element={<PortalEvents />} />
              <Route path="feedback" element={<PortalFeedback />} />
              <Route path="auth-debug" element={<AuthEmailDebug />} />
            </Route>

            {/* Legacy admin routes now live at app.stepwise.education */}
            <Route path="/dashboard" element={<LegacyAdminRedirect />} />
            <Route path="/messages" element={<LegacyAdminRedirect />} />
            <Route path="/retreat/:id" element={<LegacyAdminRedirect />} />
            <Route path="/templates" element={<LegacyAdminRedirect />} />
            <Route path="/archive" element={<LegacyAdminRedirect />} />
            <Route path="/contact" element={<LegacyAdminRedirect />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
