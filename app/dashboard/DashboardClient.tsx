'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useData } from '../../components/providers/DataProvider';
import useDataStream from '../../hooks/useDataStream';
import LineChart, { LineChartHandle } from '../../components/charts/LineChart';
import PerformanceMonitor from '../../components/ui/PerformanceMonitor';
import HeaderBar from '../../components/ui/HeaderBar';
import MetricCards from '../../components/ui/MetricCards';
import ControlBar from '../../components/ui/ControlBar';
import { calcStats } from '../../lib/utils';
import { DataPoint } from '../../lib/types';

export default function DashboardClient() {
  const initial = useData(); // initial data from API route
  const live = useDataStream(initial || [], 20000); // live stream (simulated)
  // you can also fetch live bitcoin price and push into data stream (we'll show example)
  const [useLiveApi, setUseLiveApi] = useState(true);

  // app state
  const [isPaused, setIsPaused] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [theme, setTheme] = useState<'dark'|'light'>('dark');

  // chart view (zoom & offset)
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);

  // chart ref for snapshot
  const chartRef = useRef<LineChartHandle | null>(null);

  // full history (we append from live)
  const historyRef = useRef<DataPoint[]>(initial || []);
  useEffect(() => { if (initial && initial.length) historyRef.current = initial.slice(); }, [initial]);

  useEffect(() => {
    // append new live points to history
    if (!live || live.length === 0) return;
    const last = historyRef.current.length ? historyRef.current[historyRef.current.length - 1].id ?? historyRef.current.length - 1 : -1;
    const newPoints = live.slice(last + 1 - 0); // naive: append if not duplicates
    // append only unique id
    for (let i = 0; i < live.length; i++) {
      const p = live[i];
      if (!historyRef.current.length || p.timestamp > historyRef.current[historyRef.current.length - 1].timestamp) {
        historyRef.current.push(p);
      }
    }
    // cap history to 200k for safety
    if (historyRef.current.length > 200000) historyRef.current = historyRef.current.slice(historyRef.current.length - 200000);
  }, [live]);

  // Mode: live or replay controls which dataset is shown
  const [displayData, setDisplayData] = useState<DataPoint[]>(live);
  useEffect(() => {
    if (isReplaying) {
      // show slice from history up to replayIndex
      const slice = historyRef.current.slice(0, Math.max(2, replayIndex));
      setDisplayData(slice);
    } else if (isPaused) {
      // paused: keep current last N points
      setDisplayData(prev => prev);
    } else {
      setDisplayData(live);
    }
  }, [isReplaying, isPaused, replayIndex, live]);

  // Replay controller: when replaying, advance replayIndex
  useEffect(() => {
    if (!isReplaying) return;
    const id = setInterval(() => {
      setReplayIndex((ri) => {
        const next = Math.min(ri + Math.max(1, Math.floor(historyRef.current.length / 200)), historyRef.current.length);
        if (next >= historyRef.current.length) {
          // stop automatically when reached end
          clearInterval(id);
          setIsReplaying(false);
          return historyRef.current.length;
        }
        return next;
      });
    }, 60); // replay speed
    return () => clearInterval(id);
  }, [isReplaying]);

  // metric stats from displayData
  const stats = useMemo(() => calcStats(displayData || []), [displayData]);

  // theme toggle effect (adjust CSS variables simply)
  useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);


  // Pause/resume handler
  const handlePauseToggle = () => {
    setIsPaused(p => !p);
    if (isReplaying && !isPaused) setIsReplaying(false);
  };

  // Replay toggle
  const handleReplayToggle = () => {
    if (isReplaying) {
      setIsReplaying(false);
      setReplayIndex(0);
    } else {
      setIsReplaying(true);
      setReplayIndex(2);
    }
  };

  // Reset zoom (simple)
  const handleResetZoom = () => {
    setZoom(1);
    setOffset(0);
  };

  // Snapshot (download PNG)
  const handleSnapshot = () => {
    const img = chartRef.current?.getImage();
    if (!img) return alert('Unable to capture snapshot');
    const a = document.createElement('a');
    a.href = img;
    a.download = `datapulse_snapshot_${Date.now()}.png`;
    a.click();
  };

  // Hover handler from chart to show tooltip (we'll implement simple tooltip DOM)
  const [tooltip, setTooltip] = useState<{text:string, x:number, y:number}|null>(null);
  const handleHover = (p?: DataPoint, x?: number, y?: number) => {
    if (!p) { setTooltip(null); return; }
    setTooltip({ text: `${new Date(p.timestamp).toLocaleTimeString()} — ${p.value.toFixed(3)}`, x: x ?? 0, y: y ?? 0 });
  };

  // Optional: live API (Coingecko) - fetch bitcoin price and push into historyRef every 2s
  useEffect(() => {
    if (!useLiveApi) return;
    let running = true;
    const tick = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const js = await res.json();
        const price = js?.bitcoin?.usd;
        if (price && running) {
          const now = Date.now();
          const point: DataPoint = { timestamp: now, value: Number(price), id: historyRef.current.length ? (historyRef.current[historyRef.current.length - 1].id ?? historyRef.current.length - 1) + 1 : 0 };
          historyRef.current.push(point);
          // keep history cap
          if (historyRef.current.length > 200000) historyRef.current.shift();
          // if not paused and not replaying, update display (append)
          if (!isPaused && !isReplaying) setDisplayData(prev => [...prev.slice(-2000), point]);
        }
      } catch (err) {
        // ignore fetch errors silently
        // console.error('coingecko', err);
      } finally {
        if (running) setTimeout(tick, 2000);
      }
    };
    tick();
    return () => { running = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLiveApi, isPaused, isReplaying]);

  return (
    <div className="container">
      <div className="bg-anim" />
      <HeaderBar theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      <div style={{ height: 12 }} />
      <MetricCards current={stats.last} avg={stats.avg} min={stats.min} max={stats.max} />
      <div style={{ height: 12 }} />
      <ControlBar
        isPaused={isPaused}
        onPauseToggle={handlePauseToggle}
        onResetZoom={handleResetZoom}
        onSnapshot={handleSnapshot}
        isReplaying={isReplaying}
        onReplayToggle={handleReplayToggle}
        replayIndex={replayIndex}
        replayMax={historyRef.current.length}
        onSetReplayIndex={(v) => { setReplayIndex(v); setDisplayData(historyRef.current.slice(0, v)); }}
      />
      <div style={{ marginTop: 12 }} className="panel">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <LineChart
              ref={chartRef}
              data={displayData}
              width={1100}
              height={360}
              zoom={zoom}
              offset={offset}
              onHover={(p, x, y) => handleHover(p, x, y)}
            />
          </div>
          <div style={{ width: 260 }}>
            <div className="panel" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Data source</div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={useLiveApi} onChange={(e) => setUseLiveApi(e.target.checked)} />
                  <span style={{ fontSize: 13 }}>Coingecko Bitcoin live</span>
                </label>
              </div>
            </div>
            <div className="panel">
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Controls</div>
              <div style={{ marginTop: 10 }}>
                <button className="btn" onClick={() => { setZoom(z => Math.min(z * 1.25, 50)); }}>Zoom +</button>
                <button className="btn" onClick={() => { setZoom(z => Math.max(z / 1.25, 1)); }}>Zoom −</button>
                <button className="btn" onClick={() => setOffset(o => Math.max(0, o - Math.floor((displayData.length || 1) / 10)))}>◀</button>
                <button className="btn" onClick={() => setOffset(o => Math.min((displayData.length || 1), o + Math.floor((displayData.length || 1) / 10)))}>▶</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PerformanceMonitor />

      {/* Tooltip DOM */}
      {tooltip ? (
        <div className="chart-tooltip" style={{ left: tooltip.x + 'px', top: tooltip.y + 'px' }}>
          {tooltip.text}
        </div>
      ) : null}
    </div>
  );
}
