import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Plus, ChevronRight } from "lucide-react";
import { FlatOrca } from "@/components/FlatOrca";
import { useDemoSequence } from "../shared/useDemoSequence";
import { MobileKeyboard } from "../shared/MobileKeyboard";
import { SAMPLE_CREW } from "../shared/demoData";

export function Demo5_CrewSetup() {
  const [showPanel, setShowPanel] = useState(false);
  const [showChips, setShowChips] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [typedText, setTypedText] = useState("");
  const [currentKey, setCurrentKey] = useState("");
  const [addedCrew, setAddedCrew] = useState<string[]>([]);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const reset = useCallback(() => {
    setShowPanel(false);
    setShowChips(false);
    setSelected([]);
    setTypedText("");
    setCurrentKey("");
    setAddedCrew([]);
    setShowKeyboard(false);
    setShowContinue(false);
    setFadeOut(false);
  }, []);

  useDemoSequence([
    { delay: 1500, action: () => setShowPanel(true) },
    { delay: 800, action: () => setShowChips(true) },
    { delay: 1000, action: () => setSelected(["Sarah"]) },
    { delay: 700, action: () => setSelected(["Sarah", "James"]) },
    { delay: 800, action: () => { setShowKeyboard(true); setCurrentKey("k"); setTypedText("K"); } },
    { delay: 350, action: () => { setCurrentKey("a"); setTypedText("Ka"); } },
    { delay: 350, action: () => { setCurrentKey("i"); setTypedText("Kai"); } },
    { delay: 500, action: () => setCurrentKey("") },
    { delay: 500, action: () => { setAddedCrew(["Kai"]); setTypedText(""); setShowKeyboard(false); } },
    { delay: 1000, action: () => setShowContinue(true) },
    { delay: 1500, action: () => setFadeOut(true) },
    { delay: 1500, action: reset },
  ]);

  return (
    <motion.div
      animate={{ opacity: fadeOut ? 0 : 1 }}
      style={{
        fontFamily: "Nunito, sans-serif",
        height: "100%",
        background: "linear-gradient(180deg, #E1F2FE 0%, #B2B1CF 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Orca area */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 40, flex: 1 }}>
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <FlatOrca className="w-40 h-24" />
        </motion.div>
      </div>

      <div style={{ textAlign: "center", padding: "0 20px 16px", flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", fontFamily: "Fredoka, sans-serif" }}>
          Who's on board?
        </div>
        <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>Select your crew for today's trip</div>
      </div>

      {/* Bottom panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              background: "#fff",
              borderRadius: "16px 16px 0 0",
              padding: "20px 20px 0",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, background: "#DDD" }} />
            </div>
            <div style={{ paddingBottom: showKeyboard ? 4 : 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 10 }}>Previous crew</div>

              {/* Crew chips */}
              {showChips && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {SAMPLE_CREW.map((name) => {
                    const isSelected = selected.includes(name);
                    return (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          border: `1.5px solid ${isSelected ? "#98D2EB" : "#E5E7EB"}`,
                          background: isSelected ? "#E1F2FE" : "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          color: isSelected ? "#1A6EA0" : "#555",
                        }}
                      >
                        {isSelected && <Check size={14} />}
                        {name}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Added crew tags */}
              <AnimatePresence>
                {addedCrew.map((name) => (
                  <motion.div
                    key={name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      display: "inline-flex",
                      padding: "6px 14px",
                      borderRadius: 20,
                      background: "#DCFCE7",
                      border: "1.5px solid #BBF7D0",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#166534",
                      marginBottom: 10,
                    }}
                  >
                    {name}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Input */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${showKeyboard ? "#98D2EB" : "#E5E7EB"}`,
                  background: "#FAFAFA",
                  fontSize: 14,
                  color: typedText ? "#1A1A1A" : "#AAA",
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                }}>
                  {typedText || "Add crew member..."}
                  {showKeyboard && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ color: "#98D2EB" }}>|</motion.span>}
                </div>
                <motion.div
                  animate={{ background: typedText ? "#B2B1CF" : "#E5E7EB" }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={18} color="#fff" />
                </motion.div>
              </div>

              {/* Continue button */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, scale: [1, 1.02, 1] }}
                    transition={{ scale: { repeat: Infinity, duration: 1.5 } }}
                    style={{
                      padding: "14px",
                      background: "#B2B1CF",
                      borderRadius: 14,
                      textAlign: "center",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    Continue <ChevronRight size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Keyboard */}
            <AnimatePresence>
              {showKeyboard && <MobileKeyboard activeKey={currentKey} />}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
