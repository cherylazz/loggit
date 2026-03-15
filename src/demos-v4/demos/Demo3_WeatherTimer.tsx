import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Wifi } from "lucide-react";
import weatherIcon from "@/assets/weather-icon.png";
import loggitIcon from "@/assets/loggit-icon.png";
import telekomIcon from "@/assets/telekom-icon.png";
import { useDemoSequence } from "../shared/useDemoSequence";

type Phase = "counting" | "urgent" | "overdue" | "lockscreen" | "banner" | "form" | "reset";

export function Demo3_WeatherTimer() {
  const [phase, setPhase] = useState<Phase>("counting");
  const [minutes, setMinutes] = useState(29);
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0.97);

  const reset = useCallback(() => {
    setPhase("counting");
    setMinutes(29);
    setSeconds(0);
    setProgress(0.97);
  }, []);

  useDemoSequence([
    { delay: 1500, action: () => { setMinutes(15); setProgress(0.5); } },
    { delay: 1000, action: () => { setMinutes(5); setProgress(0.17); } },
    { delay: 1000, action: () => { setMinutes(2); setSeconds(0); setProgress(0.07); setPhase("urgent"); } },
    { delay: 1200, action: () => { setMinutes(0); setSeconds(0); setProgress(0); setPhase("overdue"); } },
    { delay: 1500, action: () => setPhase("lockscreen") },
    { delay: 1200, action: () => setPhase("banner") },
    { delay: 3500, action: () => setPhase("form") },
    { delay: 2500, action: () => { setPhase("reset"); setMinutes(30); setSeconds(0); setProgress(1); } },
    { delay: 2500, action: reset },
  ]);

  const ringColor = phase === "urgent" ? "#38BDF8" : phase === "overdue" ? "#EF4444" : "#B2B1CF";
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", height: "100%", background: "#F8FBFF", position: "relative" }}>
      <div style={{ padding: "60px 20px 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Dashboard</div>
        <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Active journey</div>

        {/* Timer tile */}
        <motion.div
          animate={{
            background: phase === "overdue" ? "#FEF2F2" : phase === "urgent" ? "#F0F9FF" : "#fff",
            borderColor: phase === "overdue" ? "#FECACA" : phase === "urgent" ? "#BAE6FD" : "#E5E7EB",
          }}
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 16,
            border: "1.5px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Progress ring */}
          <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
            <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={50} cy={50} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={8} />
              <motion.circle
                cx={50}
                cy={50}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8 }}
              />
            </svg>
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {phase === "overdue" ? (
                <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>Overdue!</div>
              ) : (
                <>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A" }}>
                    {minutes}:{String(seconds).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 10, color: "#888" }}>min</div>
                </>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={16} color="#888" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Weather Timer</span>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {phase === "overdue" ? "Time for a weather check!" : "Next log reminder"}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lock screen + push notification */}
      <AnimatePresence>
        {(phase === "lockscreen" || phase === "banner") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 30,
              background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Status bar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 20px 0",
            }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Deutsche Telekom</span>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 1, marginRight: 1 }}>
                  {[5, 7, 9, 11].map((h, i) => (
                    <div key={i} style={{ width: 2.5, height: h, borderRadius: 1, background: "rgba(255,255,255,0.5)" }} />
                  ))}
                </div>
                <span style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginRight: 2 }}>5G</span>
                <Wifi size={11} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
                <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                  <div style={{
                    width: 20, height: 10, borderRadius: 2.5,
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", left: 1.5, top: 1.5, bottom: 1.5, width: "70%", borderRadius: 1, background: "rgba(255,255,255,0.5)" }} />
                  </div>
                  <div style={{ width: 1.5, height: 4, borderRadius: 1, background: "rgba(255,255,255,0.5)" }} />
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginLeft: 2 }}>10:54</span>
              </div>
            </div>

            {/* Clock + date */}
            <div style={{ textAlign: "center", padding: "60px 20px 0" }}>
              <div style={{
                fontSize: 64,
                fontWeight: 200,
                color: "#fff",
                letterSpacing: 2,
                lineHeight: 1,
                fontFamily: "sans-serif",
              }}>10:54</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 8, fontWeight: 400 }}>
                Monday, 16 March
              </div>
            </div>

            {/* Deutsche Telekom notification */}
            <div style={{
              margin: "32px 12px 0",
              background: "rgba(40, 40, 55, 0.85)",
              borderRadius: 20,
              padding: "12px 14px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Deutsche Telekom</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>2m ago</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <img src={telekomIcon} alt="" style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  objectFit: "cover",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>AI now built into your calls</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 2, lineHeight: 1.35 }}>
                    Live translation & smart summaries, no app needed. Useful out at sea!
                  </div>
                </div>
              </div>
            </div>

            {/* LoggIT notification slides in */}
            <AnimatePresence>
              {phase === "banner" && (
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -80, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  style={{
                    margin: "8px 12px 0",
                    background: "rgba(40, 40, 55, 0.85)",
                    borderRadius: 20,
                    padding: "12px 14px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>LoggIT</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>now</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <img src={loggitIcon} alt="" style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      objectFit: "cover",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Weather Reminder</div>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 2, lineHeight: 1.35 }}>
                        Your 30-min weather timer is up! Tap to log current conditions.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom lock indicator */}
            <div style={{ marginTop: "auto", paddingBottom: 28, textAlign: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Swipe up to unlock</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather form overlay */}
      <AnimatePresence>
        {phase === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#fff",
              borderRadius: "16px 16px 0 0",
              padding: "20px",
              boxShadow: "0 -8px 24px rgba(0,0,0,0.1)",
              zIndex: 20,
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, background: "#DDD" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Quick Weather Log</div>
              <img src={weatherIcon} alt="" style={{ width: 36, height: 36 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ l: "Temp", v: "18°C" }, { l: "Wind", v: "12 kts" }, { l: "Waves", v: "1.2m" }, { l: "Vis", v: "Good" }].map((f) => (
                <div key={f.l} style={{ padding: 10, background: "#EDEFF8", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "#888" }}>{f.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{f.v}</div>
                </div>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              style={{
                marginTop: 14,
                padding: "12px",
                background: "#B2B1CF",
                borderRadius: 12,
                textAlign: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Save Weather Log
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset state */}
      <AnimatePresence>
        {phase === "reset" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "absolute",
              bottom: 24,
              left: 20,
              right: 20,
              background: "#DCFCE7",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#166534",
            }}
          >
            <img src={weatherIcon} alt="" style={{ width: 22, height: 22 }} /> Timer reset to 30:00
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
