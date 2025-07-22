import React, { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';

interface CoinPriceMap {
  [coinId: string]: number;
}

interface PnLPoint {
  date: string;
  realized: number;
  unrealized: number;
}

export const WalletPnLChart: React.FC = () => {
  const { wallet } = useWallet();
  const { currency } = useCurrency();
  const [prices, setPrices] = useState<CoinPriceMap>({});

  // Get all unique dates from wallet (buy/sell)
  const allDates = useMemo(() => {
    const dates = new Set<string>();
    wallet.forEach(e => {
      if (e.buyDate) dates.add(e.buyDate);
      if (e.sellDate) dates.add(e.sellDate);
    });
    return Array.from(dates).sort();
  }, [wallet]);

  // Fetch latest prices for all coins (for unrealized P&L)
  useEffect(() => {
    if (wallet.length === 0) return;
    const ids = Array.from(new Set(wallet.map(e => e.coinId))).join(',');
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`)
      .then(res => res.json())
      .then(data => {
        const priceMap: CoinPriceMap = {};
        for (const entry of wallet) {
          priceMap[entry.coinId] = data[entry.coinId]?.[currency] || 0;
        }
        setPrices(priceMap);
      });
  }, [wallet, currency]);

  // Calculate P&L over time
  const chartData: PnLPoint[] = useMemo(() => {
    let realized = 0;
    let unrealized = 0;
    const holdings: { [coinId: string]: { qty: number; avg: number } } = {};
    const points: PnLPoint[] = [];
    const sortedDates = allDates;
    sortedDates.forEach(date => {
      // For each date, process all wallet entries on that date
      wallet.forEach(entry => {
        if (entry.buyDate === date) {
          // Add to holdings
          if (!holdings[entry.coinId]) holdings[entry.coinId] = { qty: 0, avg: 0 };
          const h = holdings[entry.coinId];
          // Weighted average
          const totalCost = h.avg * h.qty + entry.buyPrice * entry.quantity;
          h.qty += entry.quantity;
          h.avg = h.qty ? totalCost / h.qty : 0;
        }
        if (entry.sellDate === date && entry.sellPrice) {
          // Realized P&L
          if (!holdings[entry.coinId]) holdings[entry.coinId] = { qty: 0, avg: 0 };
          const h = holdings[entry.coinId];
          realized += (entry.sellPrice - h.avg) * entry.quantity;
          h.qty -= entry.quantity;
          if (h.qty < 0) h.qty = 0;
        }
      });
      // Unrealized P&L: sum for all holdings at this date (using latest price)
      unrealized = Object.entries(holdings).reduce((acc, [coinId, h]) => {
        const price = prices[coinId] || 0;
        return acc + (price - h.avg) * h.qty;
      }, 0);
      points.push({
        date: format(new Date(date), 'MMM d, yyyy'),
        realized: Math.round(realized * 100) / 100,
        unrealized: Math.round(unrealized * 100) / 100,
      });
    });
    return points;
  }, [wallet, allDates, prices]);

  if (chartData.length === 0) return null;

  return (
    <Card className="w-full animate-fade-in mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Wallet P&L Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" minTickGap={30} />
            <YAxis tickFormatter={v => v.toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase() })} width={80} />
            <Tooltip formatter={(v: number, name: string) => [v.toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase() }), name]} />
            <Legend />
            <Line type="monotone" dataKey="realized" stroke="#22c55e" name="Realized P&L" dot={false} />
            <Line type="monotone" dataKey="unrealized" stroke="#6366f1" name="Unrealized P&L" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-muted-foreground mt-2">Shows cumulative realized and unrealized profit/loss for your wallet over time.</div>
      </CardContent>
    </Card>
  );
}; 