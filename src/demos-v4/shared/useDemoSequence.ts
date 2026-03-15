import { useEffect, useRef, useState, useCallback } from "react";

interface Step {
  delay: number;
  action: () => void;
}

export function useDemoSequence(steps: Step[]) {
  const [phase, setPhase] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const remainingRef = useRef(0);
  const startedAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    if (pausedRef.current) return;
    const s = stepsRef.current;
    const i = indexRef.current;

    if (i >= s.length) {
      // Loop: restart after 2s pause
      remainingRef.current = 2000;
      startedAtRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        indexRef.current = 0;
        setPhase(0);
        scheduleNext();
      }, 2000);
      return;
    }

    const delay = remainingRef.current > 0 ? remainingRef.current : s[i].delay;
    remainingRef.current = 0;
    startedAtRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      setPhase(i + 1);
      s[i].action();
      indexRef.current = i + 1;
      scheduleNext();
    }, delay);
  }, []);

  const pause = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    const elapsed = Date.now() - startedAtRef.current;
    const s = stepsRef.current;
    const i = indexRef.current;
    const currentDelay = i >= s.length ? 2000 : (remainingRef.current > 0 ? remainingRef.current : s[i].delay);
    remainingRef.current = Math.max(0, currentDelay - elapsed);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    scheduleNext();
  }, [scheduleNext]);

  const restart = useCallback(() => {
    clearTimer();
    pausedRef.current = false;
    remainingRef.current = 0;
    indexRef.current = 0;
    setPhase(0);
    scheduleNext();
  }, [clearTimer, scheduleNext]);

  useEffect(() => {
    indexRef.current = 0;
    remainingRef.current = 0;
    scheduleNext();
    return clearTimer;
  }, [scheduleNext, clearTimer]);

  return { restart, phase, pause, resume };
}
