import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";
import { useDemoSequence } from "../shared/useDemoSequence";

type Phase = "settings" | "loading" | "toast" | "spreadsheet-sightings" | "spreadsheet-weather" | "filename";

const SIGHTING_HEADERS = ["Date", "Species", "Count", "Behaviour", "Distance"];
const SIGHTING_ROWS = [
  ["2026-03-13", "Bottlenose Dolphin", "3", "feeding", "200m"],
  ["2026-03-13", "Southern Right", "1", "breaching", "500m"],
  ["2026-03-12", "Humpback Whale", "2", "travelling", "350m"],
  ["2026-03-12", "Cape Fur Seal", "8", "resting", "50m"],
];
const WEATHER_HEADERS = ["Date", "Temp (°C)", "Wind (kts)", "Waves (m)", "Visibility"];
const WEATHER_ROWS = [
  ["2026-03-13", "18", "12", "1.2", "good"],
  ["2026-03-13", "17", "15", "1.5", "moderate"],
  ["2026-03-12", "20", "8", "0.8", "excellent"],
  ["2026-03-12", "19", "10", "1.0", "good"],
];

export function Demo4_ExportFunction() {
  const [phase, setPhase] = useState<Phase>("settings");
  const [activeTab, setActiveTab] = useState<"sightings" | "weather">("sightings");
  const [visibleRows, setVisibleRows] = useState(0);

  const reset = useCallback(() => {
    setPhase("settings");
    setActiveTab("sightings");
    setVisibleRows(0);
  }, []);

  useDemoSequence([
    { delay: 2000, action: () => setPhase("loading") },
    { delay: 1200, action: () => setPhase("toast") },
    { delay: 1000, action: () => { setPhase("spreadsheet-sightings"); setVisibleRows(0); } },
    { delay: 400, action: () => setVisibleRows(1) },
    { delay: 300, action: () => setVisibleRows(2) },
    { delay: 300, action: () => setVisibleRows(3) },
    { delay: 300, action: () => setVisibleRows(4) },
    { delay: 2000, action: () => { setActiveTab("weather"); setVisibleRows(0); setPhase("spreadsheet-weather"); } },
    { delay: 400, action: () => setVisibleRows(1) },
    { delay: 300, action: () => setVisibleRows(2) },
    { delay: 300, action: () => setVisibleRows(3) },
    { delay: 300, action: () => setVisibleRows(4) },
    { delay: 1500, action: () => setPhase("filename") },
    { delay: 2500, action: reset },
  ]);

  const headers = activeTab === "sightings" ? SIGHTING_HEADERS : WEATHER_HEADERS;
  const rows = activeTab === "sightings" ? SIGHTING_ROWS : WEATHER_ROWS;
  const headerBg = activeTab === "sightings" ? "#E1F2FE" : "#EDEFF8";
  const headerColor = "#1A1A1A";

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", height: "100%", background: "#F8FBFF" }}>
      <AnimatePresence mode="wait">
        {phase === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: "60px 20px 20px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Fredoka, sans-serif", marginBottom: 20 }}>
              Settings
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1.5px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: "#EDEFF8",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileSpreadsheet size={22} color="#8685A6" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Export to Excel</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>12 logs ready</div>
              </div>
              <Download size={20} color="#B2B1CF" />
            </motion.div>
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 size={40} color="#B2B1CF" />
            </motion.div>
            <div style={{ marginTop: 12, fontSize: 14, color: "#888" }}>Generating export...</div>
          </motion.div>
        )}

        {phase === "toast" && (
          <motion.div key="toast" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <CheckCircle2 size={48} color="#22C55E" />
            </motion.div>
            <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700, color: "#166534" }}>Export ready!</div>
          </motion.div>
        )}

        {(phase === "spreadsheet-sightings" || phase === "spreadsheet-weather" || phase === "filename") && (
          <motion.div key="spreadsheet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "56px 12px 20px" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
              {(["sightings", "weather"] as const).map((tab) => (
                <div
                  key={tab}
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: "10px 10px 0 0",
                    background: activeTab === tab ? (tab === "sightings" ? "#E1F2FE" : "#EDEFF8") : "#F0F0F0",
                    color: activeTab === tab ? "#1A1A1A" : "#888",
                    textTransform: "capitalize",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
                background: headerBg,
                padding: "8px 4px",
              }}>
                {headers.map((h) => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: headerColor, padding: "0 4px", textAlign: "center" }}>
                    {h}
                  </div>
                ))}
              </div>
              {rows.map((row, i) => (
                <motion.div
                  key={`${activeTab}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i < visibleRows ? 1 : 0, x: i < visibleRows ? 0 : -10 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
                    padding: "8px 4px",
                    background: i % 2 === 0 ? "#FAFAFA" : "#fff",
                    borderTop: "1px solid #F0F0F0",
                  }}
                >
                  {row.map((cell, j) => (
                    <div key={j} style={{ fontSize: 11, color: "#444", padding: "0 4px", textAlign: "center" }}>
                      {cell}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>

            {phase === "filename" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: 16,
                  padding: "10px 14px",
                  background: "#F0F0F5",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#666",
                  fontFamily: "monospace",
                  textAlign: "center",
                }}
              >
                loggit-export-2026-03-13.xlsx
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
