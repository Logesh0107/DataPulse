'use client';
import React from 'react';

type Props = {
  isPaused: boolean;
  onPauseToggle: () => void;
  onResetZoom: () => void;
  onSnapshot: () => void;
  isReplaying: boolean;
  onReplayToggle: () => void;
  replayIndex: number;
  replayMax: number;
  onSetReplayIndex: (v: number) => void;
};

export default function ControlBar({
  isPaused, onPauseToggle, onResetZoom, onSnapshot,
  isReplaying, onReplayToggle, replayIndex, replayMax, onSetReplayIndex
}: Props) {
  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="controls">
          <button className="btn" onClick={onPauseToggle}>{isPaused ? '▶ Resume' : '⏸ Pause'}</button>
          <button className="btn" onClick={onReplayToggle}>{isReplaying ? 'Stop Replay' : '🔁 Replay'}</button>
          <button className="btn" onClick={onResetZoom}>Reset Zoom</button>
          <button className="btn" onClick={onSnapshot}>📸 Snapshot</button>
        </div>
        <div style={{ minWidth: 320 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Replay position</div>
          <input
            type="range"
            min={0}
            max={Math.max(0, replayMax - 1)}
            value={replayIndex}
            onChange={(e) => onSetReplayIndex(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
