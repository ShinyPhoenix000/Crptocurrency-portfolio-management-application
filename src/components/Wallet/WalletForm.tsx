import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from '../ui/use-toast';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface CoinOption {
  id: string;
  name: string;
  symbol: string;
}

const COINS: CoinOption[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
];

async function fetchHistoricalPrice(coinId: string, date: string, currency: string): Promise<number | null> {
  const [yyyy, mm, dd] = date.split('-');
  const formatted = `${dd}-${mm}-${yyyy}`;
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${formatted}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.market_data?.current_price?.[currency.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

function toInputDateString(date: Date | null) {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

export const WalletForm: React.FC = () => {
  const { addEntry } = useWallet();
  const { currency } = useCurrency();
  const [coinId, setCoinId] = useState(COINS[0].id);
  const [quantity, setQuantity] = useState('');
  const [buyDate, setBuyDate] = useState<Date | null>(null);
  const [buyPrice, setBuyPrice] = useState('');
  const [sellDate, setSellDate] = useState<Date | null>(null);
  const [sellPrice, setSellPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const coin = COINS.find(c => c.id === coinId);
    if (!coin || !quantity || isNaN(Number(quantity)) || !buyDate) {
      toast({ title: 'Please enter valid data', variant: 'destructive' });
      return;
    }
    if (sellPrice && isNaN(Number(sellPrice))) {
      toast({ title: 'Invalid sell price', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    let buy = buyPrice;
    let sell = sellPrice;
    const buyDateStr = toInputDateString(buyDate);
    const sellDateStr = sellDate ? toInputDateString(sellDate) : '';
    if (!buy) {
      const price = await fetchHistoricalPrice(coin.id, buyDateStr, currency);
      if (price == null) {
        toast({ title: 'Failed to fetch buy price for that date', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      buy = price.toString();
    }
    if (!sell && sellDateStr) {
      const price = await fetchHistoricalPrice(coin.id, sellDateStr, currency);
      if (price == null) {
        toast({ title: 'Failed to fetch sell price for that date', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      sell = price.toString();
    }
    addEntry({
      coinId: coin.id,
      coinName: coin.name,
      symbol: coin.symbol,
      quantity: Number(quantity),
      buyDate: buyDateStr,
      buyPrice: Number(buy),
      sellDate: sellDateStr || undefined,
      sellPrice: sell ? Number(sell) : undefined,
    });
    setSubmitting(false);
    setQuantity('');
    setBuyDate(null);
    setBuyPrice('');
    setSellDate(null);
    setSellPrice('');
    setCoinId(COINS[0].id);
    toast({ title: 'Wallet entry added!', description: `${coin.name} (${coin.symbol})`, variant: 'success' });
  };

  const handleReset = () => {
    setCoinId(COINS[0].id);
    setQuantity('');
    setBuyDate(null);
    setBuyPrice('');
    setSellDate(null);
    setSellPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end mb-6 animate-fade-in">
      <div>
        <label className="block text-sm mb-1">Coin</label>
        <select value={coinId} onChange={e => setCoinId(e.target.value)} className="input px-3 py-2 rounded-md border border-input bg-background">
          {COINS.map(coin => (
            <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Quantity</label>
        <Input type="number" min="0" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 1.5" />
      </div>
      <div>
        <label className="block text-sm mb-1">Buy Price ({currency.toUpperCase()})</label>
        <Input type="number" min="0" step="any" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder={`e.g. 30000`} />
      </div>
      <div>
        <label className="block text-sm mb-1">Buy Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {buyDate ? format(buyDate, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Calendar mode="single" selected={buyDate!} onSelect={setBuyDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block text-sm mb-1">Sell Price ({currency.toUpperCase()})</label>
        <Input type="number" min="0" step="any" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder={`e.g. 35000`} />
      </div>
      <div>
        <label className="block text-sm mb-1">Sell Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {sellDate ? format(sellDate, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Calendar mode="single" selected={sellDate!} onSelect={setSellDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
        <Button type="submit" disabled={submitting} className="h-10 px-6">{submitting ? 'Adding...' : 'Done'}</Button>
        <Button type="button" variant="outline" className="h-10 px-6" onClick={handleReset}>Reset</Button>
      </div>
    </form>
  );
}; 