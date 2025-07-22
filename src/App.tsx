import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { AuthProvider } from './contexts/AuthContext';
import Index from "./pages/Index";
import CoinDetail from "./pages/CoinDetail";
import NotFound from "./pages/NotFound";
import ChartsPage from './pages/Charts';
import TrendsPage from './pages/Trends';
import Preferences from './pages/Preferences';
import Alerts from './pages/Alerts';
import Wallet from './pages/Wallet';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FavoritesProvider>
          <WalletProvider>
            <PortfolioProvider>
              <CurrencyProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/charts" element={<ChartsPage />} />
                      <Route path="/trends" element={<TrendsPage />} />
                      <Route path="/preferences" element={<Preferences />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/wallet" element={<Wallet />} />
                      <Route path="/coin/:id" element={<CoinDetail />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CurrencyProvider>
            </PortfolioProvider>
          </WalletProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
