'use client';
import React from 'react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

export default function PerformanceMonitor() {
  const { fps, memory } = usePerformanceMonitor();
  return (
    <div style={{ position: 'fixed', right: 12, top: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 8, borderRadius: 6, fontSize: 12, zIndex: 9999 }}>
      <div style={{ fontWeight: 700 }}>FPS: {fps}</div>
      <div>Memory: {memory ?? 'n/a'} MB</div>
    </div>
  );
}
