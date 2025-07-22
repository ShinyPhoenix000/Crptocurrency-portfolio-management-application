import React, { useEffect, useState, useRef } from 'react';
import { useWallet, WalletEntry } from '@/contexts/WalletContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ProfitLoss } from '../ui/ProfitLoss';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface CoinPriceMap {
  [coinId: string]: number;
}

const SORT_OPTIONS = [
  { label: 'Date (Newest)', value: 'date-desc' },
  { label: 'Date (Oldest)', value: 'date-asc' },
  { label: 'Profit/Loss', value: 'profit' },
  { label: 'Quantity', value: 'quantity' },
];

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(wallet: WalletEntry[], filename: string) {
  if (!wallet.length) return;
  const headers = Object.keys(wallet[0]);
  const csvRows = [headers.join(',')];
  for (const entry of wallet) {
    const row = headers.map(h => {
      let val = (entry as any)[h];
      if (typeof val === 'string' && val.includes(',')) val = '"' + val + '"';
      return val ?? '';
    });
    csvRows.push(row.join(','));
  }
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const WalletTable: React.FC = () => {
  const { wallet, removeEntry, addEntry } = useWallet();
  const { currency } = useCurrency();
  const [prices, setPrices] = useState<CoinPriceMap>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState('date-desc');

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

  const handleExportJSON = () => {
    downloadJSON(wallet, 'fintrack-wallet.json');
    toast({ title: 'Wallet exported', description: 'Your wallet has been downloaded as a .json file.' });
  };

  const handleExportCSV = () => {
    downloadCSV(wallet, 'fintrack-wallet.csv');
    toast({ title: 'Wallet exported', description: 'Your wallet has been downloaded as a .csv file.' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        imported.forEach((entry: any) => {
          if (!entry.coinId || !entry.coinName || !entry.symbol || typeof entry.quantity !== 'number') {
            throw new Error('Invalid entry in file');
          }
        });
        imported.forEach((entry: WalletEntry) => addEntry(entry));
        toast({ title: 'Wallet imported', description: 'Your wallet has been updated.', variant: 'success' });
      } catch (err) {
        toast({ title: 'Import failed', description: 'Invalid wallet file.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (wallet.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No wallet transactions yet.</div>;
  }

  // Sort wallet entries
  const sortedWallet = [...wallet].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return (b.sellDate || b.buyDate).localeCompare(a.sellDate || a.buyDate);
    }
    if (sortBy === 'date-asc') {
      return (a.sellDate || a.buyDate).localeCompare(b.sellDate || b.buyDate);
    }
    if (sortBy === 'profit') {
      const getProfit = (entry: WalletEntry) => {
        const buy = entry.buyPrice;
        const sell = entry.sellPrice;
        const qty = entry.quantity;
        if (entry.sellDate && sell) return (sell - buy) * qty;
        const current = prices[entry.coinId] || 0;
        return (current - buy) * qty;
      };
      return getProfit(b) - getProfit(a);
    }
    if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    }
    return 0;
  });

  return (
    <div className="overflow-x-auto animate-fade-in">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">Export Wallet</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleExportJSON}>Export as JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Import Wallet (.json)</Button>
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {SORT_OPTIONS.map(opt => (
              <DropdownMenuItem key={opt.value} onClick={() => setSortBy(opt.value)}>{opt.label}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <table className="min-w-full bg-card rounded-lg shadow">
        <thead>
          <tr className="bg-muted text-xs text-muted-foreground">
            <th className="px-4 py-2 text-left">Coin</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="px-4 py-2 text-right">Buy Price</th>
            <th className="px-4 py-2 text-right">Buy Date</th>
            <th className="px-4 py-2 text-right">Sell Price</th>
            <th className="px-4 py-2 text-right">Sell Date</th>
            <th className="px-4 py-2 text-right">Profit/Loss</th>
            <th className="px-4 py-2 text-right">% Gain/Loss</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedWallet.map(entry => {
            const buy = entry.buyPrice;
            const sell = entry.sellPrice;
            const qty = entry.quantity;
            let profitLoss = 0;
            let percent = 0;
            let sellDisplay = '--';
            let sellDateDisplay = '--';
            let percentDisplay = '--';

            if (entry.sellDate && sell) {
              profitLoss = (sell - buy) * qty;
              percent = ((sell - buy) / buy) * 100;
              sellDisplay = <AnimatedNumber value={sell} />;
              sellDateDisplay = entry.sellDate;
              percentDisplay = <ProfitLoss value={percent} decimals={2} />;
            } else {
              const current = prices[entry.coinId] || 0;
              profitLoss = (current - buy) * qty;
              percent = buy ? ((current - buy) / buy) * 100 : 0;
              sellDisplay = current ? <AnimatedNumber value={current} /> : '--';
              percentDisplay = buy ? <ProfitLoss value={percent} decimals={2} /> : '--';
            }

            return (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium flex items-center gap-2">
                  <span>{entry.coinName}</span>
                  <span className="uppercase text-xs text-muted-foreground">({entry.symbol})</span>
                </td>
                <td className="px-4 py-2 text-right">{qty}</td>
                <td className="px-4 py-2 text-right"><AnimatedNumber value={buy} /></td>
                <td className="px-4 py-2 text-right">{entry.buyDate}</td>
                <td className="px-4 py-2 text-right">{sellDisplay}</td>
                <td className="px-4 py-2 text-right">{sellDateDisplay}</td>
                <td className="px-4 py-2 text-right font-semibold"><ProfitLoss value={profitLoss} /></td>
                <td className="px-4 py-2 text-right font-semibold">{percentDisplay}</td>
                <td className="px-4 py-2 text-center">
                  {/* TODO: Add edit functionality */}
                  <Button variant="destructive" size="sm" onClick={() => { removeEntry(entry.id); toast({ title: 'Deleted wallet entry' }); }}>Delete</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 