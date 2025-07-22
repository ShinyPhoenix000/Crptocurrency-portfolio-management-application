export function linearRegressionPredict(data: { x: number; y: number }[], predictCount: number) {
  const n = data.length;
  if (n === 0) return { prediction: [], stdError: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const { x, y } of data) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - m * sumX) / n;
  // Standard error
  const yHat = data.map(({ x }) => m * x + b);
  const stdError = Math.sqrt(yHat.reduce((acc, y, i) => acc + Math.pow(y - data[i].y, 2), 0) / n);
  // Predict
  const prediction = [];
  for (let i = 1; i <= predictCount; i++) {
    const x = n - 1 + i;
    prediction.push({ x, y: m * x + b });
  }
  return { prediction, stdError };
}

export function movingAveragePredict(data: { x: number; y: number }[], window: number, predictCount: number) {
  if (data.length < window) return { prediction: [], stdError: 0 };
  const avg = data.slice(-window).reduce((acc, d) => acc + d.y, 0) / window;
  return {
    prediction: Array.from({ length: predictCount }, (_, i) => ({ x: data.length + i, y: avg })),
    stdError: 0,
  };
} 