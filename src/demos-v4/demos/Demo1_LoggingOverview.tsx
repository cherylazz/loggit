import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, Waves, Wind, Thermometer, CheckCircle2, ChevronDown } from "lucide-react";
import weatherIcon from "@/assets/weather-icon.png";
import binocularsIcon from "figma:asset/cc369f8ff92cf33a90f00c520861310e3191ab17.png";
import { useDemoSequence } from "../shared/useDemoSequence";
import { SAMPLE_WEATHER_LOG, SAMPLE_SIGHTING_LOG } from "../shared/demoData";

type Screen = "home" | "sighting" | "species-dropdown" | "success-sighting" | "weather" | "success-weather" | "home-final";

const SAMPLE_NOTES = "Feeding near the kelp beds, calm water";

const SPECIES_LIST = [
  "Bottlenose Dolphin",
  "Humpback Whale",
  "Grey Whale",
  "Sea Turtle",
  "Albatross",
  "Pelican",
  "Sea Lion",
  "Orca",
  "Blue Whale",
];

export function Demo1_LoggingOverview() {
  const [screen, setScreen] = useState<Screen>("home");
  const [weatherFields, setWeatherFields] = useState<Record<string, boolean>>({});
  const [sightingFields, setSightingFields] = useState<Record<string, boolean>>({});
  const [recentLogs, setRecentLogs] = useState<{ type: string; species?: string; count?: number; behaviour?: string; emoji?: string }[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [highlightedSpecies, setHighlightedSpecies] = useState("");
  const [notesChars, setNotesChars] = useState(0);

  const reset = useCallback(() => {
    setScreen("home");
    setWeatherFields({});
    setSightingFields({});
    setRecentLogs([]);
    setSelectedSpecies("");
    setHighlightedSpecies("");
    setNotesChars(0);
  }, []);

  useDemoSequence([
    // Start with sightings
    { delay: 2000, action: () => setScreen("sighting") },
    { delay: 1000, action: () => setScreen("species-dropdown") },
    // Highlight species before selecting
    { delay: 600, action: () => setHighlightedSpecies("Humpback Whale") },
    { delay: 400, action: () => setHighlightedSpecies("Bottlenose Dolphin") },
    { delay: 500, action: () => { setSelectedSpecies("Bottlenose Dolphin"); setSightingFields({ species: true }); setScreen("sighting"); } },
    { delay: 800, action: () => setSightingFields((p) => ({ ...p, count: true })) },
    { delay: 600, action: () => setSightingFields((p) => ({ ...p, distance: true })) },
    { delay: 600, action: () => setSightingFields((p) => ({ ...p, behaviour: true })) },
    // Type notes character by character
    ...Array.from({ length: 10 }, (_, i) => ({
      delay: 80,
      action: () => setNotesChars(Math.round(((i + 1) / 10) * SAMPLE_NOTES.length)),
    })),
    { delay: 400, action: () => { setNotesChars(SAMPLE_NOTES.length); setSightingFields((p) => ({ ...p, notes: true })); } },
    { delay: 1200, action: () => setScreen("success-sighting") },
    // Then weather
    { delay: 1800, action: () => setScreen("weather") },
    { delay: 800, action: () => setWeatherFields({ temperature: true }) },
    { delay: 600, action: () => setWeatherFields((p) => ({ ...p, windSpeed: true })) },
    { delay: 600, action: () => setWeatherFields((p) => ({ ...p, waveHeight: true })) },
    { delay: 600, action: () => setWeatherFields((p) => ({ ...p, visibility: true })) },
    { delay: 1200, action: () => setScreen("success-weather") },
    { delay: 1800, action: () => {
      setRecentLogs([
        { type: "sighting", species: "Bottlenose Dolphin", count: 3, behaviour: "feeding", emoji: "🐬" },
        { type: "weather" },
      ]);
      setScreen("home-final");
    }},
    { delay: 800, action: () => setRecentLogs((p) => [...p,
      { type: "sighting", species: "Humpback Whale", count: 1, behaviour: "breaching", emoji: "🐋" },
    ])},
    { delay: 600, action: () => setRecentLogs((p) => [...p,
      { type: "sighting", species: "Sea Turtle", count: 2, behaviour: "swimming", emoji: "🐢" },
    ])},
    { delay: 600, action: () => setRecentLogs((p) => [...p,
      { type: "sighting", species: "Orca", count: 4, behaviour: "hunting", emoji: "🐳" },
    ])},
    { delay: 3000, action: reset },
  ]);

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", height: "100%", background: "#F8FBFF" }}>
      <AnimatePresence mode="wait">
        {(screen === "home" || screen === "home-final") && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: "60px 20px 20px" }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", fontFamily: "Fredoka, sans-serif" }}>
              Good morning! 🌊
            </div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Ready to log your trip?</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
              <ActionTile icon={<img src={weatherIcon} alt="Weather" style={{ width: 52, height: 52 }} />} label="Weather" color="#EDEFF8" />
              <ActionTile icon={<img src={binocularsIcon} alt="Sightings" style={{ width: 52, height: 52 }} />} label="Sightings" color="#E1F2FE" />
            </div>

            {screen === "home-final" && recentLogs.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#444", marginBottom: 8 }}>Recent Logs</div>
                {recentLogs.map((log, i) => (
                  <motion.div
                    key={`${log.type}-${log.species || "weather"}-${i}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: "12px 16px",
                      background: "#fff",
                      borderRadius: 12,
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: log.type === "weather" ? "#EDEFF8" : "#E1F2FE",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 18, lineHeight: 1, fontFamily: "'Noto Color Emoji', sans-serif" }}>
                        {log.type === "weather" ? "⛅" : log.emoji}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {log.type === "weather" ? "Weather Log" : log.species}
                      </div>
                      <div style={{ fontSize: 11, color: "#888" }}>
                        {log.type === "weather" ? "Just now" : `${log.count} seen · ${log.behaviour}`}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {(screen === "sighting" || screen === "species-dropdown") && (
          <motion.div
            key="sighting"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            style={{ padding: "60px 20px 20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Sighting Log</div>
              <img src={binocularsIcon} alt="" style={{ width: 36, height: 36 }} />
            </div>

            {/* Species field with dropdown */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <motion.div
                animate={{
                  background: sightingFields.species ? "#E1F2FE" : "#fff",
                  borderColor: screen === "species-dropdown" ? "#98D2EB" : sightingFields.species ? "#98D2EB" : "#E5E7EB",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>Species</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: selectedSpecies ? "#1A1A1A" : "#ccc", marginTop: 2 }}>
                    {selectedSpecies || "Select species..."}
                  </div>
                </div>
                <motion.div animate={{ rotate: screen === "species-dropdown" ? 180 : 0 }}>
                  <ChevronDown size={18} color="#888" />
                </motion.div>
              </motion.div>

              {/* Dropdown */}
              <AnimatePresence>
                {screen === "species-dropdown" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.8 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.8 }}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      background: "#fff",
                      borderRadius: 12,
                      border: "1.5px solid #E5E7EB",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      overflow: "hidden",
                      zIndex: 10,
                      transformOrigin: "top",
                      maxHeight: 220,
                      overflowY: "auto",
                    }}
                  >
                    {SPECIES_LIST.map((species) => (
                      <motion.div
                        key={species}
                        animate={{
                          background: highlightedSpecies === species ? "#E1F2FE" : "#fff",
                        }}
                        style={{
                          padding: "10px 14px",
                          fontSize: 14,
                          fontWeight: highlightedSpecies === species ? 600 : 400,
                          color: highlightedSpecies === species ? "#1A6EA0" : "#333",
                          borderBottom: "1px solid #F0F0F0",
                          cursor: "pointer",
                        }}
                      >
                        {species}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FormField label="Count" value={String(SAMPLE_SIGHTING_LOG.count)} filled={!!sightingFields.count} />
            <FormField label="Distance" value={`${SAMPLE_SIGHTING_LOG.distance}m`} filled={!!sightingFields.distance} />
            <FormField label="Behaviour" value={SAMPLE_SIGHTING_LOG.behaviour} filled={!!sightingFields.behaviour} />

            {/* Notes field */}
            <motion.div
              animate={{
                background: sightingFields.notes ? "#E1F2FE" : "#fff",
                borderColor: notesChars > 0 && !sightingFields.notes ? "#98D2EB" : sightingFields.notes ? "#98D2EB" : "#E5E7EB",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #E5E7EB",
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Notes</span>
              </div>
              <div style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: notesChars > 0 ? "#1A1A1A" : "#ccc",
                minHeight: 36,
              }}>
                {notesChars > 0 ? SAMPLE_NOTES.slice(0, notesChars) : "Add notes..."}
                {notesChars > 0 && !sightingFields.notes && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    style={{ color: "#98D2EB" }}
                  >
                    |
                  </motion.span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {screen === "weather" && (
          <motion.div
            key="weather"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            style={{ padding: "60px 20px 20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Weather Log</div>
              <img src={weatherIcon} alt="" style={{ width: 36, height: 36 }} />
            </div>
            <FormField label="Temperature" value={`${SAMPLE_WEATHER_LOG.temperature}°C`} icon={<Thermometer size={16} />} filled={!!weatherFields.temperature} filledBg="#EDEFF8" filledBorder="#8B98D1" filledIcon="#8B98D1" />
            <FormField label="Wind Speed" value={`${SAMPLE_WEATHER_LOG.windSpeed} kts`} icon={<Wind size={16} />} filled={!!weatherFields.windSpeed} filledBg="#EDEFF8" filledBorder="#8B98D1" filledIcon="#8B98D1" />
            <FormField label="Wave Height" value={`${SAMPLE_WEATHER_LOG.waveHeight} m`} icon={<Waves size={16} />} filled={!!weatherFields.waveHeight} filledBg="#EDEFF8" filledBorder="#8B98D1" filledIcon="#8B98D1" />
            <FormField label="Visibility" value={SAMPLE_WEATHER_LOG.visibility} icon={<Eye size={16} />} filled={!!weatherFields.visibility} filledBg="#EDEFF8" filledBorder="#8B98D1" filledIcon="#8B98D1" />
          </motion.div>
        )}

        {(screen === "success-weather" || screen === "success-sighting") && (
          <motion.div
            key={screen}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #E1F2FE 0%, #E8E8F0 100%)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle2 size={64} color={screen === "success-weather" ? "#8B98D1" : "#5BA4D9"} />
            </motion.div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 16, fontFamily: "Fredoka, sans-serif" }}>
              Nice one, {screen === "success-weather" ? "Sailor" : "Captain"}!
            </div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
              {screen === "success-weather" ? "Weather logged" : "Sighting logged"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionTile({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 16,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
      }}
    >
      {icon}
      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function FormField({ label, value, icon, filled, filledBg = "#E1F2FE", filledBorder = "#98D2EB", filledIcon = "#5BA4D9" }: { label: string; value: string; icon?: React.ReactNode; filled: boolean; filledBg?: string; filledBorder?: string; filledIcon?: string }) {
  return (
    <motion.div
      animate={{
        background: filled ? filledBg : "#fff",
        borderColor: filled ? filledBorder : "#E5E7EB",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: "1.5px solid #E5E7EB",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {icon && <span style={{ color: filledIcon }}>{icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: filled ? "#1A1A1A" : "#ccc", marginTop: 2 }}>
          {filled ? value : "—"}
        </div>
      </div>
    </motion.div>
  );
}
