// Intelligent transcript parser for sighting logs
// Extracts species, count, behaviour, and distance from natural speech
// Everything else goes to notes

export interface ParsedSighting {
  species?: string;
  count?: number;
  behaviour?: string;
  distance?: number;
  notes: string;
}

// Canonical species list (must match SightingLog's speciesList)
const SPECIES_LIST = [
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

// Maps spoken variations → canonical species name
// Sorted longest-first so multi-word matches get priority
const SPECIES_ALIASES: [RegExp, string][] = [
  [/bottlenose\s+dolphins?/gi, "Bottlenose Dolphin"],
  [/humpback\s+whales?/gi, "Humpback Whale"],
  [/grey\s+whales?/gi, "Grey Whale"],
  [/gray\s+whales?/gi, "Grey Whale"],
  [/killer\s+whales?/gi, "Orca"],
  [/blue\s+whales?/gi, "Blue Whale"],
  [/sea\s+turtles?/gi, "Sea Turtle"],
  [/sea\s+lions?/gi, "Sea Lion"],
  [/humpbacks?/gi, "Humpback Whale"],
  [/dolphins?/gi, "Bottlenose Dolphin"],
  [/whales?/gi, "Humpback Whale"], // default whale if unspecified
  [/turtles?/gi, "Sea Turtle"],
  [/albatross(?:es)?/gi, "Albatross"],
  [/pelicans?/gi, "Pelican"],
  [/orcas?/gi, "Orca"],
];

// Number words → digits
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
  a: 1, an: 1,
};

// Behaviour keywords → canonical form
const BEHAVIOUR_MAP: Record<string, string> = {
  feeding: "feeding",
  eating: "feeding",
  hunting: "feeding",
  foraging: "feeding",
  travelling: "travelling",
  traveling: "travelling",
  swimming: "travelling",
  moving: "travelling",
  migrating: "travelling",
  resting: "resting",
  sleeping: "resting",
  floating: "resting",
  lounging: "resting",
  playing: "playing",
  breaching: "playing",
  jumping: "playing",
  splashing: "playing",
  spyhopping: "playing",
  "spy-hopping": "playing",
  leaping: "playing",
};

/**
 * Parse a raw voice transcript into structured sighting data.
 * Extracts species, count, behaviour, and distance.
 * Remaining text goes to notes.
 */
export function parseSightingTranscript(raw: string): ParsedSighting {
  let text = raw.trim();
  const result: ParsedSighting = { notes: "" };
  const removals: { start: number; end: number }[] = [];

  // Normalize the text for matching (keep original for notes)
  const lower = text.toLowerCase();

  // --- 1. Extract Species ---
  let speciesMatch: { species: string; index: number; length: number } | null = null;

  for (const [regex, canonical] of SPECIES_ALIASES) {
    // Reset regex lastIndex for global patterns
    regex.lastIndex = 0;
    const match = regex.exec(lower);
    if (match) {
      // Prefer longer matches (multi-word species names)
      if (!speciesMatch || match[0].length > speciesMatch.length) {
        speciesMatch = {
          species: canonical,
          index: match.index,
          length: match[0].length,
        };
      }
    }
  }

  if (speciesMatch) {
    result.species = speciesMatch.species;
    removals.push({
      start: speciesMatch.index,
      end: speciesMatch.index + speciesMatch.length,
    });
  }

  // --- 2. Extract Count ---
  // Look for digit numbers near species or standalone
  // Patterns: "3 dolphins", "saw 5", "about 12", "a pod of 3", "one dolphin"
  
  // First try: number right before species mention
  if (speciesMatch) {
    const beforeSpecies = lower.substring(0, speciesMatch.index);
    
    // Check for digit number just before species
    const digitBefore = beforeSpecies.match(/(\d+)\s*$/);
    if (digitBefore) {
      result.count = parseInt(digitBefore[1], 10);
      const numStart = speciesMatch.index - digitBefore[0].length;
      removals.push({ start: numStart, end: numStart + digitBefore[0].length });
    } else {
      // Check for word number just before species
      const wordBefore = beforeSpecies.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty|forty|fifty|a|an)\s*$/i);
      if (wordBefore) {
        result.count = NUMBER_WORDS[wordBefore[1].toLowerCase()];
        const numStart = speciesMatch.index - wordBefore[0].length;
        removals.push({ start: numStart, end: numStart + wordBefore[0].length });
      }
    }
  }

  // If no count found near species, look for "count of X" or "pod of X" patterns
  if (!result.count) {
    const podPattern = /(?:pod|group|school|flock|pair)\s+of\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty)/gi;
    const podMatch = podPattern.exec(lower);
    if (podMatch) {
      const numVal = parseInt(podMatch[1], 10);
      result.count = isNaN(numVal) ? NUMBER_WORDS[podMatch[1].toLowerCase()] : numVal;
      removals.push({ start: podMatch.index, end: podMatch.index + podMatch[0].length });
    }
  }

  // If still no count, look for standalone numbers that seem like counts (small numbers, not distances)
  if (!result.count) {
    // Look for patterns like "saw 3" or "spotted 5" but not "200 meters"
    const sawPattern = /(?:saw|spotted|see|seeing|counted|count)\s+(\d+)/gi;
    const sawMatch = sawPattern.exec(lower);
    if (sawMatch) {
      const num = parseInt(sawMatch[1], 10);
      if (num > 0 && num <= 100) {
        result.count = num;
        removals.push({ start: sawMatch.index, end: sawMatch.index + sawMatch[0].length });
      }
    }
  }

  // --- 3. Extract Behaviour ---
  const behaviourKeys = Object.keys(BEHAVIOUR_MAP);
  // Sort by length descending so "spy hopping" matches before "hopping" etc.
  behaviourKeys.sort((a, b) => b.length - a.length);

  for (const keyword of behaviourKeys) {
    const regex = new RegExp(`\\b${keyword.replace(/[- ]/g, "[\\s-]?")}\\b`, "gi");
    const match = regex.exec(lower);
    if (match) {
      result.behaviour = BEHAVIOUR_MAP[keyword];
      removals.push({ start: match.index, end: match.index + match[0].length });
      break;
    }
  }

  // Also check for "they were [behaviour]" or "it was [behaviour]" patterns
  if (!result.behaviour) {
    const wereBehaviour = /(?:they\s+were|it\s+was|were|was)\s+(feeding|eating|hunting|travelling|traveling|swimming|moving|resting|sleeping|playing|breaching|jumping|splashing)/gi;
    const wereMatch = wereBehaviour.exec(lower);
    if (wereMatch) {
      result.behaviour = BEHAVIOUR_MAP[wereMatch[1].toLowerCase()] || wereMatch[1].toLowerCase();
      removals.push({ start: wereMatch.index, end: wereMatch.index + wereMatch[0].length });
    }
  }

  // --- 4. Extract Distance ---
  // Patterns: "200 meters", "200m", "about 100 meters away", "at 50 meters", "distance 300"
  const distancePatterns = [
    /(?:about|around|approximately|roughly|at)?\s*(\d+)\s*(?:meters?|metres?|m)\s*(?:away|out|off)?/gi,
    /(?:distance|dist)\s*(?:of|:)?\s*(\d+)\s*(?:meters?|metres?|m)?/gi,
    /(\d+)\s*(?:meters?|metres?)\s*(?:away|out|off|distance)?/gi,
  ];

  for (const pattern of distancePatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(lower);
    if (match) {
      const dist = parseInt(match[1], 10);
      if (dist >= 10 && dist <= 2000) {
        result.distance = Math.min(500, Math.max(10, dist)); // clamp to slider range
        removals.push({ start: match.index, end: match.index + match[0].length });
        break;
      }
    }
  }

  // --- 5. Build notes from remaining text ---
  // Sort removals by start position descending and remove from text
  removals.sort((a, b) => b.start - a.start);
  let notesText = text;
  for (const { start, end } of removals) {
    notesText = notesText.substring(0, start) + notesText.substring(end);
  }

  // Clean up the notes: remove extra spaces, filler words at boundaries, etc.
  notesText = notesText
    .replace(/\s{2,}/g, " ") // collapse multiple spaces
    .replace(/^\s*[,.\-;:]\s*/g, "") // leading punctuation
    .replace(/\s*[,.\-;:]\s*$/g, "") // trailing punctuation
    .replace(/\b(?:i\s+saw|i\s+spotted|i\s+see|we\s+saw|we\s+spotted)\b\s*/gi, "") // remove "I saw" etc.
    .replace(/\b(?:they\s+were|it\s+was|they\s+are|it\s+is)\b\s*/gi, "") // remove connectors
    .replace(/\b(?:at\s+a\s+distance\s+of|at\s+about|about|around)\b\s*/gi, "") // remove distance prepositions
    .replace(/\b(?:away)\b\s*/gi, "")
    .replace(/\s{2,}/g, " ") // collapse again
    .trim();

  result.notes = notesText;

  return result;
}
