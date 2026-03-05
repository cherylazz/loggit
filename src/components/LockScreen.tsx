import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface LockScreenProps {
  onUnlock: () => void;
}

// ═══════════════════════════════════════════════════════
// Change this to your own password.
// Note: since this is a client-side app, a determined
// user could find this in the source code. For true
// access control, you'd need server-side auth.
// ═══════════════════════════════════════════════════════
const APP_PASSWORD = "loggit2026";

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleUnlock = () => {
    if (!password.trim()) return;

    if (password.trim() === APP_PASSWORD) {
      sessionStorage.setItem("loggit-auth", "true");
      onUnlock();
    } else {
      setError("Wrong password");
      setShakeKey((k) => k + 1);
      setPassword("");
      inputRef.current?.focus();
      setTimeout(() => setError(""), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleUnlock();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)", scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
    >
      <div className="w-full max-w-sm px-8">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.15, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#B2B1CF]/10 flex items-center justify-center">
            <Lock size={30} className="text-[#B2B1CF]" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">LoggIT</h1>
          <p className="text-sm text-gray-400">
            Enter password to continue
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          key={shakeKey}
          animate={error ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Password"
              autoComplete="off"
              className="w-full bg-[#E1F2FE]/40 rounded-2xl px-5 py-4 text-center text-[#1A1A1A] outline-none border-2 border-transparent focus:border-[#B2B1CF]/30 transition-colors placeholder:text-gray-300 tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.5} />
              ) : (
                <Eye size={18} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-400 text-center mt-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleUnlock}
          className="w-full bg-[#B2B1CF] text-white rounded-full py-4 text-center mt-6 transition-colors active:bg-[#B2B1CF]/90"
        >
          Unlock
        </motion.button>
      </div>
    </motion.div>
  );
}