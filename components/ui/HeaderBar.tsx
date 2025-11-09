'use client';
import React from 'react';

type Props = {
  theme: 'dark' | 'light';
  onToggle: () => void;
};

export default function HeaderBar({ theme, onToggle }: Props) {
  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>
          DP
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>DataPulse</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Real-time Bitcoin performance dashboard</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn" onClick={onToggle}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
      </div>
    </div>
  );
}
