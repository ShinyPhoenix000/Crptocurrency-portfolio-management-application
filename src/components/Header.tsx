import React, { useState, useEffect } from 'react';
import { Moon, Sun, TrendingUp, RefreshCw, User, LogOut, Download, Settings, Bell, Cloud, ChevronRight, Wallet, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface HeaderProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

function formatDate(dateStr?: string | number | Date) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export const Header: React.FC<HeaderProps> = ({ refreshing, onRefresh }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { wallet } = useWallet();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ displayName?: string; createdAt?: string; } | null>(null);
  const [alerts, setAlerts] = useState<number>(0); // Placeholder for price alerts

  // Fetch richer profile from Firestore
  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data() as any);
      });
    }
  }, [user]);

  // Calculate wallet stats
  const totalInvestment = wallet.reduce((sum, e) => sum + (e.buyPrice * e.quantity), 0);
  const netPL = wallet.reduce((sum, e) => {
    const buy = e.buyPrice;
    const sell = e.sellPrice;
    const qty = e.quantity;
    if (e.sellDate && sell) return sum + (sell - buy) * qty;
    // For unsold, use buy price (could use current price if available)
    return sum;
  }, 0);

  // CSV download
  const downloadCSV = () => {
    const rows = [
      ['Coin', 'Symbol', 'Quantity', 'Buy Price', 'Buy Date', 'Sell Price', 'Sell Date'],
      ...wallet.map(e => [e.coinName, e.symbol, e.quantity, e.buyPrice, e.buyDate, e.sellPrice || '', e.sellDate || ''])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fintrack-wallet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email[0]?.toUpperCase() || '?';
    return '?';
  };

  return (
    <header className="border-b bg-gradient-card backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FinTrack
              </h1>
              <p className="text-sm text-muted-foreground">Crypto Price Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <Link to="/trends">
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Trends
              </Button>
            </Link>

            <Link to="/charts" className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 flex items-center gap-1">
                <BarChart2 className="h-4 w-4" /> Charts
              </Button>
            </Link>
            {/* Wallet Section */}
            <Link to="/wallet" className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 flex items-center gap-1">
                <Wallet className="h-4 w-4" /> Wallet
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh"
              onClick={onRefresh}
              className="transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="transition-all duration-300 hover:scale-105"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            {/* Profile dropdown */}
            {user && (
              <div className="relative">
                <button
                  className="ml-2 flex items-center justify-center w-9 h-9 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setOpen(v => !v)}
                  aria-label="User menu"
                  type="button"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary flex items-center justify-center w-8 h-8">
                      {getInitials(profile?.displayName || user.displayName, user.email || undefined)}
                    </span>
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 animate-fade-in transition-opacity duration-200">
                    <div className="p-4 border-b border-border flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg truncate">{profile?.displayName || user.displayName || user.email}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">Joined on {formatDate(profile?.createdAt || user.metadata?.creationTime)}</div>
                        <div className="text-xs text-muted-foreground">Last login: {formatDate(user.metadata?.lastSignInTime)}</div>
                      </div>
                    </div>
                    <div className="p-4 border-b border-border grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Investment</div>
                        <div className="font-semibold">${totalInvestment.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Net P&L</div>
                        <div className={`font-semibold ${netPL >= 0 ? 'text-green-600' : 'text-red-500'}`}>{netPL >= 0 ? '+' : ''}${netPL.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="p-2 border-b border-border flex flex-col gap-1">
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted text-sm"
                        onClick={downloadCSV}
                      >
                        <Download className="w-4 h-4" /> Download Wallet CSV
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted text-sm"
                        onClick={toggleTheme}
                      >
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} Toggle Theme
                      </button>
                      <Link to="/preferences" className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted text-sm">
                        <Settings className="w-4 h-4" /> Preferences <ChevronRight className="w-3 h-3 ml-auto" />
                      </Link>
                      <Link to="/alerts" className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted text-sm relative">
                        <Bell className="w-4 h-4" /> Price Alerts
                        {alerts > 0 && <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{alerts}</span>}
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      </Link>
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted text-sm"
                        onClick={() => {/* TODO: implement sync */}}
                      >
                        <Cloud className="w-4 h-4" /> Sync Now
                      </button>
                      <Link to="/reset-password" className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted text-sm">
                        <Settings className="w-4 h-4" /> Reset Password <ChevronRight className="w-3 h-3 ml-auto" />
                      </Link>
                    </div>
                    <div className="p-2">
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted text-sm text-destructive"
                        onClick={async () => { setOpen(false); await logout(); }}
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};