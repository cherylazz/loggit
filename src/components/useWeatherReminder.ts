import { useState, useEffect, useRef, useCallback } from "react";

const REMINDER_KEY = "loggit-weather-reminder";
const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const FIRST_LOG_NUDGE_DELAY = 15 * 1000; // 15 seconds

export type ReminderStatus =
  | "off"               // reminders disabled
  | "waitingForFirst"   // enabled, no weather log yet, <15s elapsed
  | "nudgeFirst"        // enabled, no weather log yet, 15s+ elapsed → show nudge
  | "counting"          // enabled, weather log exists, counting down
  | "overdue";          // countdown reached 0, hasn't logged yet

export function useWeatherReminder(
  onNavigateToWeather: () => void,
  lastWeatherLogTimestamp: string | null // ISO timestamp of most recent weather log
) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(REMINDER_KEY);
    return stored === "true";
  });
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });
  const [showInAppReminder, setShowInAppReminder] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [status, setStatus] = useState<ReminderStatus>("off");

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledAtRef = useRef<number>(Date.now());
  const hasNotifiedRef = useRef(false);

  // Persist preference
  useEffect(() => {
    localStorage.setItem(REMINDER_KEY, String(enabled));
  }, [enabled]);

  // Track when reminders were enabled (for 15s nudge delay)
  useEffect(() => {
    if (enabled) {
      enabledAtRef.current = Date.now();
      hasNotifiedRef.current = false;
    }
  }, [enabled]);

  // Compute deadline from last weather log
  const getDeadline = useCallback((): number | null => {
    if (!lastWeatherLogTimestamp) return null;
    return new Date(lastWeatherLogTimestamp).getTime() + INTERVAL_MS;
  }, [lastWeatherLogTimestamp]);

  // Send system + in-app notification
  const sendReminder = useCallback(() => {
    if (hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;

    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const notification = new Notification("Time for a weather check! 🌤", {
          body: "It's been 30 minutes. Tap to log current conditions.",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌤</text></svg>",
          tag: "weather-reminder",
          requireInteraction: false,
        });
        notification.onclick = () => {
          window.focus();
          onNavigateToWeather();
          notification.close();
        };
      } catch {
        setShowInAppReminder(true);
      }
    }
    setShowInAppReminder(true);
  }, [onNavigateToWeather]);

  // When lastWeatherLogTimestamp changes (new log saved), reset notification flag
  useEffect(() => {
    if (lastWeatherLogTimestamp) {
      hasNotifiedRef.current = false;
      setShowInAppReminder(false);
    }
  }, [lastWeatherLogTimestamp]);

  // Main tick: compute status + secondsRemaining every second
  useEffect(() => {
    if (!enabled) {
      setStatus("off");
      setSecondsRemaining(null);
      if (tickRef.current) clearInterval(tickRef.current);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      return;
    }

    const tick = () => {
      const deadline = getDeadline();

      if (!deadline) {
        // No weather log exists yet
        const elapsed = Date.now() - enabledAtRef.current;
        if (elapsed >= FIRST_LOG_NUDGE_DELAY) {
          setStatus("nudgeFirst");
        } else {
          setStatus("waitingForFirst");
        }
        setSecondsRemaining(null);
        return;
      }

      // Weather log exists - count down to deadline
      const diffMs = deadline - Date.now();
      const diffSec = Math.round(diffMs / 1000);

      if (diffSec <= 0) {
        setStatus("overdue");
        setSecondsRemaining(0);
        sendReminder();
      } else {
        setStatus("counting");
        setSecondsRemaining(diffSec);
      }
    };

    tick();
    tickRef.current = setInterval(tick, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [enabled, getDeadline, sendReminder]);

  // Separate timer for the 15s nudge transition (so it fires even between ticks)
  useEffect(() => {
    if (enabled && !lastWeatherLogTimestamp) {
      nudgeTimerRef.current = setTimeout(() => {
        setStatus("nudgeFirst");
      }, FIRST_LOG_NUDGE_DELAY);
    }
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [enabled, lastWeatherLogTimestamp]);

  const toggleReminder = useCallback(async () => {
    if (!enabled) {
      if ("Notification" in window && Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [enabled]);

  const dismissInAppReminder = useCallback(() => {
    setShowInAppReminder(false);
  }, []);

  const handleReminderAction = useCallback(() => {
    setShowInAppReminder(false);
    onNavigateToWeather();
  }, [onNavigateToWeather]);

  return {
    enabled,
    status,
    notificationPermission,
    showInAppReminder,
    secondsRemaining,
    toggleReminder,
    dismissInAppReminder,
    handleReminderAction,
  };
}