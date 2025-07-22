import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { CryptoCurrency } from '@/types/crypto';
import { cn } from '@/lib/utils';

interface CryptoCardProps {
  crypto: CryptoCurrency;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ crypto }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isPositive = crypto.price_change_percentage_24h > 0;
  const isNegative = crypto.price_change_percentage_24h < 0;
  const isFav = isFavorite(crypto.id);

  const handleClick = () => {
    navigate(`/coin/${crypto.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking star
    toggleFavorite(crypto.id);
  };

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

  return (
    <Card 
      className={cn(
        "bg-gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in",
        "hover:scale-[1.02] border-border/50 hover:border-primary/30"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={crypto.image} 
              alt={crypto.name}
              className="w-12 h-12 rounded-full"
              loading="lazy"
            />
            <div>
              <h3 className="font-semibold text-lg">{crypto.name}</h3>
              <p className="text-sm text-muted-foreground uppercase">
                {crypto.symbol}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={cn(
                "p-2 h-8 w-8 transition-all duration-300",
                isFav ? "text-warning hover:text-warning/80" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Star className={cn("h-4 w-4", isFav && "fill-current")} />
            </Button>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Rank</p>
              <p className="font-medium">#{crypto.market_cap_rank}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-bold text-lg">{formatPrice(crypto.current_price)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">24h Change</span>
            <div className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium",
              isPositive && "bg-crypto-gain/10 text-crypto-gain",
              isNegative && "bg-crypto-loss/10 text-crypto-loss",
              !isPositive && !isNegative && "bg-muted text-crypto-neutral"
            )}>
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              <span>
                {isPositive ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Market Cap</span>
            <span className="font-medium">{formatMarketCap(crypto.market_cap)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Volume (24h)</span>
            <span className="font-medium">{formatMarketCap(crypto.total_volume)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};