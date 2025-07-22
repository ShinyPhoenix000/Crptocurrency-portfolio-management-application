import React, { createContext, useContext } from 'react';
import { useWallet } from './WalletContext';

export interface PortfolioEntry {
  coinId: string;
  coinName: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  lastPurchaseDate?: string;
}

interface PortfolioContextType {
  portfolio: PortfolioEntry[];
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet } = useWallet();

  // Aggregate wallet entries by coin
  const portfolioMap = new Map<string, PortfolioEntry & { totalCost: number }>();
  wallet.forEach(entry => {
    const key = entry.coinId;
    const prev = portfolioMap.get(key);
    // For buys, add; for sells, subtract
    const isSell = entry.sellDate && entry.sellPrice;
    const qty = isSell ? -entry.quantity : entry.quantity;
    const cost = isSell ? 0 : entry.buyPrice * entry.quantity;
    if (prev) {
      prev.quantity += qty;
      prev.totalCost += cost;
      if (!isSell && entry.buyDate) prev.lastPurchaseDate = entry.buyDate;
    } else {
      portfolioMap.set(key, {
        coinId: entry.coinId,
        coinName: entry.coinName,
        symbol: entry.symbol,
        quantity: qty,
        averageBuyPrice: cost / (qty || 1),
        lastPurchaseDate: !isSell ? entry.buyDate : undefined,
        totalCost: cost,
      });
    }
  });
  // Calculate average buy price for each coin
  const portfolio: PortfolioEntry[] = Array.from(portfolioMap.values()).map(e => ({
    coinId: e.coinId,
    coinName: e.coinName,
    symbol: e.symbol,
    quantity: e.quantity,
    averageBuyPrice: e.quantity !== 0 ? e.totalCost / e.quantity : 0,
    lastPurchaseDate: e.lastPurchaseDate,
  })).filter(e => e.quantity > 0);

  return (
    <PortfolioContext.Provider value={{ portfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}; 