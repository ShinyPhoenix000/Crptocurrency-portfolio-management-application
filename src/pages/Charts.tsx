import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoinChart } from '@/components/Chart/CoinChart';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CoinOption {
  id: string;
  name: string;
  symbol: string;
  image: string;
}

export default function ChartsPage() {
  const [coinOptions, setCoinOptions] = useState<CoinOption[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch top 100 coins for dropdown
  useEffect(() => {
    setLoading(true);
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false')
      .then(res => res.json())
      .then(data => {
        setCoinOptions(data.map((c: any) => ({ id: c.id, name: c.name, symbol: c.symbol, image: c.image })));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch coins.');
        setLoading(false);
      });
  }, []);

  // Filter coins for search
  const filteredOptions = coinOptions.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // Handle select (up to 3)
  const handleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const handleReset = () => {
    setSearch('');
    setSelected([]);
  };
  const handleDone = () => {
    // No-op: selection is already applied live, but this can be used for future modal/panel UX
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/" className="fixed top-4 left-4 z-50 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-primary">
                <Home className="h-6 w-6 text-primary" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to Home</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Analyze Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-full md:w-96">
              <label className="block text-sm font-medium mb-1">Search coins</label>
              <Input
                type="text"
                placeholder="Search by name or symbol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-60 overflow-y-auto border rounded-md bg-background">
                {loading && <div className="p-2 text-muted-foreground">Loading...</div>}
                {error && <div className="p-2 text-destructive">{error}</div>}
                {!loading && !error && filteredOptions.map(coin => (
                  <div
                    key={coin.id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${selected.includes(coin.id) ? 'bg-primary/10' : 'hover:bg-muted'}`}
                    onClick={() => handleSelect(coin.id)}
                  >
                    <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                    <span className="font-medium">{coin.name}</span>
                    <span className="uppercase text-xs text-muted-foreground">({coin.symbol})</span>
                    {selected.includes(coin.id) && <span className="ml-auto text-primary text-xs">Selected</span>}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Select up to 3 coins to compare.</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleDone}>Done</Button>
                <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {selected.map(coinId => (
          <CoinChart key={coinId} coinId={coinId} />
        ))}
      </div>
    </div>
  );
}