import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AppLayout } from "@/components/AppLayout";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import FollowUpPage from "./pages/FollowUpPage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";

const queryClient = new QueryClient();

function LayoutPage({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/workout" element={<LayoutPage><WorkoutPage /></LayoutPage>} />
          <Route path="/nutrition" element={<LayoutPage><NutritionPage /></LayoutPage>} />
          <Route path="/followup" element={<LayoutPage><FollowUpPage /></LayoutPage>} />
          <Route path="/progress" element={<LayoutPage><ProgressPage /></LayoutPage>} />
          <Route path="/profile" element={<LayoutPage><ProfilePage /></LayoutPage>} />
          <Route path="/subscription" element={<LayoutPage><SubscriptionPage /></LayoutPage>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
