import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  ChevronRight,
  Thermometer,
  Wind,
  Waves,
  Eye,
  MapPin,
  StickyNote,
  Binoculars,
  Ruler,
  ArrowRight,
  Pencil,
  Check,
  X,
  Users,
} from "lucide-react";
import { getSpeciesEmoji } from "./speciesEmoji";

interface Log {
  id: string;
  type: "weather" | "sighting";
  timestamp: string;
  [key: string]: any;
}

interface LogsProps {
  logs: Log[];
  onDelete: (id: string) => void;
  onUpdate?: (id: string, data: any) => void;
  crewMembers?: string[];
}

const inputStyles =
  "w-full bg-alice-blue/40 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none border border-transparent focus:border-periwinkle/40 transition-colors tabular-nums";

const visibilityOptions = ["poor", "moderate", "good", "excellent"];
const behaviourOptions = [
  "travelling",
  "feeding",
  "resting",
  "socialising",
  "breaching",
  "milling",
];

export function Logs({ logs, onDelete, onUpdate, crewMembers = [] }: LogsProps) {
  const [activeTab, setActiveTab] = useState<"weather" | "sightings">(
    "weather"
  );
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const weatherLogs = logs.filter((log) => log.type === "weather");
  const sightingLogs = logs.filter((log) => log.type === "sighting");

  const currentLogs = activeTab === "weather" ? weatherLogs : sightingLogs;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDetail = (log: Log) => {
    setSelectedLog(log);
    setIsEditing(false);
    setEditForm({});
  };

  const startEditing = () => {
    if (!selectedLog) return;
    setIsEditing(true);
    if (selectedLog.type === "weather") {
      setEditForm({
        temperature: selectedLog.temperature ?? "",
        windSpeed: selectedLog.windSpeed ?? "",
        waveHeight: selectedLog.waveHeight ?? "",
        visibility: selectedLog.visibility ?? "good",
        location: selectedLog.location ?? "",
        notes: selectedLog.notes ?? "",
        crew: selectedLog.crew ? [...selectedLog.crew] : [],
      });
    } else {
      setEditForm({
        species: selectedLog.species ?? "",
        count: selectedLog.count ?? 1,
        behaviour: selectedLog.behaviour ?? "travelling",
        distance: selectedLog.distance ?? 50,
        location: selectedLog.location ?? "",
        notes: selectedLog.notes ?? "",
        crew: selectedLog.crew ? [...selectedLog.crew] : [],
      });
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveEditing = () => {
    if (!selectedLog || !onUpdate) return;
    onUpdate(selectedLog.id, editForm);
    // Update the local selectedLog to reflect changes immediately
    setSelectedLog({ ...selectedLog, ...editForm });
    setIsEditing(false);
    setEditForm({});
  };

  const closeDetail = () => {
    setSelectedLog(null);
    setIsEditing(false);
    setEditForm({});
    setShowDeleteConfirm(false);
    setDeleteInput("");
  };

  const toggleCrewMember = (name: string) => {
    const current: string[] = editForm.crew || [];
    if (current.includes(name)) {
      setEditForm({ ...editForm, crew: current.filter((n: string) => n !== name) });
    } else {
      setEditForm({ ...editForm, crew: [...current, name] });
    }
  };

  // All available crew: session crew + any extras already on this log
  const allCrewOptions = selectedLog
    ? Array.from(new Set([...crewMembers, ...(selectedLog.crew || [])])).sort((a, b) => a.localeCompare(b))
    : crewMembers;

  return (
    <div className="pb-28 px-6 pt-14">
      <div className="max-w-md mx-auto">
        <h1 className="mb-8">All logged</h1>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("weather")}
            className={`flex-1 py-3 rounded-full transition-all text-center ${
              activeTab === "weather"
                ? "bg-periwinkle text-white"
                : "bg-alice-blue/30 text-gray-500"
            }`}
          >
            Weather
          </button>
          <button
            onClick={() => setActiveTab("sightings")}
            className={`flex-1 py-3 rounded-full transition-all text-center ${
              activeTab === "sightings"
                ? "bg-periwinkle text-white"
                : "bg-alice-blue/30 text-gray-500"
            }`}
          >
            Sightings
          </button>
        </div>

        <div className="space-y-4">
          {currentLogs.length === 0 ? (
            <div className="bg-alice-blue/30 rounded-2xl p-10 text-center text-gray-500">
              No logs yet. Let's start a streak.
            </div>
          ) : (
            currentLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                transition={{ type: "spring", duration: 0.45, bounce: 0 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-5 shadow-card border border-alice-blue">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {log.type === "weather" ? "🌤" : getSpeciesEmoji(log.species || "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        {log.type === "weather"
                          ? `${log.temperature}°C, ${log.windSpeed}kts`
                          : log.species}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-gray-400">
                          {formatDate(log.timestamp)} •{" "}
                          {formatTime(log.timestamp)}
                        </p>
                        {log.crew && log.crew.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Users size={11} strokeWidth={1.5} />
                            {log.crew.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openDetail(log)}
                      className="text-periwinkle"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ─── Detail Sheet ─── */}
      {createPortal(
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-20"
              onClick={closeDetail}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="fixed bottom-0 left-0 right-0 top-auto bg-white rounded-t-3xl z-30 max-h-[85vh] flex flex-col"
            >
              <div className="shrink-0 pt-5 px-6">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              </div>
              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-6"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="max-w-md mx-auto">

                  {/* Header with edit/save/cancel */}
                  <div className="flex items-center justify-between mb-6">
                    <h2>
                      {selectedLog.type === "weather"
                        ? "Weather Log"
                        : "Sighting Details"}
                    </h2>
                    {onUpdate && (
                      <div className="flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={cancelEditing}
                              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-400"
                            >
                              <X size={16} strokeWidth={1.5} />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={saveEditing}
                              className="w-9 h-9 rounded-xl flex items-center justify-center bg-periwinkle text-white"
                            >
                              <Check size={16} strokeWidth={2} />
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={startEditing}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-alice-blue/60 text-gray-400"
                          >
                            <Pencil size={15} strokeWidth={1.5} />
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                          type: "spring",
                          duration: 0.3,
                          bounce: 0,
                        }}
                      >
                        {selectedLog.type === "weather" ? (
                          /* ─── Weather edit form ─── */
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">
                                  Temperature (°C)
                                </label>
                                <input
                                  type="number"
                                  value={editForm.temperature}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      temperature: e.target.value,
                                    })
                                  }
                                  className={inputStyles}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">
                                  Wind Speed (kts)
                                </label>
                                <input
                                  type="number"
                                  value={editForm.windSpeed}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      windSpeed: e.target.value,
                                    })
                                  }
                                  className={inputStyles}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">
                                  Wave Height (m)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editForm.waveHeight}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      waveHeight: e.target.value,
                                    })
                                  }
                                  className={inputStyles}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">
                                  Visibility
                                </label>
                                <select
                                  value={editForm.visibility}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      visibility: e.target.value,
                                    })
                                  }
                                  className={inputStyles}
                                >
                                  {visibilityOptions.map((v) => (
                                    <option key={v} value={v}>
                                      {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">
                                Location
                              </label>
                              <input
                                type="text"
                                value={editForm.location}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    location: e.target.value,
                                  })
                                }
                                className={inputStyles}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">
                                Notes
                              </label>
                              <textarea
                                value={editForm.notes}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    notes: e.target.value,
                                  })
                                }
                                rows={3}
                                className={`${inputStyles} resize-none`}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">
                                Crew
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {allCrewOptions.map((member) => (
                                  <button
                                    key={member}
                                    onClick={() => toggleCrewMember(member)}
                                    className={`bg-alice-blue/30 rounded-full px-3 py-1 text-xs ${
                                      editForm.crew.includes(member) ? "bg-periwinkle text-white" : ""
                                    }`}
                                  >
                                    {member}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ─── Sighting edit form ─── */
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">
                                Species
                              </label>
                              <input
                                type="text"
                                value={editForm.species}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    species: e.target.value,
                                  })
                                }
                                className={inputStyles}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">
                                  Count
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={editForm.count}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      count: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className={inputStyles}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">
                                  Distance (m)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editForm.distance}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      distance: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className={inputStyles}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">
                                  Behaviour
                                </label>
                                <select
                                  value={editForm.behaviour}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      behaviour: e.target.value,
                                    })
                                  }
                                  className={inputStyles}
                                >
                                  {behaviourOptions.map((b) => (
                                    <option key={b} value={b}>
                                      {b.charAt(0).toUpperCase() + b.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">
                                Location
                              </label>
                              <input
                                type="text"
                                value={editForm.location}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    location: e.target.value,
                                  })
                                }
                                className={inputStyles}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">
                                Notes
                              </label>
                              <textarea
                                value={editForm.notes}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    notes: e.target.value,
                                  })
                                }
                                rows={3}
                                className={`${inputStyles} resize-none`}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">
                                Crew
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {allCrewOptions.map((member) => (
                                  <button
                                    key={member}
                                    onClick={() => toggleCrewMember(member)}
                                    className={`bg-alice-blue/30 rounded-full px-3 py-1 text-xs ${
                                      editForm.crew.includes(member) ? "bg-periwinkle text-white" : ""
                                    }`}
                                  >
                                    {member}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                          type: "spring",
                          duration: 0.3,
                          bounce: 0,
                        }}
                      >
                        {selectedLog.type === "weather" ? (
                          /* ─── Weather infographic view ─── */
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-sky-blue/10 rounded-xl p-4 flex items-center gap-3">
                                <Thermometer
                                  size={20}
                                  className="text-sky-blue shrink-0"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <p className="text-xs text-gray-400">Temp</p>
                                  <p className="text-[#1A1A1A] tabular-nums">
                                    {selectedLog.temperature}°C
                                  </p>
                                </div>
                              </div>
                              <div className="bg-sky-blue/10 rounded-xl p-4 flex items-center gap-3">
                                <Wind
                                  size={20}
                                  className="text-sky-blue shrink-0"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <p className="text-xs text-gray-400">Wind</p>
                                  <p className="text-[#1A1A1A] tabular-nums">
                                    {selectedLog.windSpeed} kts
                                  </p>
                                </div>
                              </div>
                              <div className="bg-sky-blue/10 rounded-xl p-4 flex items-center gap-3">
                                <Waves
                                  size={20}
                                  className="text-sky-blue shrink-0"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <p className="text-xs text-gray-400">Waves</p>
                                  <p className="text-[#1A1A1A] tabular-nums">
                                    {selectedLog.waveHeight} m
                                  </p>
                                </div>
                              </div>
                              <div className="bg-sky-blue/10 rounded-xl p-4 flex items-center gap-3">
                                <Eye
                                  size={20}
                                  className="text-sky-blue shrink-0"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <p className="text-xs text-gray-400">
                                    Visibility
                                  </p>
                                  <p className="text-[#1A1A1A] capitalize">
                                    {selectedLog.visibility}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {selectedLog.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin size={14} strokeWidth={1.5} />
                                <span>{selectedLog.location}</span>
                              </div>
                            )}

                            {selectedLog.notes && (
                              <div className="flex items-start gap-2.5 bg-alice-blue/30 rounded-xl p-4">
                                <StickyNote
                                  size={15}
                                  className="text-gray-400 mt-0.5 shrink-0"
                                  strokeWidth={1.5}
                                />
                                <p className="text-sm text-gray-600">
                                  {selectedLog.notes}
                                </p>
                              </div>
                            )}

                            {/* Crew - Spotted by */}
                            {selectedLog.crew && selectedLog.crew.length > 0 && (
                              <div className="flex items-start gap-2.5">
                                <Users
                                  size={15}
                                  className="text-sky-blue mt-0.5 shrink-0"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <p className="text-xs text-gray-400 mb-1.5">Observers</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {[...selectedLog.crew].sort((a: string, b: string) => a.localeCompare(b)).map((name: string) => (
                                      <span
                                        key={name}
                                        className="bg-sky-blue/10 text-sky-700 rounded-full px-3 py-1 text-xs"
                                      >
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* ─── Sighting infographic view ─── */
                          <div className="space-y-5">
                            {selectedLog.photo && (
                              <div className="rounded-xl overflow-hidden">
                                <img
                                  src={selectedLog.photo}
                                  alt={selectedLog.species}
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}

                            <div className="bg-periwinkle/10 rounded-xl p-4">
                              <p className="text-xs text-gray-400 mb-1">
                                Species
                              </p>
                              <p className="text-[#1A1A1A]">
                                {selectedLog.species}
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-periwinkle/10 rounded-xl p-4 text-center">
                                <Binoculars
                                  size={18}
                                  className="mx-auto mb-2 text-periwinkle"
                                  strokeWidth={1.5}
                                />
                                <p className="text-xs text-gray-400">Count</p>
                                <p className="text-[#1A1A1A] tabular-nums">
                                  {selectedLog.count}
                                </p>
                              </div>
                              <div className="bg-periwinkle/10 rounded-xl p-4 text-center">
                                <Ruler
                                  size={18}
                                  className="mx-auto mb-2 text-periwinkle"
                                  strokeWidth={1.5}
                                />
                                <p className="text-xs text-gray-400">Distance</p>
                                <p className="text-[#1A1A1A] tabular-nums">
                                  {selectedLog.distance} m
                                </p>
                              </div>
                              <div className="bg-periwinkle/10 rounded-xl p-4 text-center">
                                <ArrowRight
                                  size={18}
                                  className="mx-auto mb-2 text-periwinkle"
                                  strokeWidth={1.5}
                                />
                                <p className="text-xs text-gray-400">
                                  Behaviour
                                </p>
                                <p className="text-[#1A1A1A] text-sm capitalize truncate">
                                  {selectedLog.behaviour}
                                </p>
                              </div>
                            </div>

                            {selectedLog.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin size={14} strokeWidth={1.5} />
                                <span>{selectedLog.location}</span>
                              </div>
                            )}

                            {selectedLog.notes && (
                              <div className="flex items-start gap-2.5 bg-alice-blue/30 rounded-xl p-4">
                                <StickyNote
                                  size={15}
                                  className="text-gray-400 mt-0.5 shrink-0"
                                  strokeWidth={1.5}
                                />
                                <p className="text-sm text-gray-600">
                                  {selectedLog.notes}
                                </p>
                              </div>
                            )}

                            {/* Crew - Spotted by */}
                            {selectedLog.crew && selectedLog.crew.length > 0 && (
                              <div className="flex items-start gap-2.5">
                                <Users
                                  size={15}
                                  className="text-periwinkle mt-0.5 shrink-0"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <p className="text-xs text-gray-400 mb-1.5">Spotted by</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {[...selectedLog.crew].sort((a: string, b: string) => a.localeCompare(b)).map((name: string) => (
                                      <span
                                        key={name}
                                        className="bg-periwinkle/10 text-periwinkle rounded-full px-3 py-1 text-xs"
                                      >
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Timestamp + actions */}
                  <div className="mt-6 pt-4 border-t border-alice-blue">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                      <span>
                        Logged {formatDate(selectedLog.timestamp)} at{" "}
                        {formatTime(selectedLog.timestamp)}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={closeDetail}
                        className="flex-1 bg-periwinkle text-white rounded-full py-3.5 text-center"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-14 rounded-full border border-red-200 flex items-center justify-center text-red-400"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* ─── Delete Confirmation ─── */}
      {createPortal(
      <AnimatePresence>
        {showDeleteConfirm && selectedLog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteInput("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 z-50 shadow-xl max-w-sm mx-auto"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
                <Trash2 size={20} className="text-red-400" strokeWidth={1.5} />
              </div>

              <h2 className="text-center mb-2">Delete this log?</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                This can't be undone. Type <span className="text-red-400 bg-red-50 px-1.5 py-0.5 rounded">delete</span> to confirm.
              </p>

              <div className="mb-5">
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="type delete"
                  autoFocus
                  className="w-full bg-alice-blue/40 rounded-xl px-4 py-3 text-sm text-center text-[#1A1A1A] outline-none border-2 border-transparent focus:border-red-200 transition-colors placeholder:text-gray-300"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                  }}
                  className="flex-1 bg-gray-100 text-gray-500 rounded-full py-3.5 text-center"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={deleteInput.toLowerCase() === "delete" ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (deleteInput.toLowerCase() === "delete" && selectedLog) {
                      onDelete(selectedLog.id);
                      closeDetail();
                    }
                  }}
                  disabled={deleteInput.toLowerCase() !== "delete"}
                  className={`flex-1 rounded-full py-3.5 text-center transition-all ${ deleteInput.toLowerCase() === "delete" ? "bg-red-500 text-white" : "bg-red-100 text-red-300 cursor-not-allowed" } px-[10px] py-[14px]`}
                >
                  Delete permanently
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}