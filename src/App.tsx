import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "./components/BottomNav";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { VoiceTranscriptionSheet } from "./components/VoiceTranscriptionSheet";
import { getSpeciesEmoji } from "./components/speciesEmoji";
import { SplashScreen } from "./components/SplashScreen";
import { CrewSetupScreen } from "./components/CrewSetupScreen";
import { Home } from "./components/Home";
import { WeatherLog } from "./components/WeatherLog";
import { SightingLog } from "./components/SightingLog";
import { Logs } from "./components/Logs";
import { Settings } from "./components/Settings";
import { WeatherReminderBanner } from "./components/WeatherReminderBanner";
import { useWeatherReminder } from "./components/useWeatherReminder";
import { LockScreen } from "./components/LockScreen";
import { getAllLogs, addLog, deleteLog, updateLog, clearAllLogs, migrateFromLocalStorage } from "./lib/db";

interface Log {
  id: string;
  type: "weather" | "sighting";
  timestamp: string;
  [key: string]: any;
}

export default function App() {
  // One-time fresh start: bump version to clear stale data from previous builds
  // Version 4: IDB migration — don't clear loggit-logs here, migrateFromLocalStorage handles it
  const APP_VERSION = "4";
  if (localStorage.getItem("loggit-version") !== APP_VERSION) {
    const prev = localStorage.getItem("loggit-version");
    if (prev && prev < "4") {
      // Upgrading from v3 — only clear non-log data, logs migrate via IDB
      localStorage.removeItem("loggit-weather-reminder");
      localStorage.removeItem("loggit-saved-crew");
    } else if (!prev) {
      // Fresh install
      localStorage.removeItem("loggit-logs");
      localStorage.removeItem("loggit-weather-reminder");
      localStorage.removeItem("loggit-saved-crew");
    }
    localStorage.setItem("loggit-version", APP_VERSION);
  }

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem("loggit-auth") === "true";
  });
  const [currentTab, setCurrentTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tab || "home";
  });
  const [showVoiceTranscription, setShowVoiceTranscription] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showCrewSetup, setShowCrewSetup] = useState(false);
  const [crewMembers, setCrewMembers] = useState<string[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsReady, setLogsReady] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState<{
    text: string;
    type: "weather" | "sighting";
  } | null>(null);

  const navigateToWeather = useCallback(() => {
    setCurrentTab("weather");
  }, []);

  // Find the most recent weather log timestamp
  const lastWeatherLogTimestamp = logs.find(
    (log) => log.type === "weather"
  )?.timestamp ?? null;

  const weatherReminder = useWeatherReminder(navigateToWeather, lastWeatherLogTimestamp);

  // Load logs from IndexedDB on mount (migrating from localStorage if needed)
  useEffect(() => {
    (async () => {
      await migrateFromLocalStorage();
      const allLogs = await getAllLogs();
      setLogs(allLogs);
      setLogsReady(true);
    })();
  }, []);

  const handleSaveLog = async (data: any) => {
    const newLog = {
      id: Date.now().toString(),
      ...data,
    };
    await addLog(newLog);
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteLog = async (id: string) => {
    await deleteLog(id);
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleUpdateLog = async (id: string, updatedData: any) => {
    await updateLog(id, updatedData);
    setLogs((prev) => prev.map((log) => (log.id === id ? { ...log, ...updatedData } : log)));
  };

  const handleQuickAction = (
    action: "weather" | "sighting",
  ) => {
    if (action === "weather") {
      setCurrentTab("weather");
    } else {
      setCurrentTab("sightings");
    }
  };

  const handleTranscriptionComplete = (
    transcript: string,
    logType: "weather" | "sighting"
  ) => {
    setPendingTranscript({ text: transcript, type: logType });
    if (logType === "weather") {
      setCurrentTab("weather");
    } else {
      setCurrentTab("sightings");
    }
  };

  const clearPendingTranscript = () => {
    setPendingTranscript(null);
  };

  const handleResetJourney = async () => {
    // Clear all persisted data
    await clearAllLogs();
    localStorage.removeItem("loggit-logs");
    localStorage.removeItem("loggit-saved-crew");
    localStorage.removeItem("loggit-weather-reminder");
    localStorage.removeItem("loggit-weather-cache");
    localStorage.removeItem("loggit-version");
    // Clear session auth so lock screen reappears
    sessionStorage.removeItem("loggit-auth");
    // Reset all in-memory state
    setLogs([]);
    setCrewMembers([]);
    setCurrentTab("home");
    setIsUnlocked(false);
    setShowSplash(true);
    setShowCrewSetup(false);
    setPendingTranscript(null);
  };

  const getRecentLogs = () => {
    return logs.slice(0, 5).map((log) => {
      const date = new Date(log.timestamp);
      const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: log.id,
        type: log.type,
        emoji: log.type === "weather" ? "🌤" : getSpeciesEmoji(log.species || ""),
        title:
          log.type === "weather"
            ? `${log.temperature}°C, ${log.windSpeed}kts`
            : log.species,
        time: `${date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} • ${time}`,
        // Full data for detail view
        temperature: log.temperature,
        windSpeed: log.windSpeed,
        waveHeight: log.waveHeight,
        visibility: log.visibility,
        notes: log.notes,
        location: log.location,
        species: log.species,
        count: log.count,
        behaviour: log.behaviour,
        distance: log.distance,
        photo: log.photo,
        crew: log.crew,
      };
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Lock Screen */}
      <AnimatePresence>
        {!isUnlocked && (
          <LockScreen onUnlock={() => setIsUnlocked(true)} />
        )}
      </AnimatePresence>

      {/* Splash Screen */}
      <AnimatePresence>
        {isUnlocked && showSplash && (
          <SplashScreen onComplete={() => {
            setShowSplash(false);
            setShowCrewSetup(true);
          }} />
        )}
      </AnimatePresence>

      {/* Crew Setup Screen */}
      <AnimatePresence>
        {showCrewSetup && (
          <CrewSetupScreen
            onComplete={(crew) => {
              setCrewMembers(crew);
              setShowCrewSetup(false);
              // Save crew names to localStorage for future sessions
              const saved = localStorage.getItem("loggit-saved-crew");
              const existing: string[] = saved ? JSON.parse(saved) : [];
              const merged = Array.from(new Set([...existing, ...crew]));
              localStorage.setItem("loggit-saved-crew", JSON.stringify(merged));
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile container */}
      <div className="max-w-md mx-auto min-h-screen relative bg-white shadow-2xl">
        {/* Content */}
        <div
          className="overflow-y-auto overscroll-y-contain"
          style={{ height: "100dvh", WebkitOverflowScrolling: "touch" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            >
              {currentTab === "home" && (
                <Home
                  onNavigate={setCurrentTab}
                  recentLogs={getRecentLogs()}
                  weatherReminderEnabled={weatherReminder.enabled}
                  weatherSecondsRemaining={weatherReminder.secondsRemaining}
                  weatherReminderStatus={weatherReminder.status}
                  latestWeather={(() => {
                    const latest = logs.find((l) => l.type === "weather");
                    if (!latest) return null;
                    return {
                      temperature: latest.temperature,
                      windSpeed: latest.windSpeed,
                      waveHeight: latest.waveHeight,
                      visibility: latest.visibility,
                      timestamp: latest.timestamp,
                    };
                  })()}
                  sightings={logs
                    .filter((l) => l.type === "sighting")
                    .map((l) => ({
                      species: l.species,
                      count: l.count ?? 1,
                      timestamp: l.timestamp,
                    }))}
                  weatherLogCount={logs.filter((l) => l.type === "weather").length}
                />
              )}
              {currentTab === "weather" && (
                <WeatherLog 
                  onSave={handleSaveLog}
                  onNavigateHome={() => setCurrentTab("home")}
                  pendingTranscript={
                    pendingTranscript?.type === "weather"
                      ? pendingTranscript.text
                      : undefined
                  }
                  clearPendingTranscript={clearPendingTranscript}
                  crewMembers={crewMembers}
                />
              )}
              {currentTab === "sightings" && (
                <SightingLog 
                  onSave={handleSaveLog}
                  onNavigateHome={() => setCurrentTab("home")}
                  pendingTranscript={
                    pendingTranscript?.type === "sighting"
                      ? pendingTranscript.text
                      : undefined
                  }
                  clearPendingTranscript={clearPendingTranscript}
                  crewMembers={crewMembers}
                />
              )}
              {currentTab === "logs" && (
                <Logs logs={logs} onDelete={handleDeleteLog} onUpdate={handleUpdateLog} crewMembers={crewMembers} />
              )}
              {currentTab === "settings" && (
                <Settings
                  weatherReminderEnabled={weatherReminder.enabled}
                  onToggleWeatherReminder={weatherReminder.toggleReminder}
                  notificationPermission={weatherReminder.notificationPermission}
                  logs={logs}
                  onResetJourney={handleResetJourney}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
        />

        {/* Floating Action Button */}
        {currentTab === "home" && (
          <FloatingActionButton
            onClick={() => setShowVoiceTranscription(true)}
          />
        )}

        {/* Weather Reminder Banner */}
        <AnimatePresence>
          {weatherReminder.showInAppReminder && !showSplash && !showCrewSetup && (
            <WeatherReminderBanner
              onLogWeather={weatherReminder.handleReminderAction}
              onDismiss={weatherReminder.dismissInAppReminder}
            />
          )}
        </AnimatePresence>

        {/* Voice Transcription Sheet */}
        <VoiceTranscriptionSheet
          isOpen={showVoiceTranscription}
          onClose={() => setShowVoiceTranscription(false)}
          onTranscriptionComplete={handleTranscriptionComplete}
        />
      </div>
    </div>
  );
}