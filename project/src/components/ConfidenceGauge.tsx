import React, { useEffect, useRef } from 'react';

interface ConfidenceGaugeProps {
  value: number;
  label: string;
}

const ConfidenceGauge = ({ value, label }: ConfidenceGaugeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const isPub = label === 'PUB';
  const color = isPub ? '#ef4444' : '#10b981';
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // For retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw background arc
    const centerX = rect.width / 2;
    const centerY = rect.height - 10;
    const radius = rect.width / 2 - 10;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    
    // Background gauge
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
    
    // Value gauge
    const valueAngle = startAngle + (endAngle - startAngle) * (value / 100);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.lineWidth = 10;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${value}%`, centerX, centerY - 20);
    
    // Add label
    ctx.fillStyle = color;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(label, centerX, centerY - 45);
    
  }, [value, color, label]);

  return (
    <div className="flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={200}
        height={120}
        className="w-full max-w-[200px]"
      />
    </div>
  );
};

export default ConfidenceGauge;