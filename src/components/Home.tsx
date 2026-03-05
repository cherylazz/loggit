import { motion, AnimatePresence } from "motion/react";
import { Cloud, ArrowRight, Thermometer, Wind, Waves, Eye, Anchor, ChevronDown, MapPin, Binoculars, Ruler, StickyNote, Users } from "lucide-react";
import { useState } from "react";
import binocularsIcon from "figma:asset/cc369f8ff92cf33a90f00c520861310e3191ab17.png";
import weatherIcon from "figma:asset/1b1bffb92486ea65cef0bab5add8631aa363223e.png";
import type { ReminderStatus } from "./useWeatherReminder";

interface WeatherData {
  temperature: string;
  windSpeed: string;
  waveHeight: string;
  visibility: string;
  timestamp: string;
}

interface SightingData {
  species: string;
  count: number;
  timestamp: string;
}

interface HomeProps {
  onNavigate: (tab: string) => void;
  recentLogs: Array<{
    id: string;
    type: "weather" | "sighting";
    emoji: string;
    title: string;
    time: string;
    temperature?: string;
    windSpeed?: string;
    waveHeight?: string;
    visibility?: string;
    notes?: string;
    location?: string;
    species?: string;
    count?: number;
    behaviour?: string;
    distance?: number;
    photo?: string | null;
    crew?: string[];
  }>;
  weatherReminderEnabled: boolean;
  weatherSecondsRemaining: number | null;
  weatherReminderStatus: ReminderStatus;
  latestWeather: WeatherData | null;
  sightings: SightingData[];
  weatherLogCount: number;
}

// Jakub's enter recipe: opacity + translateY + blur + spring bounce:0
const enterVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      duration: 0.45,
      bounce: 0,
      delay: i * 0.06,
    },
  }),
};

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

/* ─── Countdown Tile ─── compact square tile with progress ring ─── */
function CountdownTile({
  secondsRemaining,
  onNavigate,
}: {
  secondsRemaining: number;
  onNavigate: () => void;
}) {
  const { minutes, seconds } = formatCountdown(secondsRemaining);
  const totalDuration = 30 * 60;
  const progress = 1 - secondsRemaining / totalDuration;
  const isUrgent = secondsRemaining <= 120;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <motion.button
      onClick={onNavigate}
      whileTap={{ scale: 0.97 }}
      className="w-full bg-white rounded-3xl p-5 shadow-card border border-alice-blue flex flex-col items-center gap-3 min-h-[150px] justify-center text-center transition-colors duration-150 hover:border-sky-blue"
    >
      <div className="relative w-16 h-16 shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#E1F2FE"
            strokeWidth="4"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={isUrgent ? "#98D2EB" : "#B2B1CF"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={weatherIcon} alt="Weather" className="w-8 h-8" />
        </div>
      </div>

      <div>
        <span
          className={`text-xl tabular-nums ${
            isUrgent ? "text-sky-blue" : "text-[#1A1A1A]"
          }`}
        >
          {minutes}:{seconds}
        </span>
        <p className="text-periwinkle text-sm mt-1">Log Weather</p>
      </div>
    </motion.button>
  );
}

/* ─── First Log Nudge Tile ─── compact square tile ─── */
function FirstLogNudgeTile({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.button
      onClick={onNavigate}
      whileTap={{ scale: 0.97 }}
      className="w-full bg-white rounded-3xl p-5 shadow-card border border-sky-blue/40 flex flex-col items-center gap-3 min-h-[150px] justify-center text-center transition-colors duration-150 hover:border-sky-blue"
    >
      <div className="relative w-16 h-16 shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={28}
            fill="none"
            stroke="#E1F2FE"
            strokeWidth="4"
            strokeDasharray="6 4"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={weatherIcon} alt="Weather" className="w-8 h-8" />
        </div>
      </div>

      <div>
        <p className="text-sm text-[#1A1A1A]">First weather</p>
        <p className="text-periwinkle text-sm mt-1">Log Weather</p>
      </div>
    </motion.button>
  );
}

/* ─── Overdue Tile ─── compact square tile ─── */
function OverdueTile({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.button
      onClick={onNavigate}
      whileTap={{ scale: 0.97 }}
      className="w-full bg-white rounded-3xl p-5 shadow-card border border-sky-blue flex flex-col items-center gap-3 min-h-[150px] justify-center text-center transition-colors duration-150 hover:border-sky-blue"
    >
      <div className="relative w-16 h-16 shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={28}
            fill="none"
            stroke="#98D2EB"
            strokeWidth="4"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={weatherIcon} alt="Weather" className="w-8 h-8" />
        </div>
      </div>

      <div>
        <p className="text-sm text-sky-blue">Overdue!</p>
        <p className="text-periwinkle text-sm mt-1">Log Weather</p>
      </div>
    </motion.button>
  );
}

/* ─── Current Weather Card ─── full-width rectangle above grid ─── */
function CurrentWeatherCard({ weather }: { weather: WeatherData }) {
  const visibilityLabel =
    weather.visibility.charAt(0).toUpperCase() + weather.visibility.slice(1);
  const date = new Date(weather.timestamp);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-alice-blue">
      <div className="flex items-center gap-2 mb-4">
        <Cloud size={18} className="text-periwinkle" strokeWidth={1.5} />
        <span className="text-gray-600 text-sm">Current conditions</span>
        <span className="text-xs text-gray-400 ml-auto">as of {timeStr}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col items-center gap-1.5 bg-alice-blue/40 rounded-xl py-3 px-2">
          <Thermometer size={16} className="text-periwinkle" strokeWidth={1.5} />
          <span className="text-sm text-[#1A1A1A]">{weather.temperature}°C</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 bg-alice-blue/40 rounded-xl py-3 px-2">
          <Wind size={16} className="text-periwinkle" strokeWidth={1.5} />
          <span className="text-sm text-[#1A1A1A]">{weather.windSpeed} kts</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 bg-alice-blue/40 rounded-xl py-3 px-2">
          <Waves size={16} className="text-periwinkle" strokeWidth={1.5} />
          <span className="text-sm text-[#1A1A1A]">{weather.waveHeight} m</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 bg-alice-blue/40 rounded-xl py-3 px-2">
          <Eye size={16} className="text-periwinkle" strokeWidth={1.5} />
          <span className="text-sm text-[#1A1A1A] truncate">{visibilityLabel}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Sighting Metrics ─── */
function SightingMetrics({
  sightings,
  onNavigate,
}: {
  sightings: SightingData[];
  onNavigate: () => void;
}) {
  const totalAnimals = sightings.reduce((sum, s) => sum + s.count, 0);
  const uniqueSpecies = new Set(sightings.map((s) => s.species)).size;

  // Top species by total count
  const speciesCounts: Record<string, number> = {};
  sightings.forEach((s) => {
    speciesCounts[s.species] = (speciesCounts[s.species] || 0) + s.count;
  });
  const topSpecies = Object.entries(speciesCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <motion.div
      variants={enterVariants}
      initial="hidden"
      animate="visible"
      custom={5}
    >
      <h3 className="text-gray-600 mb-4">Sighting stats</h3>

      {sightings.length === 0 ? (
        <motion.button
          onClick={onNavigate}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-alice-blue/30 rounded-2xl p-6 text-center text-gray-500 border border-dashed border-periwinkle/30"
        >
          <Anchor size={24} className="text-periwinkle/40 mx-auto mb-2" strokeWidth={1.5} />
          No sightings yet - go spot something!
        </motion.button>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-card border border-alice-blue">
          {/* Summary row */}
          <div className="flex gap-4 mb-5">
            <div className="flex-1 bg-alice-blue/40 rounded-xl p-3 text-center">
              <p className="text-2xl text-[#1A1A1A] tabular-nums">{sightings.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Sightings</p>
            </div>
            <div className="flex-1 bg-alice-blue/40 rounded-xl p-3 text-center">
              <p className="text-2xl text-[#1A1A1A] tabular-nums">{totalAnimals}</p>
              <p className="text-xs text-gray-400 mt-0.5">Animals</p>
            </div>
            <div className="flex-1 bg-alice-blue/40 rounded-xl p-3 text-center">
              <p className="text-2xl text-[#1A1A1A] tabular-nums">{uniqueSpecies}</p>
              <p className="text-xs text-gray-400 mt-0.5">Species</p>
            </div>
          </div>

          {/* Top species */}
          {topSpecies.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-3">Top species</p>
              <div className="space-y-2">
                {topSpecies.map(([species, count], idx) => (
                  <motion.div
                    key={species}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      bounce: 0,
                      delay: 0.3 + idx * 0.06,
                    }}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                        style={{
                          backgroundColor:
                            idx === 0
                              ? "#B2B1CF"
                              : idx === 1
                              ? "#98D2EB"
                              : "#c8c7de",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm text-[#1A1A1A] truncate">
                        {species}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 tabular-nums ml-3">
                      {count} {count === 1 ? "sighting" : "sightings"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Home Screen ─── */
export function Home({
  onNavigate,
  recentLogs,
  weatherReminderEnabled,
  weatherSecondsRemaining,
  weatherReminderStatus,
  latestWeather,
  sightings,
  weatherLogCount,
}: HomeProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const timerActive =
    weatherReminderStatus === "nudgeFirst" ||
    weatherReminderStatus === "counting" ||
    weatherReminderStatus === "overdue";

  return (
    <div className="pb-28 px-6 pt-16">
      <div className="max-w-md mx-auto">
        <motion.h1
          className="mb-2"
          variants={enterVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Hey there, Captain! 👋
        </motion.h1>
        <motion.p
          className="text-gray-500 mb-10"
          variants={enterVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          What are we logging today?
        </motion.p>

        {/* Action tiles */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Left tile: Log Weather OR Timer state */}
          <motion.div
            variants={enterVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <AnimatePresence mode="wait">
              {weatherReminderStatus === "counting" &&
                weatherSecondsRemaining !== null ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                >
                  <CountdownTile
                    secondsRemaining={weatherSecondsRemaining}
                    onNavigate={() => onNavigate("weather")}
                  />
                </motion.div>
              ) : weatherReminderStatus === "nudgeFirst" ? (
                <motion.div
                  key="nudge"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                >
                  <FirstLogNudgeTile onNavigate={() => onNavigate("weather")} />
                </motion.div>
              ) : weatherReminderStatus === "overdue" ? (
                <motion.div
                  key="overdue"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                >
                  <OverdueTile onNavigate={() => onNavigate("weather")} />
                </motion.div>
              ) : (
                <motion.button
                  key="log-weather"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate("weather")}
                  className="w-full bg-white rounded-3xl p-6 shadow-card border border-alice-blue flex flex-col items-center gap-3 min-h-[150px] justify-center text-center transition-colors duration-150 hover:border-sky-blue"
                >
                  <img
                    src={weatherIcon}
                    alt="Weather Icon"
                    className="w-14 h-14"
                  />
                  <div>
                    <p className="text-xl text-[#1A1A1A] tabular-nums">{weatherLogCount}</p>
                    <p className="text-periwinkle text-sm mt-1">Log Weather</p>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right tile: Log Sighting - always available */}
          <motion.button
            variants={enterVariants}
            initial="hidden"
            animate="visible"
            custom={3}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("sightings")}
            className="bg-white rounded-3xl p-6 shadow-card border border-alice-blue flex flex-col items-center gap-3 min-h-[150px] justify-center text-center transition-colors duration-150 hover:border-sky-blue"
          >
            <img
              src={binocularsIcon}
              alt="Binoculars Icon"
              className="w-14 h-14"
            />
            <div>
              <p className="text-xl text-[#1A1A1A] tabular-nums">{sightings.length}</p>
              <p className="text-periwinkle text-sm mt-1">Log Sighting</p>
            </div>
          </motion.button>
        </div>

        {/* Current conditions - full-width rectangle below grid when timer is active */}
        <AnimatePresence>
          {timerActive && latestWeather && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)", height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", height: "auto", marginBottom: 40 }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)", height: 0, marginBottom: 0 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0 }}
            >
              <CurrentWeatherCard weather={latestWeather} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sighting Metrics */}
        <div className="mb-10">
          <SightingMetrics
            sightings={sightings}
            onNavigate={() => onNavigate("sightings")}
          />
        </div>

        {/* Recent Logs */}
        <motion.div
          variants={enterVariants}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          <h3 className="text-gray-600 mb-5">Recent logs</h3>
          {recentLogs.length === 0 ? (
            <div className="bg-alice-blue/30 rounded-2xl p-8 text-center text-gray-500">
              No logs yet. Let's make a few.
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log, index) => {
                const isExpanded = expandedLogId === log.id;
                const isWeather = log.type === "weather";
                const accentColor = isWeather ? "#98D2EB" : "#B2B1CF";
                const accentBg = isWeather ? "bg-sky-blue/10" : "bg-periwinkle/10";
                const visLabel = log.visibility
                  ? log.visibility.charAt(0).toUpperCase() + log.visibility.slice(1)
                  : "";

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      type: "spring",
                      duration: 0.45,
                      bounce: 0,
                      delay: 0.3 + index * 0.06,
                    }}
                    className="bg-white rounded-2xl shadow-card border border-alice-blue overflow-hidden"
                  >
                    {/* Clickable header */}
                    <button
                      onClick={() =>
                        setExpandedLogId(isExpanded ? null : log.id)
                      }
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}20` }}
                      >
                        <span className="text-xl">{log.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A1A1A] truncate">{log.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {log.time}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{
                          type: "spring",
                          duration: 0.3,
                          bounce: 0,
                        }}
                      >
                        <ChevronDown
                          size={18}
                          className="text-gray-300"
                          strokeWidth={1.5}
                        />
                      </motion.div>
                    </button>

                    {/* Expandable detail panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            duration: 0.4,
                            bounce: 0,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-5">
                            {/* Accent divider */}
                            <div
                              className="h-px mb-4"
                              style={{
                                background: `linear-gradient(to right, ${accentColor}40, transparent)`,
                              }}
                            />

                            {isWeather ? (
                              /* ─── Weather detail infographic ─── */
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className={`${accentBg} rounded-xl p-3 flex items-center gap-3`}>
                                    <Thermometer size={18} style={{ color: accentColor }} strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs text-gray-400">Temp</p>
                                      <p className="text-[#1A1A1A] tabular-nums">{log.temperature}°C</p>
                                    </div>
                                  </div>
                                  <div className={`${accentBg} rounded-xl p-3 flex items-center gap-3`}>
                                    <Wind size={18} style={{ color: accentColor }} strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs text-gray-400">Wind</p>
                                      <p className="text-[#1A1A1A] tabular-nums">{log.windSpeed} kts</p>
                                    </div>
                                  </div>
                                  <div className={`${accentBg} rounded-xl p-3 flex items-center gap-3`}>
                                    <Waves size={18} style={{ color: accentColor }} strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs text-gray-400">Waves</p>
                                      <p className="text-[#1A1A1A] tabular-nums">{log.waveHeight} m</p>
                                    </div>
                                  </div>
                                  <div className={`${accentBg} rounded-xl p-3 flex items-center gap-3`}>
                                    <Eye size={18} style={{ color: accentColor }} strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs text-gray-400">Visibility</p>
                                      <p className="text-[#1A1A1A]">{visLabel}</p>
                                    </div>
                                  </div>
                                </div>
                                {log.location && (
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <MapPin size={12} strokeWidth={1.5} />
                                    <span>{log.location}</span>
                                  </div>
                                )}
                                {log.notes && (
                                  <div className="flex items-start gap-2 bg-alice-blue/30 rounded-xl p-3">
                                    <StickyNote size={14} className="text-gray-400 mt-0.5 shrink-0" strokeWidth={1.5} />
                                    <p className="text-sm text-gray-600">{log.notes}</p>
                                  </div>
                                )}
                                {log.crew && log.crew.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <Users size={14} className="text-sky-blue mt-0.5 shrink-0" strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs text-gray-400 mb-1.5">Observers</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {[...log.crew].sort((a: string, b: string) => a.localeCompare(b)).map((name: string) => (
                                          <span key={name} className="bg-sky-blue/10 text-sky-700 rounded-full px-2.5 py-0.5 text-xs">
                                            {name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* ─── Sighting detail infographic ─── */
                              <div className="space-y-4">
                                {log.photo && (
                                  <div className="rounded-xl overflow-hidden">
                                    <img src={log.photo} alt={log.species} className="w-full h-40 object-cover" />
                                  </div>
                                )}
                                <div className="grid grid-cols-3 gap-2.5">
                                  <div className={`${accentBg} rounded-xl p-3 text-center`}>
                                    <Binoculars size={16} className="mx-auto mb-1.5" style={{ color: accentColor }} strokeWidth={1.5} />
                                    <p className="text-xs text-gray-400">Count</p>
                                    <p className="text-[#1A1A1A] tabular-nums">{log.count ?? 1}</p>
                                  </div>
                                  <div className={`${accentBg} rounded-xl p-3 text-center`}>
                                    <Ruler size={16} className="mx-auto mb-1.5" style={{ color: accentColor }} strokeWidth={1.5} />
                                    <p className="text-xs text-gray-400">Distance</p>
                                    <p className="text-[#1A1A1A] tabular-nums">{log.distance ?? "-"} m</p>
                                  </div>
                                  <div className={`${accentBg} rounded-xl p-3 text-center`}>
                                    <ArrowRight size={16} className="mx-auto mb-1.5" style={{ color: accentColor }} strokeWidth={1.5} />
                                    <p className="text-xs text-gray-400">Behaviour</p>
                                    <p className="text-[#1A1A1A] text-sm capitalize truncate">{log.behaviour ?? "-"}</p>
                                  </div>
                                </div>
                                {log.notes && (
                                  <div className="flex items-start gap-2 bg-alice-blue/30 rounded-xl p-3">
                                    <StickyNote size={14} className="text-gray-400 mt-0.5 shrink-0" strokeWidth={1.5} />
                                    <p className="text-sm text-gray-600">{log.notes}</p>
                                  </div>
                                )}
                                {log.crew && log.crew.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <Users size={14} className="text-periwinkle mt-0.5 shrink-0" strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs text-gray-400 mb-1.5">Spotted by</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {[...log.crew].sort((a: string, b: string) => a.localeCompare(b)).map((name: string) => (
                                          <span key={name} className="bg-periwinkle/10 text-periwinkle rounded-full px-2.5 py-0.5 text-xs">
                                            {name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}