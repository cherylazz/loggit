// Maps species names to representative emojis
const speciesEmojiMap: Record<string, string> = {
  // Dolphins
  "bottlenose dolphin": "🐬",
  dolphin: "🐬",
  // Whales
  "humpback whale": "🐋",
  "grey whale": "🐋",
  "blue whale": "🐳",
  "sperm whale": "🐳",
  "minke whale": "🐋",
  "fin whale": "🐋",
  "right whale": "🐋",
  "beluga whale": "🐳",
  whale: "🐋",
  orca: "🐋",
  // Turtles
  "sea turtle": "🐢",
  turtle: "🐢",
  "green turtle": "🐢",
  "leatherback turtle": "🐢",
  "hawksbill turtle": "🐢",
  // Birds
  albatross: "🦅",
  pelican: "🦤",
  seagull: "🕊️",
  gannet: "🦅",
  cormorant: "🦅",
  puffin: "🐧",
  penguin: "🐧",
  tern: "🕊️",
  petrel: "🦅",
  shearwater: "🦅",
  // Pinnipeds
  "sea lion": "🦭",
  seal: "🦭",
  "fur seal": "🦭",
  walrus: "🦭",
  // Sharks & Rays
  shark: "🦈",
  "great white": "🦈",
  "whale shark": "🦈",
  "hammerhead": "🦈",
  "manta ray": "🦈",
  ray: "🦈",
  // Octopus & Squid
  octopus: "🐙",
  squid: "🦑",
  // Fish
  fish: "🐟",
  "flying fish": "🐟",
  marlin: "🐟",
  tuna: "🐟",
  sunfish: "🐡",
  // Crabs & Crustaceans
  crab: "🦀",
  lobster: "🦞",
  // Jellyfish
  jellyfish: "🪼",
  // Other marine
  manatee: "🦭",
  dugong: "🦭",
  otter: "🦦",
  "sea otter": "🦦",
};

export function getSpeciesEmoji(species: string): string {
  if (!species) return "🔍";

  const normalized = species.toLowerCase().trim();

  // Exact match
  if (speciesEmojiMap[normalized]) {
    return speciesEmojiMap[normalized];
  }

  // Partial match - check if any key is contained in the species name
  for (const [key, emoji] of Object.entries(speciesEmojiMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return emoji;
    }
  }

  // Fallback
  return "🔍";
}
