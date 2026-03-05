import { motion } from "motion/react";
import { X, Cloud } from "lucide-react";

interface WeatherReminderBannerProps {
  onLogWeather: () => void;
  onDismiss: () => void;
}

export function WeatherReminderBanner({
  onLogWeather,
  onDismiss,
}: WeatherReminderBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
      transition={{ type: "spring", duration: 0.45, bounce: 0 }}
      className="fixed top-10 left-4 right-4 z-50"
    >
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-sky-blue/30 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-blue/20 flex items-center justify-center shrink-0 mt-0.5">
            <Cloud size={20} className="text-sky-blue" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#1A1A1A]">Time for a weather check! 🌤</p>
            <p className="text-sm text-gray-500 mt-0.5">
              It's been 30 minutes since your last one.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onLogWeather}
              className="mt-3 bg-periwinkle text-white rounded-full px-5 py-2 text-sm transition-shadow duration-150 hover:shadow-soft"
            >
              Log weather now
            </motion.button>
          </div>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
