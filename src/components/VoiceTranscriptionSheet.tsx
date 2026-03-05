import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mic, MicOff } from "lucide-react";
import binocularsIcon from "figma:asset/cc369f8ff92cf33a90f00c520861310e3191ab17.png";
import weatherIcon from "figma:asset/1b1bffb92486ea65cef0bab5add8631aa363223e.png";
import { parseSightingTranscript, type ParsedSighting } from "./transcriptParser";

interface VoiceTranscriptionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (
    transcript: string,
    logType: "weather" | "sighting"
  ) => void;
}

export function VoiceTranscriptionSheet({
  isOpen,
  onClose,
  onTranscriptionComplete,
}: VoiceTranscriptionSheetProps) {
  const [selectedType, setSelectedType] = useState<"weather" | "sighting" | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedSighting | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const selectedTypeRef = useRef<"weather" | "sighting" | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);

  // Update parsed preview when transcript changes (sighting only)
  useEffect(() => {
    if (selectedType === "sighting" && transcript.trim()) {
      const parsed = parseSightingTranscript(transcript);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  }, [transcript, selectedType]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedType(null);
      setIsListening(false);
      setTranscript("");
      setMicError(null);
      setParsedPreview(null);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore
        }
      }
    }
  }, [isOpen]);

  const createRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setMicError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      // Process ALL results from the beginning each time
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      // Combine: final results are locked in, interim is what's being spoken now
      const fullTranscript = (finalTranscript + interimTranscript).trim();
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        setMicError("Microphone access denied. Check your browser settings!");
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === "no-speech") {
        // No speech detected - keep listening, don't error out
        return;
      } else if (event.error === "aborted") {
        return;
      } else if (event.error === "network") {
        setMicError("Check your internet connection and try again!");
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === "audio-capture") {
        setMicError("Can't access microphone. Try again!");
        setIsListening(false);
        isListeningRef.current = false;
      } else {
        setMicError("Oops! Something went wrong. Try again!");
        setIsListening(false);
        isListeningRef.current = false;
      }

      if (event.error !== "no-speech" && event.error !== "aborted") {
        setTimeout(() => setMicError(null), 5000);
      }
    };

    // Use ref to avoid stale closure - this is the key fix for mobile
    recognition.onend = () => {
      console.log("Speech recognition ended, isListening:", isListeningRef.current);
      if (isListeningRef.current) {
        // Auto-restart after a short delay (mobile browsers stop recognition periodically)
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error("Restart error:", error);
              setIsListening(false);
              isListeningRef.current = false;
            }
          }
        }, 300);
      }
    };

    return recognition;
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      // Stop listening
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    } else {
      // Start listening
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setMicError(
          "Voice dictation isn't supported in this browser. Try Chrome or Safari!"
        );
        setTimeout(() => setMicError(null), 5000);
        return;
      }

      // Create a fresh recognition instance each time to avoid stale state
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      recognitionRef.current = createRecognition();

      if (!recognitionRef.current) {
        setMicError("Can't start the mic. Try again!");
        setTimeout(() => setMicError(null), 5000);
        return;
      }

      setTranscript("");
      setMicError(null);

      try {
        recognitionRef.current.start();
        isListeningRef.current = true;
        setIsListening(true);
      } catch (error: any) {
        console.error("Error starting recognition:", error);
        isListeningRef.current = false;
        setIsListening(false);
        if (error.name === "InvalidStateError") {
          // Already running - treat as success
          isListeningRef.current = true;
          setIsListening(true);
        } else if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setMicError(
            "Microphone access denied. Check your browser settings!"
          );
          setTimeout(() => setMicError(null), 8000);
        } else {
          setMicError("Can't start the mic. Try again!");
          setTimeout(() => setMicError(null), 5000);
        }
      }
    }
  };

  const handleDone = () => {
    if (selectedType && transcript.trim()) {
      onTranscriptionComplete(transcript.trim(), selectedType);
      onClose();
    }
  };

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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pt-5 z-30 overflow-y-auto"
            style={{ maxHeight: "85vh" }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <h2>Voice notes</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Log Type Selection */}
              {!selectedType && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    What are you logging?
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType("weather")}
                    className="w-full bg-alice-blue/50 rounded-2xl p-5 flex items-center gap-4 border-2 border-transparent hover:border-sky-blue transition-colors"
                  >
                    <img
                      src={weatherIcon}
                      alt="Weather Icon"
                      className="w-12 h-12"
                    />
                    <div className="flex-1 text-left">
                      <p>Weather Log</p>
                      <p className="text-sm text-gray-500">
                        Record current conditions
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType("sighting")}
                    className="w-full bg-alice-blue/50 rounded-2xl p-5 flex items-center gap-4 border-2 border-transparent hover:border-sky-blue transition-colors"
                  >
                    <img
                      src={binocularsIcon}
                      alt="Binoculars Icon"
                      className="w-12 h-12"
                    />
                    <div className="flex-1 text-left">
                      <p>Sighting Log</p>
                      <p className="text-sm text-gray-500">
                        Log what you spotted
                      </p>
                    </div>
                  </motion.button>
                </div>
              )}

              {/* Recording Interface */}
              {selectedType && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          selectedType === "weather"
                            ? weatherIcon
                            : binocularsIcon
                        }
                        alt="Icon"
                        className="w-8 h-8"
                      />
                      <p className="text-sm text-gray-600">
                        {selectedType === "weather"
                          ? "Weather notes"
                          : "Sighting notes"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedType(null);
                        isListeningRef.current = false;
                        setIsListening(false);
                        setTranscript("");
                        setParsedPreview(null);
                        if (recognitionRef.current) {
                          try {
                            recognitionRef.current.stop();
                          } catch (error) {
                            // Ignore
                          }
                        }
                      }}
                      className="text-sm text-periwinkle"
                    >
                      Change
                    </button>
                  </div>

                  {/* Sighting hint */}
                  {selectedType === "sighting" && !isListening && !transcript && (
                    <div className="bg-alice-blue/40 rounded-2xl p-3">
                      <p className="text-xs text-gray-500">
                        Try saying something like: "I spotted 3 bottlenose dolphins about 200 meters away, they were feeding near the kelp beds"
                      </p>
                    </div>
                  )}

                  {/* Mic Button */}
                  <div className="flex justify-center my-8">
                    <motion.button
                      type="button"
                      onClick={toggleListening}
                      whileTap={{ scale: 0.9 }}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-soft transition-colors ${
                        isListening
                          ? "bg-sky-blue text-white"
                          : "bg-white border-2 border-periwinkle text-periwinkle"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-full bg-sky-blue"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{ opacity: 0.3 }}
                          />
                          <MicOff size={32} />
                        </>
                      ) : (
                        <Mic size={32} />
                      )}
                    </motion.button>
                  </div>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-sky-blue/10 border border-sky-blue/30 rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div
                            className="w-2 h-2 bg-sky-blue rounded-full"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                          <span className="text-sm text-gray-600">
                            Listening...
                          </span>
                        </div>
                        {transcript && (
                          <p className="text-sm text-gray-700">{transcript}</p>
                        )}
                      </motion.div>
                    )}

                    {!isListening && transcript && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-alice-blue/30 border border-periwinkle/30 rounded-2xl p-4"
                      >
                        <p className="text-sm text-gray-600 mb-1">
                          Your notes:
                        </p>
                        <p className="text-sm text-gray-700">{transcript}</p>
                      </motion.div>
                    )}

                    {micError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-100 border border-red-300 rounded-2xl p-4"
                      >
                        <p className="text-sm text-red-600">{micError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Instructions */}
                  {!isListening && !transcript && (
                    <p className="text-center text-sm text-gray-500">
                      Tap the mic to start recording
                    </p>
                  )}

                  {/* Parsed Preview for Sightings */}
                  {selectedType === "sighting" && !isListening && parsedPreview && transcript && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-alice-blue/30 border border-sky-blue/30 rounded-2xl p-4 space-y-2"
                    >
                      <p className="text-xs text-gray-500 mb-2">Auto-detected fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {parsedPreview.species && (
                          <span className="inline-flex items-center gap-1 bg-sky-blue/15 text-sky-700 rounded-full px-3 py-1 text-xs">
                            Species: {parsedPreview.species}
                          </span>
                        )}
                        {parsedPreview.count && (
                          <span className="inline-flex items-center gap-1 bg-periwinkle/15 text-periwinkle rounded-full px-3 py-1 text-xs">
                            Count: {parsedPreview.count}
                          </span>
                        )}
                        {parsedPreview.behaviour && (
                          <span className="inline-flex items-center gap-1 bg-sky-blue/15 text-sky-700 rounded-full px-3 py-1 text-xs">
                            Behaviour: {parsedPreview.behaviour}
                          </span>
                        )}
                        {parsedPreview.distance && (
                          <span className="inline-flex items-center gap-1 bg-periwinkle/15 text-periwinkle rounded-full px-3 py-1 text-xs">
                            Distance: {parsedPreview.distance}m
                          </span>
                        )}
                      </div>
                      {parsedPreview.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          Notes: "{parsedPreview.notes}"
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Done Button */}
                  {transcript && !isListening && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDone}
                      className="w-full bg-periwinkle text-white rounded-full py-4 mt-6"
                    >
                      {selectedType === "sighting" ? "Fill in the form!" : "Add to notes!"}
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}