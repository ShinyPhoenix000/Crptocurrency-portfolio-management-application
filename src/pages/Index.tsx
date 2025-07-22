import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, Star, Filter, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CryptoCard } from '@/components/CryptoCard';
import { LoadingSpinner, LoadingGrid } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cryptoApi } from '@/services/cryptoApi';
import { CryptoCurrency } from '@/types/crypto';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CurrencySelector } from '@/components/CurrencySelector';
import { PortfolioForm } from '@/components/Portfolio/PortfolioForm';
import { PortfolioList } from '@/components/Portfolio/PortfolioList';
import { CoinChart } from '@/components/Chart/CoinChart';
import { Input } from '@/components/ui/input';
import AuthForm from '@/components/Auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';

const CHART_COINS = [
  { id: 'bitcoin', name: 'Bitcoin' },
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'solana', name: 'Solana' },
  { id: 'dogecoin', name: 'Dogecoin' },
  { id: 'cardano', name: 'Cardano' },
];

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: walletLoading } = useWallet();
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<CryptoCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites } = useFavorites();
  const { toast } = useToast();
  const [selectedCharts, setSelectedCharts] = useState(['bitcoin', 'ethereum']);

  const fetchCryptos = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await cryptoApi.getTopCryptos(1, 100);
      setCryptos(data);
      setFilteredCryptos(data);
      setLastUpdated(new Date());
      
      if (showRefreshIndicator) {
        toast({
          title: "Data refreshed",
          description: "Crypto prices have been updated successfully.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch crypto data';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchCryptos();
  }, [fetchCryptos]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCryptos(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCryptos]);

  // Filter logic combining search and favorites
  const applyFilters = useCallback(() => {
    let filtered = cryptos;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(crypto =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(crypto => favorites.has(crypto.id));
    }

    setFilteredCryptos(filtered);
  }, [cryptos, searchQuery, showFavoritesOnly, favorites]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const toggleFavoritesFilter = useCallback(() => {
    setShowFavoritesOnly(prev => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchCryptos(true);
  }, [fetchCryptos]);

  const favoritesCount = favorites.size;

  const handleChartSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedCharts(options.slice(0, 3)); // max 3 charts
  };

  // Trending coins for charts (top 3 by market cap)
  const trendingCharts = cryptos.slice(0, 3);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Top Cryptocurrencies</h2>
            <p className="text-muted-foreground">Loading the latest crypto market data...</p>
          </div>
          <LoadingGrid />
        </main>
      </div>
    );
  }

  if (error && cryptos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button onClick={() => fetchCryptos()} className="animate-pulse-glow">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header refreshing={refreshing} onRefresh={handleRefresh} />
      <main className="container mx-auto px-4 py-8">
        {/* Portfolio Section */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Your Portfolio</h2>
          <div className="flex flex-col md:flex-row md:items-end md:gap-8 mb-4">
            <CurrencySelector />
            <PortfolioForm />
          </div>
          <PortfolioList />
        </section>

        {/* Trending Coin Charts Section */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">Trending Coin Charts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingCharts.map(coin => (
              <div key={coin.id}>
                <CoinChart coinId={coin.id} coinName={coin.name} />
              </div>
            ))}
          </div>
        </section>

        {/* Existing Crypto List Section */}
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Top Cryptocurrencies
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Real-time crypto market data and prices
          </p>
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search by name or symbol (e.g., Bitcoin, BTC)..."
            />
          </div>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={toggleFavoritesFilter}
              className="transition-all duration-300 hover:scale-105"
            >
              <Star className={cn("mr-2 h-3 w-3", showFavoritesOnly && "fill-current")} />
              {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
              {favoritesCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {favoritesCount}
                </Badge>
              )}
            </Button>
            {(searchQuery || showFavoritesOnly) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                }}
                className="transition-all duration-300"
              >
                <X className="mr-2 h-3 w-3" />
                Clear Filters
              </Button>
            )}
          </div>
          {/* Restored: Top 100 Crypto Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {filteredCryptos.map(crypto => (
              <CryptoCard key={crypto.id} crypto={crypto} />
            ))}
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            {lastUpdated && (
              <span>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={cn(
                "mr-2 h-4 w-4 transition-transform",
                refreshing && "animate-spin"
              )} />
              Refresh
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;