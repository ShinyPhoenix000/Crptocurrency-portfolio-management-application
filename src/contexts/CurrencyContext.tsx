import React, { createContext, useContext, useEffect, useState } from 'react';

export type Currency = 'usd' | 'eur' | 'inr' | 'jpy' | 'gbp' | 'aud' | 'cad' | 'sgd' | 'zar';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const CURRENCY_KEY = 'fintrack_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('usd');

  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_KEY);
    if (stored) setCurrencyState(stored as Currency);
  }, []);

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  const setCurrency = (cur: Currency) => setCurrencyState(cur);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}; 