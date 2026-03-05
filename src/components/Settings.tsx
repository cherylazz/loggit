import { motion, AnimatePresence } from "motion/react";
import { User, Ruler, Download, Palette, ChevronRight, Bell, BellOff, RotateCcw } from "lucide-react";
import { useState } from "react";
import ExcelJS from "exceljs";

interface Log {
  id: string;
  type: "weather" | "sighting";
  timestamp: string;
  [key: string]: any;
}

interface SettingsProps {
  weatherReminderEnabled: boolean;
  onToggleWeatherReminder: () => void;
  notificationPermission: NotificationPermission | "unsupported";
  logs: Log[];
  onResetJourney: () => void;
}

export function Settings({
  weatherReminderEnabled,
  onToggleWeatherReminder,
  notificationPermission,
  logs,
  onResetJourney,
}: SettingsProps) {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showExportEmpty, setShowExportEmpty] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState("");

  const handleExport = async () => {
    if (logs.length === 0) {
      setShowExportEmpty(true);
      setTimeout(() => setShowExportEmpty(false), 2000);
      return;
    }

    const excludeKeys = new Set(["id", "photo", "type"]);

    // Sighting columns in form order
    const sightingOrder = ["timestamp", "species", "count", "behaviour", "distance", "location", "notes", "crew"];
    // Weather columns in form order
    const weatherOrder = ["timestamp", "location", "temperature", "windSpeed", "waveHeight", "visibility", "notes", "crew"];

    const formatValue = (value: any): string => {
      if (value === null || value === undefined) return "";
      if (Array.isArray(value)) return value.join("; ");
      return String(value);
    };

    const getColumns = (items: Log[], columnOrder: string[]) => {
      const allKeys = new Set<string>();
      items.forEach((log) => {
        Object.keys(log).forEach((key) => {
          if (!excludeKeys.has(key)) allKeys.add(key);
        });
      });
      return [
        ...columnOrder.filter((k) => allKeys.has(k)),
        ...[...allKeys]
          .filter((k) => !columnOrder.includes(k))
          .sort((a, b) => a.localeCompare(b)),
      ];
    };

    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FF1A1A1A" } };
    const sightingFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB2B1CF" } };
    const weatherFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE1F2FE" } };

    const addSheet = (wb: ExcelJS.Workbook, name: string, items: Log[], columnOrder: string[], fill: ExcelJS.Fill) => {
      const columns = items.length > 0 ? getColumns(items, columnOrder) : columnOrder;
      const ws = wb.addWorksheet(name);
      ws.columns = columns.map((key) => ({ header: key, key, width: 18 }));

      // Style header row
      ws.getRow(1).eachCell((cell) => {
        cell.font = headerFont;
        cell.fill = fill;
      });

      // Add data rows
      items.forEach((log) => {
        const row: Record<string, string> = {};
        columns.forEach((key) => {
          row[key] = formatValue(log[key]);
        });
        ws.addRow(row);
      });
    };

    const sightings = logs.filter((l) => l.type === "sighting");
    const weather = logs.filter((l) => l.type === "weather");

    const wb = new ExcelJS.Workbook();
    addSheet(wb, "Sightings", sightings, sightingOrder, sightingFill);
    addSheet(wb, "Weather", weather, weatherOrder, weatherFill);

    // Trigger download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `loggit-export-${date}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  };

  const reminderSubtext = weatherReminderEnabled
    ? notificationPermission === "granted"
      ? "Every 30 min, notifications on"
      : notificationPermission === "denied"
        ? "Every 30 min, in-app only (notifications blocked)"
        : "Every 30 min, in-app alerts"
    : "Get nudged to log conditions";

  return (
    <div className="pb-28 px-6 pt-14">
      <div className="max-w-md mx-auto">
        <h1 className="mb-2">Settings</h1>
        <p className="text-gray-500 mb-8">Switch it up however you like.</p>

        <div className="space-y-4">
          {/* Weather Reminder Toggle */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-alice-blue">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                weatherReminderEnabled ? "bg-sky-blue/20" : "bg-gray-100"
              }`}>
                {weatherReminderEnabled ? (
                  <Bell size={20} className="text-sky-blue" strokeWidth={1.5} />
                ) : (
                  <BellOff size={20} className="text-gray-400" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex-1">
                <p>Weather reminders</p>
                <p className="text-sm text-gray-400 mt-0.5">{reminderSubtext}</p>
              </div>
              {/* Toggle switch */}
              <button
                onClick={onToggleWeatherReminder}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  weatherReminderEnabled ? "bg-periwinkle" : "bg-gray-200"
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm"
                  animate={{
                    left: weatherReminderEnabled ? 22 : 2,
                  }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                />
              </button>
            </div>

            {/* Permission hint */}
            <AnimatePresence>
              {weatherReminderEnabled && notificationPermission === "denied" && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                  className="text-xs text-gray-400 mt-3 pl-14"
                >
                  Tip: allow notifications in your browser settings for alerts even when the app is backgrounded.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-white rounded-2xl p-5 shadow-card border border-alice-blue flex items-center gap-4 hover:border-sky-blue transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-periwinkle/20 flex items-center justify-center">
              <User size={20} className="text-periwinkle" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <p>Profile</p>
              <p className="text-sm text-gray-400 mt-0.5">
                Manage your account
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </motion.button>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-alice-blue">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-sky-blue/20 flex items-center justify-center">
                <Ruler size={20} className="text-sky-blue" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p>Units</p>
                <p className="text-sm text-gray-400 mt-0.5">Choose your preference</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setUnits("metric")}
                className={`flex-1 py-2.5 rounded-full transition-all text-center ${
                  units === "metric"
                    ? "bg-periwinkle text-white"
                    : "bg-alice-blue/30 text-gray-500"
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => setUnits("imperial")}
                className={`flex-1 py-2.5 rounded-full transition-all text-center ${
                  units === "imperial"
                    ? "bg-periwinkle text-white"
                    : "bg-alice-blue/30 text-gray-500"
                }`}
              >
                Imperial
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleExport}
            className="w-full bg-white rounded-2xl p-5 shadow-card border border-alice-blue flex items-center gap-4 hover:border-sky-blue transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-sky-blue/20 flex items-center justify-center">
              <Download size={20} className="text-sky-blue" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <p>Export to Excel</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {logs.length === 0
                  ? "No logs yet"
                  : `${logs.length} log${logs.length === 1 ? "" : "s"} ready`}
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-white rounded-2xl p-5 shadow-card border border-alice-blue flex items-center gap-4 hover:border-sky-blue transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-periwinkle/20 flex items-center justify-center">
              <Palette size={20} className="text-periwinkle" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <p>Theme</p>
              <p className="text-sm text-gray-400 mt-0.5">
                Light mode only for now
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </motion.button>

          {/* Reset Journey */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { setShowResetConfirm(true); setResetInput(""); }}
            className="w-full bg-white rounded-2xl p-5 shadow-card border border-red-200 flex items-center gap-4 hover:border-red-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <RotateCcw size={20} className="text-red-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-red-500">Reset journey</p>
              <p className="text-sm text-gray-400 mt-0.5">
                Clear all logs, crew &amp; start fresh
              </p>
            </div>
            <ChevronRight size={20} className="text-red-300" />
          </motion.button>
        </div>

        <div className="mt-16 text-center text-sm text-gray-400">
          <p>LoggIT v1.0</p>
          <p className="mt-1">Made with 💙 for marine researchers</p>
        </div>
      </div>

      {/* Export success toast */}
      <AnimatePresence>
        {showExportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
            transition={{ type: "spring", duration: 0.45, bounce: 0 }}
            className="fixed top-10 left-6 right-6 bg-sky-blue text-white rounded-2xl p-4 text-center shadow-soft z-50"
          >
            All done! Check your downloads. ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export empty toast */}
      <AnimatePresence>
        {showExportEmpty && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
            transition={{ type: "spring", duration: 0.45, bounce: 0 }}
            className="fixed top-10 left-6 right-6 bg-red-500 text-white rounded-2xl p-4 text-center shadow-soft z-50"
          >
            No logs to export. Add some first! ✖️
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirmation dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <RotateCcw size={24} className="text-red-400" strokeWidth={1.5} />
                </div>
                <h2 className="mb-1">Start over?</h2>
                <p className="text-sm text-gray-500">
                  This will erase all logs, saved crew names, and preferences. There's no undo.
                </p>
              </div>
              <div className="mb-4">
                <label className="text-sm text-gray-500 block mb-1.5">
                  Type <span className="text-red-500">reset</span> to confirm
                </label>
                <input
                  type="text"
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value.toLowerCase())}
                  placeholder="reset"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-center focus:outline-none focus:border-red-300 transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (resetInput === "reset") {
                      setShowResetConfirm(false);
                      onResetJourney();
                    }
                  }}
                  disabled={resetInput !== "reset"}
                  className={`flex-1 py-2.5 rounded-full transition-all ${
                    resetInput === "reset"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Reset everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}