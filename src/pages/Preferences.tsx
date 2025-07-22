import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const TIME_RANGES = [
  { label: '24h', value: '1' },
  { label: '7d', value: '7' },
  { label: '30d', value: '30' },
  { label: '1y', value: '365' },
];

const DEFAULTS = { currency: 'usd', range: '7' };

const Preferences: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [defaultRange, setDefaultRange] = useState(DEFAULTS.range);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('fintrack-default-range');
    if (stored) setDefaultRange(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('fintrack-default-range', defaultRange);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    setCurrency(DEFAULTS.currency);
    setDefaultRange(DEFAULTS.range);
    localStorage.setItem('fintrack-default-range', DEFAULTS.range);
    setSaved(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-card rounded-lg shadow animate-fade-in">
      <div className="mb-4 flex items-center">
        <Link to="/">
          <Button variant="ghost" size="icon" aria-label="Home" className="mr-2">
            <Home className="h-6 w-6 text-primary" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Preferences</h2>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Currency</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="input px-3 py-2 rounded-md border border-input bg-background w-full"
        >
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="inr">INR</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Default Chart Time Range</label>
        <select
          value={defaultRange}
          onChange={e => setDefaultRange(e.target.value)}
          className="input px-3 py-2 rounded-md border border-input bg-background w-full"
        >
          {TIME_RANGES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleSave} className="w-full">Done</Button>
        <Button onClick={handleReset} variant="outline" className="w-full">Reset</Button>
      </div>
      {saved && <div className="text-green-600 text-center mt-2">Preferences saved!</div>}
    </div>
  );
};

export default Preferences; 