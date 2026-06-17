"use client";

import { useState, useEffect } from "react";
import { getTimeUntil } from "@/lib/film";

export function useCountdown(target: Date) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    setTime(getTimeUntil(target));
    const interval = setInterval(() => {
      setTime(getTimeUntil(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return time;
}
