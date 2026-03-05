import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Users, Check } from "lucide-react";
import { FlatOrca } from "./FlatOrca";

interface CrewSetupScreenProps {
  onComplete: (crew: string[]) => void;
}

export function CrewSetupScreen({ onComplete }: CrewSetupScreenProps) {
  const [crewMembers, setCrewMembers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load previously saved names from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("loggit-saved-crew");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedNames(parsed);
        }
      } catch {}
    }
  }, []);

  const toggleMember = (name: string) => {
    if (crewMembers.includes(name)) {
      setCrewMembers(crewMembers.filter((m) => m !== name));
    } else {
      setCrewMembers([...crewMembers, name]);
    }
  };

  const addMember = () => {
    const name = inputValue.trim();
    if (name && !crewMembers.includes(name)) {
      setCrewMembers([...crewMembers, name]);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  };

  // Filter saved names by search input
  const filteredSavedNames = savedNames.filter(
    (name) =>
      !crewMembers.includes(name) &&
      (inputValue === "" ||
      name.toLowerCase().includes(inputValue.toLowerCase()))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 bg-gradient-to-b from-sky-blue to-alice-blue z-50 flex flex-col"
    >
      {/* Top section - light blue background with mascot & greeting */}
      <div className="flex-shrink-0 pt-14 pb-16 px-6">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.3, delay: 0.3 }}
            className="mb-5"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [-3, 3, -3],
                x: [0, 6, 0, -6, 0],
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="w-28 h-20"
            >
              <FlatOrca className="w-full h-full" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mb-2 text-[#1A1A1A]"
          >
            Welcome aboard!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-gray-600"
          >
            Who's on board today?
          </motion.p>
        </div>
      </div>

      {/* Bottom white panel - slides up */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", duration: 0.7, bounce: 0, delay: 0.5 }}
        className="flex-1 bg-white rounded-t-3xl flex flex-col min-h-0 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32">
          <div className="max-w-md mx-auto">
            {/* Drag handle */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            {/* Input area */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="mb-6"
            >
              <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                <Users size={15} strokeWidth={1.5} />
                Add crew member
              </label>
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Sarah"
                  className="flex-1 bg-alice-blue/40 border border-alice-blue rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors"
                  autoFocus
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={addMember}
                  disabled={!inputValue.trim()}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    inputValue.trim()
                      ? "bg-periwinkle text-white"
                      : "bg-alice-blue/50 text-gray-300"
                  }`}
                >
                  <Plus size={20} strokeWidth={2} />
                </motion.button>
              </div>
            </motion.div>

            {/* Previous crew - toggle chips */}
            <AnimatePresence>
              {filteredSavedNames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <p className="text-xs text-gray-400 mb-3">
                    Previous crew members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSavedNames.map((name) => {
                      const isSelected = crewMembers.includes(name);
                      return (
                        <motion.button
                          key={name}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          layout
                          onClick={() => toggleMember(name)}
                          className={`rounded-full px-4 py-2 text-sm border transition-colors flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-sky-blue/15 text-sky-700 border-sky-blue/40"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={2.5} />}
                          {name}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Today's crew count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.85 }}
              className="mb-6"
            >
              <p className="text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                <Users size={14} strokeWidth={1.5} className="text-sky-blue" />
                Today's crew
                <span className="bg-sky-blue/15 text-sky-700 rounded-full px-2.5 py-0.5 text-xs tabular-nums">
                  {crewMembers.length}
                </span>
              </p>
              {crewMembers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {[...crewMembers].sort((a, b) => a.localeCompare(b)).map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          type: "spring",
                          duration: 0.35,
                          bounce: 0.2,
                          delay: i * 0.03,
                        }}
                        layout
                        className="flex items-center gap-2 bg-sky-blue/15 border border-sky-blue/30 text-sky-700 rounded-full pl-4 pr-2 py-2"
                      >
                        <span className="text-sm">{name}</span>
                        <button
                          type="button"
                          onClick={() => toggleMember(name)}
                          className="w-6 h-6 rounded-full bg-sky-blue/20 flex items-center justify-center hover:bg-sky-blue/35 transition-colors"
                        >
                          <span className="text-sky-700 text-xs">✕</span>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-sm text-gray-300 italic">
                  No crew added yet
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA - pinned inside white panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex-shrink-0 bg-white/90 backdrop-blur-lg border-t border-alice-blue/50 px-6 py-5"
        >
          <div className="max-w-md mx-auto">
            <motion.button
              whileTap={crewMembers.length > 0 ? { scale: 0.97 } : undefined}
              onClick={() => onComplete(crewMembers)}
              disabled={crewMembers.length === 0}
              className={`w-full rounded-full py-4 text-center transition-all duration-200 ${
                crewMembers.length > 0
                  ? "bg-periwinkle text-white hover:shadow-soft"
                  : "bg-periwinkle/30 text-white/50 cursor-not-allowed"
              }`}
            >
              Continue
            </motion.button>
            {crewMembers.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Add at least one crew member to continue
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}