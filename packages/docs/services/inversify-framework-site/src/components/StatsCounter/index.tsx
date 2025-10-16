import React, { useEffect, useState } from 'react';

import styles from './styles.module.css';

const COUNTER_ANIMATION_DURATION_MS: number = 2000;
const COUNTER_ANIMATION_FRAME_MS: number = 16;

interface StatsCounterProps {
  label: string;
  suffix?: string;
  value: number;
}

export default function StatsCounter({
  label,
  suffix = '',
  value,
}: StatsCounterProps): React.JSX.Element {
  const [count, setCount]: [
    number,
    React.Dispatch<React.SetStateAction<number>>,
  ] = useState<number>(0);

  useEffect(() => {
    const duration: number = COUNTER_ANIMATION_DURATION_MS;
    const increment: number = value / (duration / COUNTER_ANIMATION_FRAME_MS);
    let current: number = 0;

    const timer: NodeJS.Timeout = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, COUNTER_ANIMATION_FRAME_MS);

    return () => {
      clearInterval(timer);
    };
  }, [value]);

  return (
    <div className={styles.statItem}>
      <div className={styles.statValue}>
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
