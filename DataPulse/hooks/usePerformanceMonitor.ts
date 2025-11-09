'use client';
import { useEffect, useRef, useState } from 'react';

export function usePerformanceMonitor() {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const last = useRef<number>(performance.now());
  const frames = useRef(0);

  useEffect(() => {
    function loop(now: number) {
      frames.current++;
      const delta = now - last.current;
      if (delta >= 1000) {
        setFps(Math.round((frames.current * 1000) / delta));
        frames.current = 0;
        last.current = now;
        // memory is available only in some browsers
        // @ts-ignore
        if ((performance as any).memory) {
          // @ts-ignore
          const mem = (performance as any).memory.usedJSHeapSize;
          setMemory(Math.round(mem / 1024 / 1024));
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return { fps, memory };
}
