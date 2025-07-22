import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const COINS = [
  { id: 'bitcoin', name: 'Bitcoin' },
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'solana', name: 'Solana' },
  { id: 'dogecoin', name: 'Dogecoin' },
  { id: 'cardano', name: 'Cardano' },
];

interface Alert {
  id: string;
  coin: string;
  coinName: string;
  minPrice: number;
  maxPrice: number;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [coin, setCoin] = useState(COINS[0].id);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('fintrack-alerts');
    if (stored) setAlerts(JSON.parse(stored));
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('fintrack-alerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!minPrice || !maxPrice || isNaN(Number(minPrice)) || isNaN(Number(maxPrice))) {
      setError('Please enter valid numbers for both min and max price.');
      return;
    }
    if (Number(minPrice) > Number(maxPrice)) {
      setError('Min price should be less than or equal to max price.');
      return;
    }
    setSaving(true);
    setAlerts(prev => [
      {
        id: Date.now().toString(),
        coin,
        coinName: COINS.find(c => c.id === coin)?.name || coin,
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
      },
      ...prev,
    ]);
    setMinPrice('');
    setMaxPrice('');
    setCoin(COINS[0].id);
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleReset = () => {
    setCoin(COINS[0].id);
    setMinPrice('');
    setMaxPrice('');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-card rounded-lg shadow animate-fade-in">
      <div className="mb-4 flex items-center">
        <Link to="/">
          <Button variant="ghost" size="icon" aria-label="Home" className="mr-2">
            <Home className="h-6 w-6 text-primary" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" /> Price Alerts
          {alerts.length > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{alerts.length}</span>
          )}
        </h2>
      </div>
      {alerts.length === 0 ? (
        <div className="text-muted-foreground mb-6">No price alerts set. You can add alerts to be notified when a coin hits your target price range.</div>
      ) : (
        <ul className="mb-6">
          {alerts.map((alert) => (
            <li key={alert.id} className="mb-2 p-2 bg-muted rounded flex items-center justify-between">
              <span>
                <span className="font-semibold">{alert.coinName}</span> between <span className="text-primary">${alert.minPrice}</span> and <span className="text-primary">${alert.maxPrice}</span>
              </span>
              <button onClick={() => handleDelete(alert.id)} className="ml-2 text-destructive hover:text-red-700"><X className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
      {showForm ? (
        <form onSubmit={handleAddAlert} className="mb-4 animate-fade-in">
          <div className="mb-2">
            <label className="block text-sm mb-1">Coin</label>
            <select value={coin} onChange={e => setCoin(e.target.value)} className="input px-3 py-2 rounded-md border border-input bg-background w-full">
              {COINS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-2 flex gap-2">
            <div className="flex-1">
              <label className="block text-sm mb-1">Min Price (USD)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="input px-3 py-2 rounded-md border border-input bg-background w-full"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Max Price (USD)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="input px-3 py-2 rounded-md border border-input bg-background w-full"
                required
              />
            </div>
          </div>
          {error && <div className="text-destructive text-xs mb-2 text-center">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" className="w-full" disabled={saving}>Done</Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleReset}>Reset</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => { setShowForm(false); setError(null); }}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="w-full">Add New Alert</Button>
      )}
    </div>
  );
};

export default Alerts; 