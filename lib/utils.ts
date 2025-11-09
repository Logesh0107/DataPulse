// simple stats helper
import { DataPoint } from './types';

export function calcStats(data: DataPoint[]) {
  if (!data || data.length === 0) return { min: 0, max: 0, avg: 0, last: 0 };
  let min = Infinity, max = -Infinity, sum = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i].value;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return {
    min: parseFloat(min.toFixed(3)),
    max: parseFloat(max.toFixed(3)),
    avg: parseFloat((sum / data.length).toFixed(3)),
    last: parseFloat(data[data.length - 1].value.toFixed(3)),
  };
}
