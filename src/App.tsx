import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import { AuthGuard } from "@/components/AuthGuard";
import { OnboardingGate } from "@/components/OnboardingGate";
import { AppLayout } from "@/components/AppLayout";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import FollowUpPage from "./pages/FollowUpPage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

function LayoutPage({ children }: { children: React.ReactNode }) {
  return <AuthGuard><OnboardingGate><AppLayout>{children}</AppLayout></OnboardingGate></AuthGuard>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthGuard><OnboardingGate><Index /></OnboardingGate></AuthGuard>} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />
              <Route path="/workout" element={<LayoutPage><WorkoutPage /></LayoutPage>} />
              <Route path="/nutrition" element={<LayoutPage><NutritionPage /></LayoutPage>} />
              <Route path="/followup" element={<LayoutPage><FollowUpPage /></LayoutPage>} />
              <Route path="/progress" element={<LayoutPage><ProgressPage /></LayoutPage>} />
              <Route path="/profile" element={<LayoutPage><ProfilePage /></LayoutPage>} />
              <Route path="/subscription" element={<LayoutPage><SubscriptionPage /></LayoutPage>} />
              <Route path="/settings" element={<LayoutPage><SettingsPage /></LayoutPage>} />
              <Route path="*" element={<AuthGuard><NotFound /></AuthGuard>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppDataProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
