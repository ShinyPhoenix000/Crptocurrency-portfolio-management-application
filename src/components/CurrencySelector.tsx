import React from 'react';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { toast } from './ui/use-toast';

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'usd', label: 'USD ($)' },
  { code: 'eur', label: 'EUR (€)' },
  { code: 'inr', label: 'INR (₹)' },
  { code: 'jpy', label: 'JPY (¥)' },
  { code: 'gbp', label: 'GBP (£)' },
  { code: 'aud', label: 'AUD (A$)' },
  { code: 'cad', label: 'CAD (C$)' },
  { code: 'sgd', label: 'SGD (S$)' },
  { code: 'zar', label: 'ZAR (R)' },
];

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as Currency);
    toast({ title: `Currency set to ${e.target.value.toUpperCase()}` });
  };

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-medium">Currency</label>
      <select
        value={currency}
        onChange={handleChange}
        className="input px-3 py-2 rounded-md border border-input bg-background w-40"
      >
        {CURRENCIES.map(cur => (
          <option key={cur.code} value={cur.code}>{cur.label}</option>
        ))}
      </select>
    </div>
  );
}; 