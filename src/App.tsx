import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppProvider } from "@/contexts/AppContext";
import SplashScreen from "./pages/SplashScreen";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnboardingCategory from "./pages/OnboardingCategory";
import OnboardingSetup from "./pages/OnboardingSetup";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Index />} />
          <Route path="/onboarding" element={<OnboardingCategory />} />
          <Route path="/onboarding/setup" element={<OnboardingSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
