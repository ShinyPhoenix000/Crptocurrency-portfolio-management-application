import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: { price: number[] };
}

export default function TrendsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=7d')
      .then(res => res.json())
      .then(data => {
        setCoins(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch coins.');
        setLoading(false);
      });
  }, []);

  // Sort by 7d gain/loss
  const sorted = [...coins].sort((a, b) => (b.price_change_percentage_7d_in_currency || 0) - (a.price_change_percentage_7d_in_currency || 0));

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
          <CardTitle className="text-xl">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && <div className="col-span-full text-muted-foreground">Loading...</div>}
            {error && <div className="col-span-full text-destructive">{error}</div>}
            {!loading && !error && sorted.map(coin => {
              const isGain = (coin.price_change_percentage_7d_in_currency || 0) > 0;
              const color = isGain ? '#22c55e' : '#ef4444';
              const sparkData = coin.sparkline_in_7d.price.map((p, i) => ({ x: i, y: p }));
              return (
                <Card
                  key={coin.id}
                  className="flex items-center gap-4 p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  onClick={() => navigate(`/charts?coin=${coin.id}`)}
                >
                  <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{coin.name} <span className="uppercase text-xs text-muted-foreground">({coin.symbol})</span></div>
                    <div className="text-xs text-muted-foreground">${coin.current_price.toLocaleString()}</div>
                  </div>
                  <div className="w-28 h-10 flex items-center">
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={sparkData} margin={{ top: 8, bottom: 8, left: 0, right: 0 }}>
                        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={`ml-4 font-semibold ${isGain ? 'text-success' : 'text-danger'}`}>{coin.price_change_percentage_7d_in_currency?.toFixed(2)}%</div>
                </Card>
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground mt-4">Click a coin to analyze its full chart.</div>
        </CardContent>
      </Card>
    </div>
  );
}