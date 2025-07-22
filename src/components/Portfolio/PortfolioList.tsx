import React, { useEffect, useState } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ProfitLoss } from '../ui/ProfitLoss';

interface CoinPrice {
  [coinId: string]: number;
}

export const PortfolioList: React.FC = () => {
  const { portfolio } = usePortfolio();
  const { currency } = useCurrency();
  const [prices, setPrices] = useState<CoinPrice>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portfolio.length === 0) return;
    setLoading(true);
    setError(null);
    const ids = portfolio.map(e => e.coinId).join(',');
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`)
      .then(res => res.json())
      .then(data => {
        const priceMap: CoinPrice = {};
        for (const entry of portfolio) {
          priceMap[entry.coinId] = data[entry.coinId]?.[currency] || 0;
        }
        setPrices(priceMap);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch prices.');
        setLoading(false);
      });
  }, [portfolio, currency]);

  if (portfolio.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No coins in your portfolio yet.</div>;
  }

  return (
    <div className="grid gap-4">
      {portfolio.map(entry => {
        const price = prices[entry.coinId] || 0;
        const value = price * entry.quantity;
        const profitLoss = (price - entry.averageBuyPrice) * entry.quantity;
        return (
          <Card key={entry.coinId} className="flex flex-col md:flex-row items-center justify-between p-4 animate-fade-in">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle className="text-lg">{entry.coinName} <span className="uppercase text-muted-foreground">({entry.symbol})</span></CardTitle>
              <div className="text-sm text-muted-foreground">Qty: {entry.quantity}</div>
              {entry.lastPurchaseDate && <div className="text-xs text-muted-foreground">Last Buy: {entry.lastPurchaseDate}</div>}
              <div className="text-xs text-muted-foreground">Avg Buy @ <AnimatedNumber value={entry.averageBuyPrice} /></div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-base font-semibold">Value: <AnimatedNumber value={value} /></div>
              <div className="text-sm font-medium"><ProfitLoss value={profitLoss} /></div>
            </CardContent>
          </Card>
        );
      })}
      {loading && <div className="text-center text-muted-foreground">Updating prices...</div>}
      {error && <div className="text-center text-destructive">{error}</div>}
    </div>
  );
}; 