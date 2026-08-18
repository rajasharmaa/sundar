import React from 'react';
import CountUp from 'react-countup';

interface AnimatedCounterProps {
  value: string | number;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  // Extract optional prefix, numeric value, and optional suffix
  const match = String(value).match(/^(\D*)(\d+)(\D*)$/);
  
  if (!match) {
    // Fallback for non-numeric values
    return <span className={className}>{value}</span>;
  }

  const prefix = match[1] || '';
  const targetNumber = parseInt(match[2], 10);
  const suffix = match[3] || '';

  return (
    <span className={className}>
      <CountUp 
        start={0}
        end={targetNumber} 
        duration={2.5} 
        separator="," 
        prefix={prefix}
        suffix={suffix} 
        enableScrollSpy={true}
        scrollSpyOnce={true}
      />
    </span>
  );
}
