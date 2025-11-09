import { DataPoint } from './types';

export function generateInitialData(points = 10000, start = Date.now() - points * 100) {
  const data: DataPoint[] = new Array(points);
  let t = start;
  for (let i = 0; i < points; i++) {
    const v = Math.sin(i / 50) * 10 + Math.random() * 4 + (i / points) * 5;
    data[i] = { timestamp: t, value: v, id: i };
    t += 100; // 100ms spacing
  }
  return data;
}

export function nextDataPoint(lastTimestamp: number) {
  const t = lastTimestamp + 100;
  const v = Math.sin(t / 5000) * 10 + Math.random() * 4;
  return { timestamp: t, value: v };
}