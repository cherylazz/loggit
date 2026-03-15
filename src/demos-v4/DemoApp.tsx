import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FlatOrca } from "@/components/FlatOrca";
import { PhoneFrame } from "./PhoneFrame";
import { Demo1_LoggingOverview } from "./demos/Demo1_LoggingOverview";
import { Demo2_OfflineCapability } from "./demos/Demo2_OfflineCapability";
import { Demo3_WeatherTimer } from "./demos/Demo3_WeatherTimer";
import { Demo4_ExportFunction } from "./demos/Demo4_ExportFunction";
import { Demo5_CrewSetup } from "./demos/Demo5_CrewSetup";
import { Demo6_VoiceTranscription } from "./demos/Demo6_VoiceTranscription";

const DEMOS = [
  { id: 1, title: "Logging Overview", desc: "Weather & sighting forms auto-filling", component: Demo1_LoggingOverview },
  { id: 2, title: "Offline Capability", desc: "Online/offline toggle with local save", component: Demo2_OfflineCapability },
  { id: 3, title: "Weather Timer", desc: "Countdown timer with push notification", component: Demo3_WeatherTimer },
  { id: 4, title: "Export Function", desc: "Excel spreadsheet generation & preview", component: Demo4_ExportFunction },
  { id: 5, title: "Crew Setup", desc: "Orca mascot with crew chip selection", component: Demo5_CrewSetup },
  { id: 6, title: "Voice Transcription", desc: "Mic recording with auto-detected fields", component: Demo6_VoiceTranscription },
];

export function DemoApp() {
  const [activeDemo, setActiveDemo] = useState(0);

  const goNext = useCallback(() => setActiveDemo((p) => Math.min(p + 1, DEMOS.length - 1)), []);
  const goPrev = useCallback(() => setActiveDemo((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const ActiveComponent = DEMOS[activeDemo].component;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 50%, #F5F3FF 100%)",
        fontFamily: "Nunito, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          width: 320,
          minWidth: 320,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "32px 24px",
          borderRight: "1px solid #E5E7EB",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <FlatOrca className="w-12 h-8" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif", color: "#1A1A1A" }}>
              LoggIT
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>Product Demo V4</div>
          </div>
        </div>

        {/* Demo list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {DEMOS.map((demo, i) => (
            <motion.button
              key={demo.id}
              onClick={() => setActiveDemo(i)}
              whileHover={{ x: 4 }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                marginBottom: 6,
                background: activeDemo === i ? "#E8E8F0" : "transparent",
                transition: "background 0.2s",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: activeDemo === i ? "#B2B1CF" : "#E5E7EB",
                  color: activeDemo === i ? "#fff" : "#888",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {demo.id}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: activeDemo === i ? "#1A1A1A" : "#555" }}>
                  {demo.title}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{demo.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid #E5E7EB" }}>
          <NavButton onClick={goPrev} disabled={activeDemo === 0}>
            <ChevronLeft size={18} />
            Prev
          </NavButton>
          <NavButton onClick={goNext} disabled={activeDemo === DEMOS.length - 1}>
            Next
            <ChevronRight size={18} />
          </NavButton>
        </div>
      </div>

      {/* Right panel — phone frame */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{ height: "90vh" }}
          >
            <PhoneFrame>
              <ActiveComponent />
            </PhoneFrame>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function NavButton({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1.5px solid #E5E7EB",
        background: disabled ? "#F5F5F5" : "#fff",
        color: disabled ? "#CCC" : "#555",
        cursor: disabled ? "default" : "pointer",
        fontSize: 13,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      {children}
    </button>
  );
}
