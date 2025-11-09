'use client';
import { useEffect, useRef, useState } from 'react';
import { DataPoint } from '../lib/types';
import { nextDataPoint } from '../lib/dataGenerator';

export default function useDataStream(initialData: DataPoint[], maxPoints = 20000) {
  const [data, setData] = useState<DataPoint[]>(initialData || []);
  const lastTsRef = useRef<number>(initialData.length ? initialData[initialData.length - 1].timestamp : Date.now());
  const lastIdRef = useRef<number>(initialData.length ? (initialData[initialData.length - 1].id ?? initialData.length - 1) : 0);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = nextDataPoint(lastTsRef.current);
      lastTsRef.current = next.timestamp;
      lastIdRef.current = lastIdRef.current + 1;
      setData(prev => {
        // keep a sliding window
        const arr = prev.length >= maxPoints ? prev.slice(prev.length - maxPoints + 1) : prev.slice();
        arr.push({ ...next, id: lastIdRef.current });
        return arr;
      });
    }, 100); // 100ms

    return () => clearInterval(interval);
  }, [maxPoints]);

  return data;
}