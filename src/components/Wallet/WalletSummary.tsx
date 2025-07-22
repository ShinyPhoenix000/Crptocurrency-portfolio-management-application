import React, { useEffect, useState } from 'react';
import { useWallet, WalletEntry } from '@/contexts/WalletContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ProfitLoss } from '../ui/ProfitLoss';

interface CoinPriceMap {
  [coinId: string]: number;
}

export const WalletSummary: React.FC = () => {
  const { wallet } = useWallet();
  const { currency } = useCurrency();
  const [prices, setPrices] = useState<CoinPriceMap>({});

  useEffect(() => {
    const unsold = wallet.filter(e => !e.sellDate || !e.sellPrice);
    if (unsold.length === 0) return;
    const ids = Array.from(new Set(unsold.map(e => e.coinId))).join(',');
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`)
      .then(res => res.json())
      .then(data => {
        const priceMap: CoinPriceMap = {};
        for (const entry of unsold) {
          priceMap[entry.coinId] = data[entry.coinId]?.[currency] || 0;
        }
        setPrices(priceMap);
      });
  }, [wallet, currency]);

  let totalInvestment = 0;
  let totalRealized = 0;
  let totalUnrealized = 0;

  wallet.forEach(entry => {
    const invested = entry.buyPrice * entry.quantity;
    totalInvestment += invested;
    if (entry.sellDate && entry.sellPrice) {
      const realized = (entry.sellPrice - entry.buyPrice) * entry.quantity;
      totalRealized += realized;
    } else {
      const current = prices[entry.coinId] || 0;
      const unrealized = (current - entry.buyPrice) * entry.quantity;
      totalUnrealized += unrealized;
    }
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6 animate-fade-in">
      <div className="p-4 rounded-lg bg-card shadow text-card-foreground">
        <div className="text-xs text-muted-foreground mb-1">Total Investment</div>
        <div className="text-lg font-bold">
          <AnimatedNumber value={totalInvestment} />
        </div>
      </div>
      <div className="p-4 rounded-lg bg-card shadow text-card-foreground">
        <div className="text-xs text-muted-foreground mb-1">Realized P&L</div>
        <div className="text-lg font-bold">
          <ProfitLoss value={totalRealized} />
        </div>
      </div>
      <div className="p-4 rounded-lg bg-card shadow text-card-foreground">
        <div className="text-xs text-muted-foreground mb-1">Unrealized P&L</div>
        <div className="text-lg font-bold">
          <ProfitLoss value={totalUnrealized} />
        </div>
      </div>
    </div>
  );
}; 