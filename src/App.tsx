import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { AdminProvider } from "@/contexts/AdminContext";
import ApplicationForm from "./pages/ApplicationForm";
import Apply from "./pages/Apply";
import FindFacilitator from "./pages/FindFacilitator";
import Login from "./pages/Login";
import Index from "./pages/Index";
import RetreatBoard from "./pages/RetreatBoard";
import Templates from "./pages/Templates";
import Archive from "./pages/Archive";
import ContactGroups from "./pages/ContactGroups";
import MessageCenter from "./pages/MessageCenter";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PortalLogin from "./pages/PortalLogin";
import PortalLayout from "./components/portal/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalApplication from "./pages/portal/PortalApplication";
import PortalAccommodation from "./pages/portal/PortalAccommodation";
import PortalCourse from "./pages/portal/PortalCourse";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppProvider>
          <AdminProvider>
            <Toaster />
            <Sonner />
            <ScrollToTop />
            <Routes>
            {/* Public: Application Form is the homepage */}
            <Route path="/" element={<ApplicationForm />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/facilitators" element={<FindFacilitator />} />
            <Route path="/login" element={<Login />} />

            {/* Participant Portal */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalDashboard />} />
              <Route path="application" element={<PortalApplication />} />
              <Route path="accommodation" element={<PortalAccommodation />} />
              <Route path="course" element={<PortalCourse />} />
            </Route>

            {/* Protected: Admin-only routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessageCenter /></ProtectedRoute>} />
            <Route path="/retreat/:id" element={<ProtectedRoute><RetreatBoard /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><ContactGroups /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminProvider>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
