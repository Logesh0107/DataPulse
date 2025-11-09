'use client';
import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { DataPoint } from '../../lib/types';

type Props = {
  data: DataPoint[];
  width?: number;
  height?: number;
  pixelRatio?: number;
  // view control from parent
  zoom?: number;
  offset?: number;
  onViewChange?: (view: { zoom: number; offset: number }) => void;
  // replay mode tooltip handler
  onHover?: (p?: DataPoint, x?: number, y?: number) => void;
};

export type LineChartHandle = {
  getImage: () => string | null;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const LineChart = forwardRef<LineChartHandle, Props>(function LineChart({
  data, width = 1000, height = 320, pixelRatio, zoom = 1, offset = 0, onViewChange, onHover
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);
  const dpr = pixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  // local smooth state
  const smooth = useRef({ zoom, offset });
  useEffect(() => { smooth.current.zoom = zoom; smooth.current.offset = offset; }, [zoom, offset]);

  // tooltip local
  const [mousePos, setMousePos] = useState<{x:number,y:number}|null>(null);

  useImperativeHandle(ref, () => ({
    getImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    }
  }));

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1.2;

    // event helpers
    let lastMouseX = 0;
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      lastMouseX = e.clientX - rect.left;
      setMousePos({ x: lastMouseX, y: e.clientY - rect.top });
      // derive hovered datapoint and call onHover
      const visibleCount = Math.floor(data.length / smooth.current.zoom) || 1;
      const startIdx = Math.max(0, Math.floor(smooth.current.offset));
      const endIdx = Math.min(data.length, startIdx + visibleCount);
      const visible = data.slice(startIdx, endIdx);
      const step = width / Math.max(visible.length - 1, 1);
      const idx = Math.round(lastMouseX / step);
      const p = visible[idx];
      if (onHover) onHover(p, e.clientX + 12, e.clientY + 12);
    };

    const handleLeave = () => {
      setMousePos(null);
      if (onHover) onHover(undefined);
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);

    const render = () => {
      // smooth interpolate to targets
      smooth.current.zoom = lerp(smooth.current.zoom, zoom, 0.12);
      smooth.current.offset = lerp(smooth.current.offset, offset, 0.12);

      ctx.clearRect(0, 0, width, height);
      if (!data || data.length === 0) {
        raf.current = requestAnimationFrame(render);
        return;
      }

      // Determine visible slice
      const vzoom = clamp(smooth.current.zoom, 1, 100);
      const visibleCount = Math.max(2, Math.floor(data.length / vzoom));
      const startIdx = clamp(Math.floor(smooth.current.offset), 0, Math.max(0, data.length - visibleCount));
      const endIdx = Math.min(data.length, startIdx + visibleCount);
      const visible = data.slice(startIdx, endIdx);

      // Y scaling
      let min = Infinity, max = -Infinity;
      for (let i = 0; i < visible.length; i++) {
        const val = visible[i].value;
        if (val < min) min = val;
        if (val > max) max = val;
      }
      if (min === Infinity) min = 0;
      if (max === -Infinity) max = 1;
      const range = Math.max(0.0001, max - min);

      // Draw gridlines
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      const gridY = 4;
      for (let i = 0; i <= gridY; i++) {
        const y = (i / gridY) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // vertical grid: a few lines
      const gridX = 8;
      for (let i = 0; i <= gridX; i++) {
        const x = (i / gridX) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // prepare gradient stroke
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(11,132,255,0.95)');
      grad.addColorStop(1, 'rgba(0,240,255,0.6)');

      // draw filled area under curve (soft)
      ctx.beginPath();
      for (let i = 0; i < visible.length; i++) {
        const p = visible[i];
        const x = (i / Math.max(visible.length - 1, 1)) * width;
        const y = height - ((p.value - min) / range) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // close and fill
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
      fillGrad.addColorStop(0, 'rgba(11,132,255,0.12)');
      fillGrad.addColorStop(1, 'rgba(0,240,255,0.02)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // draw the line
      ctx.beginPath();
      for (let i = 0; i < visible.length; i++) {
        const p = visible[i];
        const x = (i / Math.max(visible.length - 1, 1)) * width;
        const y = height - ((p.value - min) / range) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // draw last point highlight
      const lastP = visible[visible.length - 1];
      const lastX = width;
      const lastY = height - ((lastP.value - min) / range) * height;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // if mouse hovering, draw vertical guide and small dot
      if (mousePos) {
        const mx = mousePos.x;
        const step = width / Math.max(visible.length - 1, 1);
        const idx = clamp(Math.round(mx / step), 0, visible.length - 1);
        const p = visible[idx];
        const px = idx * step;
        const py = height - ((p.value - min) / range) * height;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(11,132,255,0.95)';
        ctx.fill();
      }

      raf.current = requestAnimationFrame(render);
    };

    raf.current = requestAnimationFrame(render);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [data, width, height, dpr, zoom, offset]);

  // pointer events handled by parent control for zoom/pan

  return <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />;
});

export default LineChart;
