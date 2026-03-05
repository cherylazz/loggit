import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import binocularsIcon from "figma:asset/cc369f8ff92cf33a90f00c520861310e3191ab17.png";
import weatherIcon from "figma:asset/1b1bffb92486ea65cef0bab5add8631aa363223e.png";

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: "weather" | "sighting") => void;
}

export function QuickActionSheet({
  isOpen,
  onClose,
  onSelectAction,
}: QuickActionSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-30"
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2>Quick log</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectAction("weather");
                    onClose();
                  }}
                  className="w-full bg-alice-blue/50 rounded-2xl p-5 flex items-center gap-4 border-2 border-transparent hover:border-sky-blue transition-colors"
                >
                  <img
                    src={weatherIcon}
                    alt="Weather Icon"
                    className="w-12 h-12"
                  />
                  <div className="flex-1 text-left">
                    <p>New Weather Log</p>
                    <p className="text-sm text-gray-500">
                      Record current conditions
                    </p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectAction("sighting");
                    onClose();
                  }}
                  className="w-full bg-alice-blue/50 rounded-2xl p-5 flex items-center gap-4 border-2 border-transparent hover:border-sky-blue transition-colors"
                >
                  <img
                    src={binocularsIcon}
                    alt="Binoculars Icon"
                    className="w-12 h-12"
                  />
                  <div className="flex-1 text-left">
                    <p>New Sighting</p>
                    <p className="text-sm text-gray-500">
                      Log what you spotted
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}