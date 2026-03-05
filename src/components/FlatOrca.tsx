export function FlatOrca({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main body */}
      <ellipse cx="100" cy="70" rx="70" ry="35" fill="#1A1A1A" />
      
      {/* White belly patch */}
      <ellipse cx="100" cy="80" rx="50" ry="20" fill="white" />
      
      {/* Tail flukes */}
      <path
        d="M 30 70 Q 15 60 10 50 Q 15 65 30 70 Z"
        fill="#1A1A1A"
      />
      <path
        d="M 30 70 Q 15 80 10 90 Q 15 75 30 70 Z"
        fill="#1A1A1A"
      />
      
      {/* Dorsal fin */}
      <path
        d="M 90 40 L 95 15 L 100 40 Z"
        fill="#1A1A1A"
      />
      
      {/* Pectoral fin */}
      <ellipse cx="120" cy="85" rx="25" ry="10" fill="#1A1A1A" transform="rotate(-30 120 85)" />
      
      {/* Eye patch (periwinkle) */}
      <ellipse cx="130" cy="60" rx="12" ry="8" fill="#B2B1CF" />
      
      {/* Eye */}
      <circle cx="135" cy="65" r="4" fill="#1A1A1A" />
      
      {/* Water splash accent (sky blue) */}
      <circle cx="170" cy="75" r="6" fill="#98D2EB" opacity="0.6" />
      <circle cx="180" cy="70" r="4" fill="#98D2EB" opacity="0.4" />
      <circle cx="175" cy="82" r="5" fill="#98D2EB" opacity="0.5" />
      
      {/* Additional accent (alice blue) */}
      <circle cx="160" cy="68" r="8" fill="#E1F2FE" opacity="0.7" />
    </svg>
  );
}
