import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, X, CheckCircle2 } from "lucide-react";
import weatherIcon from "@/assets/weather-icon.png";
import binocularsIcon from "figma:asset/cc369f8ff92cf33a90f00c520861310e3191ab17.png";
import { useDemoSequence } from "../shared/useDemoSequence";
import { SAMPLE_TRANSCRIPT, SAMPLE_SIGHTING_LOG } from "../shared/demoData";

type Phase = "home" | "sheet" | "type-select" | "recording" | "transcript" | "fields" | "form";

export function Demo6_VoiceTranscription() {
  const [phase, setPhase] = useState<Phase>("home");
  const [transcriptChars, setTranscriptChars] = useState(0);
  const [showFields, setShowFields] = useState(false);

  const reset = useCallback(() => {
    setPhase("home");
    setTranscriptChars(0);
    setShowFields(false);
  }, []);

  useDemoSequence([
    { delay: 2000, action: () => setPhase("sheet") },
    { delay: 1000, action: () => setPhase("type-select") },
    { delay: 1200, action: () => setPhase("recording") },
    // Type transcript progressively
    ...Array.from({ length: 20 }, (_, i) => ({
      delay: 100,
      action: () => setTranscriptChars(Math.round(((i + 1) / 20) * SAMPLE_TRANSCRIPT.length)),
    })),
    { delay: 500, action: () => { setTranscriptChars(SAMPLE_TRANSCRIPT.length); setPhase("transcript"); } },
    { delay: 1200, action: () => setShowFields(true) },
    { delay: 2500, action: () => setPhase("form") },
    { delay: 3000, action: reset },
  ]);

  const DETECTED_FIELDS = [
    { label: "Species", value: SAMPLE_SIGHTING_LOG.species, color: "#E1F2FE" },
    { label: "Count", value: String(SAMPLE_SIGHTING_LOG.count), color: "#E1F2FE" },
    { label: "Behaviour", value: SAMPLE_SIGHTING_LOG.behaviour, color: "#DCFCE7" },
    { label: "Distance", value: `${SAMPLE_SIGHTING_LOG.distance}m`, color: "#FEF3C7" },
  ];

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", height: "100%", background: "#F8FBFF", position: "relative" }}>
      {/* Home with FAB */}
      {(phase === "home") && (
        <div style={{ padding: "60px 20px 20px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Dashboard</div>
          <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Tap the mic to start logging</div>

          {/* Action tiles with real icons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
            <div style={{
              background: "#EDEFF8", borderRadius: 16, padding: "24px 16px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <img src={weatherIcon} alt="Weather" style={{ width: 52, height: 52 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Weather</div>
            </div>
            <div style={{
              background: "#E1F2FE", borderRadius: 16, padding: "24px 16px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <img src={binocularsIcon} alt="Sightings" style={{ width: 52, height: 52 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Sightings</div>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      {phase === "home" && (
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: "absolute",
            bottom: 24,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#B2B1CF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(178,177,207,0.4)",
          }}
        >
          <Mic size={24} color="#fff" />
        </motion.div>
      )}

      {/* Voice sheet */}
      <AnimatePresence>
        {phase !== "home" && phase !== "form" && (
          <motion.div
            initial={{ y: 800 }}
            animate={{ y: 0 }}
            exit={{ y: 800 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              top: 80,
              background: "#fff",
              borderRadius: "16px 16px 0 0",
              padding: "20px",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, background: "#DDD" }} />
            </div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Voice Input</div>
              <X size={20} color="#888" />
            </div>

            {/* Type select */}
            {phase !== "type-select" ? (
              <div style={{
                padding: "8px 14px",
                background: "#E1F2FE",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                alignSelf: "flex-start",
                marginBottom: 16,
                color: "#555",
              }}>
                <img src={binocularsIcon} alt="" style={{ width: 18, height: 18 }} />
                Sighting Log
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", gap: 8, marginBottom: 16 }}
              >
                {[
                  { label: "Sighting Log", icon: binocularsIcon, active: true },
                  { label: "Weather Log", icon: weatherIcon, active: false },
                ].map((t) => (
                  <div
                    key={t.label}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      background: t.active ? "#E1F2FE" : "#F0F0F0",
                      color: t.active ? "#555" : "#888",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <img src={t.icon} alt="" style={{ width: 18, height: 18, filter: t.active ? "brightness(10)" : "none" }} />
                    {t.label}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Mic button */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <motion.div
                animate={{
                  background: phase === "recording" ? "#98D2EB" : "#F0F0F0",
                  boxShadow: phase === "recording" ? "0 0 0 12px rgba(152,210,235,0.2)" : "0 0 0 0px rgba(0,0,0,0)",
                }}
                transition={{ boxShadow: { repeat: phase === "recording" ? Infinity : 0, duration: 1.5, repeatType: "reverse" } }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {phase === "recording" ? (
                  <Mic size={28} color="#fff" />
                ) : (
                  <MicOff size={28} color="#888" />
                )}
              </motion.div>
            </div>

            {/* Waveform */}
            {phase === "recording" && (
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16, height: 32 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 24 + Math.random() * 8, 8] }}
                    transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.4, delay: i * 0.05 }}
                    style={{
                      width: 4,
                      borderRadius: 2,
                      background: "#98D2EB",
                      alignSelf: "center",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Transcript */}
            {(phase === "recording" || phase === "transcript") && transcriptChars > 0 && (
              <div style={{
                padding: 14,
                background: "#FAFAFA",
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.5,
                color: "#333",
                marginBottom: 16,
                minHeight: 60,
              }}>
                {SAMPLE_TRANSCRIPT.slice(0, transcriptChars)}
                {phase === "recording" && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    style={{ color: "#98D2EB" }}
                  >
                    |
                  </motion.span>
                )}
              </div>
            )}

            {/* Detected fields */}
            <AnimatePresence>
              {showFields && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: "#F8FBFF",
                    borderRadius: 14,
                    padding: 14,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 10 }}>
                    Auto-detected fields
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {DETECTED_FIELDS.map((f, i) => (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15 }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 20,
                          background: f.color,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#333",
                        }}
                      >
                        <span style={{ color: "#888", fontWeight: 500 }}>{f.label}: </span>
                        {f.value}
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: [1, 1.02, 1] }}
                    transition={{ scale: { repeat: Infinity, duration: 1.5 }, opacity: { delay: 0.6 } }}
                    style={{
                      marginTop: 14,
                      padding: "10px",
                      background: "#B2B1CF",
                      borderRadius: 10,
                      textAlign: "center",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Fill in the form!
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-populated form */}
      <AnimatePresence>
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ padding: "60px 20px 20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Sighting Log</div>
              <img src={binocularsIcon} alt="" style={{ width: 36, height: 36 }} />
            </div>
            {DETECTED_FIELDS.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #98D2EB",
                  background: "#E1F2FE",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>{f.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{f.value}</div>
                </div>
                <CheckCircle2 size={16} color="#5BA4D9" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
