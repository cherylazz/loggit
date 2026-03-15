import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wifi, WifiOff, Thermometer, Wind, Waves, Loader2, CheckCircle2 } from "lucide-react";
import weatherIcon from "@/assets/weather-icon.png";
import { useDemoSequence } from "../shared/useDemoSequence";
import { SAMPLE_WEATHER_LOG } from "../shared/demoData";

type Status = "online" | "offline" | "back-online";

export function Demo2_OfflineCapability() {
  const [status, setStatus] = useState<Status>("online");
  const [showCachedBanner, setShowCachedBanner] = useState(false);

  const [showFetchingLive, setShowFetchingLive] = useState(false);
  const [liveDataFetched, setLiveDataFetched] = useState(false);
  const [filledFields, setFilledFields] = useState<Record<string, boolean>>({});

  const reset = useCallback(() => {
    setStatus("online");
    setShowCachedBanner(false);

    setShowFetchingLive(false);
    setLiveDataFetched(false);
    setFilledFields({});
  }, []);

  useDemoSequence([
    // Online: show live weather fetch, fields fill one by one
    { delay: 1500, action: () => setShowFetchingLive(true) },
    { delay: 800, action: () => setFilledFields({ temperature: true }) },
    { delay: 600, action: () => setFilledFields((p) => ({ ...p, windSpeed: true })) },
    { delay: 600, action: () => setFilledFields((p) => ({ ...p, waveHeight: true })) },
    { delay: 600, action: () => { setShowFetchingLive(false); setLiveDataFetched(true); } },
    // Go offline
    { delay: 2000, action: () => { setStatus("offline"); setLiveDataFetched(false); } },
    { delay: 1000, action: () => setShowCachedBanner(true) },
    // Come back online
    { delay: 1500, action: () => { setStatus("back-online"); setShowCachedBanner(false); } },
    { delay: 2000, action: reset },
  ]);

  const isOffline = status === "offline";
  const pillColor = isOffline ? "#F59E0B" : "#22C55E";
  const pillBg = isOffline ? "#FEF3C7" : "#DCFCE7";
  const pillIcon = isOffline ? <WifiOff size={14} /> : <Wifi size={14} />;
  const pillText = isOffline ? "Offline" : "Online";

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", height: "100%", background: "#F8FBFF", position: "relative" }}>
      {/* Status pill */}
      <div style={{ padding: "56px 20px 0", display: "flex", justifyContent: "center" }}>
        <motion.div
          animate={{ background: pillBg, color: pillColor }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {pillIcon} {pillText}
        </motion.div>
      </div>

      {/* Live data fetch banner */}
      <AnimatePresence>
        {(showFetchingLive || liveDataFetched) && !isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: liveDataFetched ? "#DCFCE7" : "#EDEFF8",
              margin: "12px 20px 0",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{
              padding: "10px 14px",
              fontSize: 13,
              color: liveDataFetched ? "#166534" : "#6B6A8A",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              {showFetchingLive ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={14} />
                  </motion.div>
                  Fetching live weather data...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Live weather data loaded
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline bar */}
      <AnimatePresence>
        {showCachedBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: "#FEF3C7",
              margin: "12px 20px 0",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "10px 14px", fontSize: 13, color: "#92400E", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              <WifiOff size={14} /> Using cached data
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather form */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Weather Log</div>
          <img src={weatherIcon} alt="" style={{ width: 36, height: 36 }} />
        </div>
        <WeatherField label="Temperature" value={`${SAMPLE_WEATHER_LOG.temperature}°C`} icon={<Thermometer size={16} />} filled={!!filledFields.temperature} />
        <WeatherField label="Wind Speed" value={`${SAMPLE_WEATHER_LOG.windSpeed} kts`} icon={<Wind size={16} />} filled={!!filledFields.windSpeed} />
        <WeatherField label="Wave Height" value={`${SAMPLE_WEATHER_LOG.waveHeight} m`} icon={<Waves size={16} />} filled={!!filledFields.waveHeight} />
      </div>

    </div>
  );
}

function WeatherField({ label, value, icon, filled }: { label: string; value: string; icon: React.ReactNode; filled: boolean }) {
  return (
    <motion.div
      animate={{
        borderColor: filled ? "#8B98D1" : "#E5E7EB",
      }}
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: "1.5px solid #E5E7EB",
        marginBottom: 10,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ color: "#8B98D1" }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: filled ? "#1A1A1A" : "#ccc", marginTop: 2 }}>
          {filled ? value : "—"}
        </div>
      </div>
    </motion.div>
  );
}

