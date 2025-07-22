import React from 'react';
import { Header } from '@/components/Header';
import { WalletSummary } from '@/components/Wallet/WalletSummary';
import { WalletPnLChart } from '@/components/Wallet/WalletPnLChart';
import { WalletForm } from '@/components/Wallet/WalletForm';
import { WalletTable } from '@/components/Wallet/WalletTable';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import AuthForm from '@/components/Auth/AuthForm';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Wallet = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: walletLoading } = useWallet();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <AuthForm />
      </div>
    );
  }
  if (walletLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/" className="fixed top-4 left-4 z-50 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-primary">
                  <Home className="h-6 w-6 text-primary" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Home</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Wallet Section */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Wallet</h2>
          <WalletSummary />
          <WalletPnLChart />
          <WalletForm />
          <WalletTable />
        </section>
      </main>
    </div>
  );
};

export default Wallet;