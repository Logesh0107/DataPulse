'use client';
import React from 'react';

type Props = {
  current: number;
  avg: number;
  min: number;
  max: number;
};

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="panel">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

export default function MetricCards({ current, avg, min, max }: Props) {
  return (
    <div className="cards">
      <Card title="Current" value={current} />
      <Card title="Average" value={avg} />
      <Card title="Min" value={min} />
      <Card title="Max" value={max} />
    </div>
  );
}
