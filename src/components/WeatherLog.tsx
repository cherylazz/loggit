import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, CheckCircle, CloudDownload, RefreshCw, Clock } from "lucide-react";
import { Users } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import weatherIcon from "figma:asset/1b1bffb92486ea65cef0bab5add8631aa363223e.png";

interface WeatherLogProps {
  onSave: (data: any) => void;
  onNavigateHome: () => void;
  pendingTranscript?: string;
  clearPendingTranscript?: () => void;
  crewMembers?: string[];
}

// Convert weather code to visibility estimate
function weatherCodeToVisibility(code: number): string {
  if (code <= 1) return "excellent";
  if (code <= 3) return "good";
  if (code <= 48) return "moderate"; // fog codes
  if (code <= 67) return "poor"; // rain/drizzle
  if (code <= 77) return "poor"; // snow
  return "moderate";
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

const WEATHER_CACHE_KEY = "loggit-weather-cache";

interface WeatherCache {
  timestamp: number;
  data: {
    temperature: string;
    windSpeed: string;
    waveHeight: string;
    visibility: string;
  };
}

export function WeatherLog({ onSave, onNavigateHome, pendingTranscript, clearPendingTranscript, crewMembers = [] }: WeatherLogProps) {
  const isOnline = useOnlineStatus();
  const pendingRetryRef = useRef(false);

  const [formData, setFormData] = useState({
    location: "Getting location...",
    temperature: "",
    windSpeed: "",
    waveHeight: "",
    visibility: "good",
    notes: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [autoFetchStatus, setAutoFetchStatus] = useState<"idle" | "fetching" | "success" | "error" | "cached">("idle");
  const [cachedTime, setCachedTime] = useState<number | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Get real GPS location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(4)}° ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? "E" : "W"}`,
          }));
        },
        () => {
          // Fallback coordinates (mid-ocean)
          setCoords({ lat: 37.7749, lon: -122.4194 });
          setFormData((prev) => ({
            ...prev,
            location: "37.7749° N, 122.4194° W",
          }));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setCoords({ lat: 37.7749, lon: -122.4194 });
      setFormData((prev) => ({
        ...prev,
        location: "37.7749° N, 122.4194° W",
      }));
    }
  }, []);

  // Load from cache when offline
  const loadFromCache = () => {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (!raw) return false;
      const cache: WeatherCache = JSON.parse(raw);
      const filled = new Set<string>();
      const updates: Partial<typeof formData> = {};
      if (cache.data.temperature) { updates.temperature = cache.data.temperature; filled.add("temperature"); }
      if (cache.data.windSpeed) { updates.windSpeed = cache.data.windSpeed; filled.add("windSpeed"); }
      if (cache.data.waveHeight) { updates.waveHeight = cache.data.waveHeight; filled.add("waveHeight"); }
      if (cache.data.visibility) { updates.visibility = cache.data.visibility; filled.add("visibility"); }
      setFormData((prev) => ({ ...prev, ...updates }));
      setAutoFilledFields(filled);
      setCachedTime(cache.timestamp);
      setAutoFetchStatus("cached");
      return true;
    } catch {
      return false;
    }
  };

  // Auto-fetch weather once we have coordinates
  useEffect(() => {
    if (coords) {
      if (!isOnline) {
        if (!loadFromCache()) {
          setAutoFetchStatus("error");
        }
        pendingRetryRef.current = true;
      } else {
        fetchWeather(coords.lat, coords.lon);
      }
    }
  }, [coords]);

  // Retry when coming back online
  useEffect(() => {
    if (isOnline && pendingRetryRef.current && coords) {
      pendingRetryRef.current = false;
      fetchWeather(coords.lat, coords.lon);
    }
  }, [isOnline]);

  const fetchWeather = async (lat: number, lon: number) => {
    setAutoFetchStatus("fetching");
    try {
      // Fetch atmospheric weather
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code,visibility&wind_speed_unit=kn`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      const filled = new Set<string>();
      const updates: Partial<typeof formData> = {};

      if (weatherData.current) {
        const c = weatherData.current;
        if (c.temperature_2m != null) {
          updates.temperature = String(Math.round(c.temperature_2m));
          filled.add("temperature");
        }
        if (c.wind_speed_10m != null) {
          updates.windSpeed = String(Math.round(c.wind_speed_10m));
          filled.add("windSpeed");
        }
        if (c.weather_code != null) {
          updates.visibility = weatherCodeToVisibility(c.weather_code);
          filled.add("visibility");
        }
      }

      // Try marine API for wave height
      try {
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height`;
        const marineRes = await fetch(marineUrl);
        const marineData = await marineRes.json();
        if (marineData.current?.wave_height != null) {
          updates.waveHeight = String(marineData.current.wave_height);
          filled.add("waveHeight");
        }
      } catch {
        // Marine data not available for all locations - that's okay
      }

      setFormData((prev) => ({ ...prev, ...updates }));
      setAutoFilledFields(filled);
      setAutoFetchStatus("success");
      setCachedTime(null);

      // Cache the fetched data
      const cache: WeatherCache = {
        timestamp: Date.now(),
        data: {
          temperature: updates.temperature || "",
          windSpeed: updates.windSpeed || "",
          waveHeight: updates.waveHeight || "",
          visibility: updates.visibility || "",
        },
      };
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // If fetch fails, try loading from cache
      if (!loadFromCache()) {
        setAutoFetchStatus("error");
      }
      pendingRetryRef.current = true;
    }
  };

  const handleRefresh = () => {
    if (coords) {
      fetchWeather(coords.lat, coords.lon);
    }
  };

  // Track manual edits - remove auto-filled indicator when user changes a field
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (autoFilledFields.has(field)) {
      setAutoFilledFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      timestamp: new Date().toISOString(),
      type: "weather",
      crew: selectedCrew,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        location: "37.7749° N, 122.4194° W",
        temperature: "",
        windSpeed: "",
        waveHeight: "",
        visibility: "good",
        notes: "",
      });
      onNavigateHome();
    }, 2200);
  };

  return (
    <div className="pb-28 px-6 pt-14">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1>Weather check</h1>
          <img
            src={weatherIcon}
            alt="Weather Icon"
            className="w-9 h-9"
          />
        </div>

        {/* Auto-fetch status banner */}
        <AnimatePresence>
          {autoFetchStatus === "fetching" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 bg-alice-blue/60 rounded-2xl px-4 py-3 mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              >
                <RefreshCw size={16} className="text-sky-blue" />
              </motion.div>
              <span className="text-sm text-gray-500">Fetching live weather data…</span>
            </motion.div>
          )}
          {autoFetchStatus === "success" && autoFilledFields.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between bg-sky-blue/10 rounded-2xl px-4 py-3 mb-6"
            >
              <div className="flex items-center gap-2">
                <CloudDownload size={16} className="text-sky-blue" />
                <span className="text-sm text-gray-600">
                  Auto-filled from live data. Edit anything below
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="text-sky-blue p-1"
                aria-label="Refresh weather data"
              >
                <RefreshCw size={14} />
              </button>
            </motion.div>
          )}
          {autoFetchStatus === "cached" && cachedTime && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between bg-amber-50 rounded-2xl px-4 py-3 mb-6"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                <span className="text-sm text-amber-700">
                  Using cached data from {formatRelativeTime(cachedTime)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="text-amber-600 p-1"
                aria-label="Retry weather fetch"
              >
                <RefreshCw size={14} />
              </button>
            </motion.div>
          )}
          {autoFetchStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between bg-red-50 rounded-2xl px-4 py-3 mb-6"
            >
              <span className="text-sm text-red-400">
                Couldn't fetch weather. Fill in manually
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                className="text-red-400 p-1"
                aria-label="Retry weather fetch"
              >
                <RefreshCw size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            <div className="bg-alice-blue/50 rounded-2xl px-4 py-3.5 text-gray-600">
              {formData.location}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Temperature (°C)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.temperature}
                onChange={(e) => handleFieldChange("temperature", e.target.value)}
                className={`w-full bg-white border rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors ${autoFilledFields.has("temperature") ? "border-sky-blue/40 bg-sky-blue/5" : "border-alice-blue"}`}
                placeholder="e.g., 22"
                required
              />
              {autoFilledFields.has("temperature") && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-sky-blue/70 tracking-wide uppercase">auto</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Wind speed (knots)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.windSpeed}
                onChange={(e) => handleFieldChange("windSpeed", e.target.value)}
                className={`w-full bg-white border rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors ${autoFilledFields.has("windSpeed") ? "border-sky-blue/40 bg-sky-blue/5" : "border-alice-blue"}`}
                placeholder="e.g., 15"
                required
              />
              {autoFilledFields.has("windSpeed") && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-sky-blue/70 tracking-wide uppercase">auto</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Wave height (m)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.waveHeight}
                onChange={(e) => handleFieldChange("waveHeight", e.target.value)}
                className={`w-full bg-white border rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors ${autoFilledFields.has("waveHeight") ? "border-sky-blue/40 bg-sky-blue/5" : "border-alice-blue"}`}
                placeholder="e.g., 1.5"
                required
              />
              {autoFilledFields.has("waveHeight") && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-sky-blue/70 tracking-wide uppercase">auto</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Visibility
            </label>
            <div className="relative">
              <select
                value={formData.visibility}
                onChange={(e) => handleFieldChange("visibility", e.target.value)}
                className={`w-full bg-white border rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors ${autoFilledFields.has("visibility") ? "border-sky-blue/40 bg-sky-blue/5" : "border-alice-blue"}`}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="moderate">Moderate</option>
                <option value="poor">Poor</option>
              </select>
              {autoFilledFields.has("visibility") && (
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-sky-blue/70 tracking-wide uppercase">auto</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              className="w-full bg-white border border-alice-blue rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors resize-none"
              rows={3}
              placeholder="Anything else?"
            />
          </div>

          {/* Crew observer picker */}
          {crewMembers.length > 0 && (
            <div>
              <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                <Users size={15} strokeWidth={1.5} />
                Who's observing?
              </label>
              <div className="flex flex-wrap gap-2">
                {crewMembers.map((member) => {
                  const isSelected = selectedCrew.includes(member);
                  return (
                    <button
                      key={member}
                      type="button"
                      onClick={() =>
                        isSelected
                          ? setSelectedCrew(selectedCrew.filter((m) => m !== member))
                          : setSelectedCrew([...selectedCrew, member])
                      }
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-sky-blue text-white shadow-sm"
                          : "bg-alice-blue/50 text-gray-500 border border-alice-blue"
                      }`}
                    >
                      {member}
                    </button>
                  );
                })}
              </div>
              {selectedCrew.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {selectedCrew.length} selected
                </p>
              )}
            </div>
          )}

          {/* Submit button - fast tap response */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full bg-periwinkle text-white rounded-full py-4 mt-4 text-center transition-shadow duration-150 hover:shadow-soft"
          >
            Save it!
          </motion.button>
        </form>

        {/* Success overlay - congratulations before navigating home */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-8"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  duration: 0.5,
                  bounce: 0.25,
                  delay: 0.1,
                }}
                className="w-20 h-20 rounded-full bg-sky-blue/15 flex items-center justify-center mb-6"
              >
                <CheckCircle size={40} className="text-sky-blue" strokeWidth={1.5} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.45, bounce: 0, delay: 0.25 }}
                className="text-[#1A1A1A] text-center mb-2"
              >
                Nice one, Captain!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.45, bounce: 0, delay: 0.35 }}
                className="text-gray-400 text-center text-sm"
              >
                Weather logged, the countdown starts now.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}