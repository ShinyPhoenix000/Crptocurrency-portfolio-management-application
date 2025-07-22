import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Globe, ExternalLink, Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { PriceChart } from '@/components/PriceChart';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cryptoApi } from '@/services/cryptoApi';
import { CoinDetail, MarketData } from '@/types/crypto';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CoinDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  
  const [coinDetail, setCoinDetail] = useState<CoinDetail | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30'>('7');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoinData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [detailData, chartData] = await Promise.all([
          cryptoApi.getCoinDetail(id),
          cryptoApi.getMarketChart(id, parseInt(chartPeriod))
        ]);
        
        setCoinDetail(detailData);
        setMarketData(chartData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch coin data';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [id, chartPeriod, toast]);

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !coinDetail) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Markets
          </Button>
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Cryptocurrency not found'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const isPositive = coinDetail.price_change_percentage_24h > 0;
  const isNegative = coinDetail.price_change_percentage_24h < 0;
  const isFav = id ? isFavorite(id) : false;
  const chartColor = isPositive ? "hsl(var(--crypto-gain))" : 
                    isNegative ? "hsl(var(--crypto-loss))" : 
                    "hsl(var(--primary))";

  const handleFavoriteClick = () => {
    if (id) {
      toggleFavorite(id);
      toast({
        title: isFav ? "Removed from favorites" : "Added to favorites",
        description: `${coinDetail.name} has been ${isFav ? 'removed from' : 'added to'} your favorites.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </Button>

        <div className="animate-fade-in space-y-6">
          {/* Header Section */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={coinDetail.image} 
                    alt={coinDetail.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h1 className="text-3xl font-bold">{coinDetail.name}</h1>
                    <p className="text-muted-foreground text-lg uppercase">
                      {coinDetail.symbol} • Rank #{coinDetail.market_cap_rank}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavoriteClick}
                    className={cn(
                      "transition-all duration-300",
                      isFav ? "text-warning border-warning hover:bg-warning/10" : ""
                    )}
                  >
                    <Star className={cn("mr-2 h-4 w-4", isFav && "fill-current")} />
                    {isFav ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                  
                  {coinDetail.links?.homepage[0] && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={coinDetail.links.homepage[0]} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Website
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-3xl font-bold">{formatPrice(coinDetail.current_price)}</p>
                  <div className={cn(
                    "flex items-center space-x-1 text-sm font-medium",
                    isPositive && "text-crypto-gain",
                    isNegative && "text-crypto-loss",
                    !isPositive && !isNegative && "text-crypto-neutral"
                  )}>
                    {isPositive && <TrendingUp className="w-4 h-4" />}
                    {isNegative && <TrendingDown className="w-4 h-4" />}
                    <span>
                      {isPositive ? '+' : ''}{coinDetail.price_change_percentage_24h.toFixed(2)}% (24h)
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-xl font-semibold">{formatMarketCap(coinDetail.market_cap)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-xl font-semibold">{formatMarketCap(coinDetail.total_volume)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">24h High / Low</p>
                    <p className="text-lg font-medium">
                      {formatPrice(coinDetail.high_24h)} / {formatPrice(coinDetail.low_24h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">All-Time High</p>
                    <p className="text-lg font-medium">{formatPrice(coinDetail.ath)}</p>
                    <p className="text-sm text-crypto-loss">
                      {coinDetail.ath_change_percentage.toFixed(2)}% from ATH
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Price Chart</CardTitle>
                <Tabs value={chartPeriod} onValueChange={(value) => setChartPeriod(value as '7' | '30')}>
                  <TabsList>
                    <TabsTrigger value="7">7 Days</TabsTrigger>
                    <TabsTrigger value="30">30 Days</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {marketData ? (
                <PriceChart 
                  data={marketData.prices} 
                  color={chartColor}
                  height={400}
                />
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Circulating Supply</span>
                  <span className="font-medium">
                    {coinDetail.circulating_supply?.toLocaleString()} {coinDetail.symbol.toUpperCase()}
                  </span>
                </div>
                {coinDetail.total_supply && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supply</span>
                    <span className="font-medium">
                      {coinDetail.total_supply.toLocaleString()} {coinDetail.symbol.toUpperCase()}
                    </span>
                  </div>
                )}
                {coinDetail.max_supply && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Supply</span>
                    <span className="font-medium">
                      {coinDetail.max_supply.toLocaleString()} {coinDetail.symbol.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All-Time Low</span>
                  <span className="font-medium">{formatPrice(coinDetail.atl)}</span>
                </div>
              </CardContent>
            </Card>

            {coinDetail.description?.en && (
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>About {coinDetail.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {coinDetail.description.en.split('.')[0]}.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoinDetailPage;