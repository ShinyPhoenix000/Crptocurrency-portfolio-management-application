import React, { useEffect, useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceArea } from 'recharts';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { linearRegressionPredict, movingAveragePredict } from '@/lib/prediction';

const RANGES = [
  { label: '24h', value: '1', predict: 2 },
  { label: '7d', value: '7', predict: 7 },
  { label: '30d', value: '30', predict: 7 },
  { label: '1y', value: '365', predict: 365 },
];

const COIN_NAME_MAP: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  solana: 'Solana',
  dogecoin: 'Dogecoin',
  cardano: 'Cardano',
};

const MODELS = [
  { label: 'Linear Regression', value: 'linear' },
  { label: 'Moving Average', value: 'ma' },
  { label: 'None', value: 'none' },
];

interface CoinChartProps {
  coinId: string;
  coinName?: string;
}

export const CoinChart: React.FC<CoinChartProps> = ({ coinId, coinName }) => {
  const { currency } = useCurrency();
  const [range, setRange] = useState('7');
  const [model, setModel] = useState<'linear' | 'ma' | 'none'>('linear');
  const [data, setData] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any[]>([]); // for prediction
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleReset = () => {
    setModel('linear');
    setRange('7');
  };
  const handleDone = () => {
    // No-op: selection is already applied live, but this can be used for future modal/panel UX
  };

  // Debounced fetch for chart data
  const fetchChartData = (isPrediction = false) => {
    setLoading(true);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${isPrediction ? '365' : range}`)
        .then(res => res.json())
        .then(res => {
          if (!res.prices) throw new Error('No data');
          if (isPrediction) {
            setFullData(res.prices.map(([ts, price]: [number, number]) => ({
              date: new Date(ts).toLocaleDateString(),
              price,
              ts,
            })));
          } else {
            setData(res.prices.map(([ts, price]: [number, number]) => ({
              date: new Date(ts).toLocaleDateString(),
              price,
              ts,
            })));
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to fetch chart data. This may be due to CoinGecko rate limits. Please wait a minute and try again.');
          setLoading(false);
        });
    }, 400); // 400ms debounce
  };

  useEffect(() => {
    fetchChartData(false);
    // eslint-disable-next-line
  }, [coinId, currency, range, retryCount]);

  // Fetch 1y data for prediction
  useEffect(() => {
    fetchChartData(true);
    // eslint-disable-next-line
  }, [coinId, currency, retryCount]);

  // Memoized prediction calculation
  const { prediction, stdError, predictLabel } = useMemo(() => {
    if (model === 'none' || fullData.length < 10) return { prediction: [], stdError: 0, predictLabel: '' };
    const rangeObj = RANGES.find(r => r.value === range) || RANGES[1];
    const predictCount = rangeObj.predict;
    const regressionData = fullData.slice(-30).map((d, i) => ({ x: i, y: d.price }));
    if (model === 'linear') {
      const { prediction, stdError } = linearRegressionPredict(regressionData, predictCount);
      return { prediction, stdError, predictLabel: `Predicted (${predictCount} days, linear regression)` };
    }
    if (model === 'ma') {
      const { prediction } = movingAveragePredict(regressionData, range === '1y' ? 30 : 7, predictCount);
      return { prediction, stdError: 0, predictLabel: `Predicted (${predictCount} days, moving average)` };
    }
    return { prediction: [], stdError: 0, predictLabel: '' };
  }, [model, fullData, range]);

  // Prepare chart data with prediction
  const chartData = useMemo(() => {
    if (!data.length) return [];
    const base = [...data];
    if (prediction.length > 0) {
      const lastTs = data[data.length - 1].ts;
      for (let i = 0; i < prediction.length; i++) {
        const ts = lastTs + (i + 1) * 24 * 60 * 60 * 1000;
        base.push({
          date: new Date(ts).toLocaleDateString(),
          price: null,
          predicted: prediction[i].y,
          upper: prediction[i].y + stdError,
          lower: prediction[i].y - stdError,
        });
      }
    }
    return base;
  }, [data, prediction, stdError]);

  const displayName = coinName || COIN_NAME_MAP[coinId] || coinId;

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <CardTitle className="text-lg">{displayName} Price Chart</CardTitle>
          <span className="text-xs text-muted-foreground">({currency.toUpperCase()})</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center overflow-x-auto max-w-full">
          <select
            value={model}
            onChange={e => setModel(e.target.value as any)}
            className="input px-2 py-1 rounded-md border border-input bg-background text-xs"
          >
            {MODELS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {RANGES.map(r => (
            <Button key={r.value} size="sm" variant={range === r.value ? 'default' : 'outline'} onClick={() => setRange(r.value)}>{r.label}</Button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleDone}>Done</Button>
          <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-center text-muted-foreground">Loading chart...</div>}
        {error && (
          <div className="text-center text-destructive">
            {error}
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={() => setRetryCount(c => c + 1)}>Retry</Button>
            </div>
          </div>
        )}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e42" stopOpacity={0.12}/>
                  <stop offset="100%" stopColor="#f59e42" stopOpacity={0.04}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide={chartData.length > 30} />
              <YAxis domain={['auto', 'auto']} tickFormatter={v => v?.toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase() })} width={70} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  v?.toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase() }),
                  name === 'predicted' ? 'Predicted value (see legend)' : 'Price',
                ]}
              />
              <Area type="monotone" dataKey="price" stroke="#6366f1" fillOpacity={1} fill="url(#colorPrice)" />
              {model !== 'none' && prediction.length > 0 && (
                <>
                  {/* Confidence band */}
                  {model === 'linear' && stdError > 0 && (
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#confBand)"
                      activeDot={false}
                      dot={false}
                      legendType="none"
                    />
                  )}
                  {/* Prediction line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#f59e42"
                    strokeDasharray="6 4"
                    dot={false}
                    legendType="line"
                    name={predictLabel}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
        {/* Legend and educational note */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2">
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-block w-4 h-1 rounded bg-[#6366f1]" /> Price
            {model !== 'none' && prediction.length > 0 && (
              <>
                <span className="inline-block w-4 h-1 rounded border-b-2 border-dashed border-[#f59e42]" />
                <span className="text-[#f59e42]">Prediction ({MODELS.find(m => m.value === model)?.label})</span>
                {model === 'linear' && stdError > 0 && (
                  <span className="inline-block w-4 h-2 rounded bg-[#f59e42]/20" />
                )}
                {model === 'linear' && stdError > 0 && (
                  <span className="text-[#f59e42]/80">Confidence band</span>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1 md:mt-0">
            Predictions are based on simple trend analysis and are not financial advice.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 