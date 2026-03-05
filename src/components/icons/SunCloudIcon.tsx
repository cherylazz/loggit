export function SunCloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sun rays - more vibrant */}
      <line x1="50" y1="8" x2="50" y2="18" stroke="#98D2EB" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="15" x2="68" y2="22" stroke="#98D2EB" strokeWidth="4" strokeLinecap="round" />
      <line x1="85" y1="35" x2="75" y2="35" stroke="#98D2EB" strokeWidth="4" strokeLinecap="round" />
      <line x1="25" y1="15" x2="32" y2="22" stroke="#98D2EB" strokeWidth="4" strokeLinecap="round" />
      <line x1="15" y1="35" x2="25" y2="35" stroke="#98D2EB" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="55" x2="68" y2="48" stroke="#98D2EB" strokeWidth="4" strokeLinecap="round" />
      
      {/* Sun circle - gradient effect with multiple circles */}
      <circle cx="50" cy="35" r="18" fill="#FFD93D" />
      <circle cx="50" cy="35" r="14" fill="#FFC629" opacity="0.8" />
      <circle cx="48" cy="32" r="5" fill="#FFE88E" opacity="0.6" />
      
      {/* Cloud - more defined and fluffy */}
      <circle cx="35" cy="62" r="13" fill="#B2B1CF" />
      <circle cx="50" cy="60" r="16" fill="#B2B1CF" />
      <circle cx="65" cy="62" r="14" fill="#B2B1CF" />
      <circle cx="42" cy="67" r="11" fill="#B2B1CF" />
      <circle cx="58" cy="67" r="12" fill="#B2B1CF" />
      
      {/* Cloud base to flatten bottom */}
      <rect x="23" y="65" width="54" height="10" fill="#B2B1CF" />
      
      {/* Cloud highlights */}
      <circle cx="45" cy="58" r="6" fill="white" opacity="0.5" />
      <circle cx="60" cy="60" r="5" fill="white" opacity="0.4" />
    </svg>
  );
}
