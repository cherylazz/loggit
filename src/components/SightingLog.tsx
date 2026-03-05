import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, Upload, ChevronDown, Sparkles, CheckCircle, MapPin } from "lucide-react";
import { Users } from "lucide-react";
import binocularsIcon from "figma:asset/cc369f8ff92cf33a90f00c520861310e3191ab17.png";
import { parseSightingTranscript } from "./transcriptParser";

interface SightingLogProps {
  onSave: (data: any) => void;
  onNavigateHome: () => void;
  pendingTranscript?: string;
  clearPendingTranscript?: () => void;
  crewMembers?: string[];
}

export function SightingLog({ onSave, onNavigateHome, pendingTranscript, clearPendingTranscript, crewMembers = [] }: SightingLogProps) {
  const [formData, setFormData] = useState({
    species: "",
    count: 1,
    behaviour: "travelling",
    distance: 50,
    notes: "",
    photo: null as string | null,
    location: "Getting location...",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [filteredSpecies, setFilteredSpecies] = useState<string[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const speciesList = [
    "Bottlenose Dolphin",
    "Humpback Whale",
    "Grey Whale",
    "Sea Turtle",
    "Albatross",
    "Pelican",
    "Sea Lion",
    "Orca",
    "Blue Whale",
  ];

  // Get real GPS location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(4)}° ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? "E" : "W"}`,
          }));
        },
        () => {
          setFormData((prev) => ({
            ...prev,
            location: "37.7749° N, 122.4194° W",
          }));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        location: "37.7749° N, 122.4194° W",
      }));
    }
  }, []);

  // Handle pending transcript - parse and fill form fields
  useEffect(() => {
    if (pendingTranscript) {
      const parsed = parseSightingTranscript(pendingTranscript);

      setFormData((prev) => ({
        ...prev,
        species: parsed.species || prev.species,
        count: parsed.count || prev.count,
        behaviour: parsed.behaviour || prev.behaviour,
        distance: parsed.distance || prev.distance,
        notes: parsed.notes || prev.notes,
      }));

      // Track which fields were auto-filled for the indicator
      const filled: string[] = [];
      if (parsed.species) filled.push("species");
      if (parsed.count) filled.push("count");
      if (parsed.behaviour) filled.push("behaviour");
      if (parsed.distance) filled.push("distance");
      setAutoFilledFields(filled);

      // Clear the indicator after a few seconds
      if (filled.length > 0) {
        setTimeout(() => setAutoFilledFields([]), 4000);
      }

      clearPendingTranscript?.();
    }
  }, [pendingTranscript, clearPendingTranscript]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSpeciesDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter species based on input
  useEffect(() => {
    if (formData.species) {
      const filtered = speciesList.filter((species) =>
        species.toLowerCase().includes(formData.species.toLowerCase())
      );
      setFilteredSpecies(filtered);
    } else {
      setFilteredSpecies(speciesList);
    }
  }, [formData.species]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      timestamp: new Date().toISOString(),
      type: "sighting",
      crew: selectedCrew,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        species: "",
        count: 1,
        behaviour: "travelling",
        distance: 50,
        notes: "",
        photo: null,
        location: "Getting location...",
      });
      onNavigateHome();
    }, 2200);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-28 px-6 pt-14">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1>New sighting</h1>
          <img
            src={binocularsIcon}
            alt="Binoculars Icon"
            className="w-9 h-9"
          />
        </div>

        {/* Auto-filled indicator */}
        <AnimatePresence>
          {autoFilledFields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 bg-sky-blue/10 border border-sky-blue/30 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-sky-blue" />
                <span className="text-sm text-gray-700">Voice filled these in for you:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {autoFilledFields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex bg-sky-blue/15 text-sky-700 rounded-full px-3 py-1 text-xs capitalize"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GPS Location */}
          <div>
            <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            <div className="bg-alice-blue/50 rounded-2xl px-4 py-3.5 text-gray-600">
              {formData.location}
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm text-gray-600 mb-2">Species</label>
            <div className="relative">
              <input
                type="text"
                value={formData.species}
                onChange={(e) => {
                  setFormData({ ...formData, species: e.target.value });
                  setShowSpeciesDropdown(true);
                }}
                onFocus={() => setShowSpeciesDropdown(true)}
                className="w-full bg-white border border-alice-blue rounded-2xl px-4 py-3.5 pr-10 outline-none focus:border-sky-blue transition-colors"
                placeholder="Search dolphins, whales, turtles..."
                required
              />
              <ChevronDown
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {showSpeciesDropdown && filteredSpecies.length > 0 && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  style={{ transformOrigin: "top" }}
                  className="absolute z-10 w-full mt-2 bg-white border border-alice-blue rounded-2xl shadow-soft max-h-60 overflow-y-auto"
                >
                  {filteredSpecies.map((species) => (
                    <button
                      key={species}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, species });
                        setShowSpeciesDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-alice-blue/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      {species}
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-3">Count</label>
            <div className="flex items-center gap-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setFormData({
                    ...formData,
                    count: Math.max(1, formData.count - 1),
                  })
                }
                className="w-12 h-12 rounded-full border-2 border-periwinkle text-periwinkle flex items-center justify-center"
              >
                <Minus size={20} />
              </motion.button>
              <div className="flex-1 text-center text-2xl">{formData.count}</div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setFormData({ ...formData, count: formData.count + 1 })
                }
                className="w-12 h-12 rounded-full border-2 border-periwinkle text-periwinkle flex items-center justify-center"
              >
                <Plus size={20} />
              </motion.button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Behaviour
            </label>
            <select
              value={formData.behaviour}
              onChange={(e) =>
                setFormData({ ...formData, behaviour: e.target.value })
              }
              className="w-full bg-white border border-alice-blue rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors"
            >
              <option value="feeding">Feeding</option>
              <option value="travelling">Travelling</option>
              <option value="resting">Resting</option>
              <option value="playing">Playing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-3">
              Distance (m)
            </label>
            <input
              type="range"
              min="10"
              max="500"
              value={formData.distance}
              onChange={(e) =>
                setFormData({ ...formData, distance: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-alice-blue rounded-lg appearance-none cursor-pointer accent-periwinkle"
            />
            <div className="text-center text-gray-500 mt-2">
              {formData.distance}m away
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full bg-white border border-alice-blue rounded-2xl px-4 py-3.5 outline-none focus:border-sky-blue transition-colors resize-none"
              rows={3}
              placeholder="Anything special?"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Photo (optional)
            </label>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="w-full bg-alice-blue/30 border-2 border-dashed border-periwinkle/60 rounded-2xl px-4 py-10 flex flex-col items-center gap-2 hover:bg-alice-blue/50 transition-colors">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Upload preview"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ) : (
                  <>
                    <Upload size={28} className="text-periwinkle" />
                    <span className="text-gray-500 text-sm">Tap to add photo</span>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Crew observer picker */}
          {crewMembers.length > 0 && (
            <div>
              <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                <Users size={15} strokeWidth={1.5} />
                Who spotted it?
              </label>
              <div className="flex flex-wrap gap-2">
                {crewMembers.map((member) => {
                  const isSelected = selectedCrew.includes(member);
                  return (
                    <button
                      key={member}
                      type="button"
                      onClick={() =>
                        isSelected
                          ? setSelectedCrew(selectedCrew.filter((m) => m !== member))
                          : setSelectedCrew([...selectedCrew, member])
                      }
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-periwinkle text-white shadow-sm"
                          : "bg-alice-blue/50 text-gray-500 border border-alice-blue"
                      }`}
                    >
                      {member}
                    </button>
                  );
                })}
              </div>
              {selectedCrew.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {selectedCrew.length} selected
                </p>
              )}
            </div>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full bg-periwinkle text-white rounded-full py-4 mt-4 text-center transition-shadow duration-150 hover:shadow-soft"
          >
            Save that sighting!
          </motion.button>
        </form>

        {/* Success overlay - congratulations before navigating home */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-8"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  duration: 0.5,
                  bounce: 0.25,
                  delay: 0.1,
                }}
                className="w-20 h-20 rounded-full bg-periwinkle/15 flex items-center justify-center mb-6"
              >
                <CheckCircle size={40} className="text-periwinkle" strokeWidth={1.5} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.45, bounce: 0, delay: 0.25 }}
                className="text-[#1A1A1A] text-center mb-2"
              >
                Nice catch!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.45, bounce: 0, delay: 0.35 }}
                className="text-gray-400 text-center text-sm"
              >
                Sighting logged, great data for the team.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}