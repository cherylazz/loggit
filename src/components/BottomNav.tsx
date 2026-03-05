import { Home, Cloud, Binoculars, List, Settings, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const isOnline = useOnlineStatus();

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "weather", icon: Cloud, label: "Weather" },
    { id: "sightings", icon: Binoculars, label: "Sightings" },
    { id: "logs", icon: List, label: "Logs" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-alice-blue safe-area-bottom">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 bg-amber-50 text-amber-700 py-1.5 text-xs">
              <WifiOff size={12} />
              <span>You're offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-md mx-auto flex justify-around items-center px-4 pb-5 pt-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 text-center"
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -top-3 w-1 h-1 rounded-full bg-periwinkle"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <motion.div
                animate={{
                  color: isActive ? "#B2B1CF" : "#9ca3af",
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                <Icon size={24} strokeWidth={1.5} />
              </motion.div>
              <motion.span
                className="text-xs"
                animate={{
                  color: isActive ? "#B2B1CF" : "#9ca3af",
                }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
