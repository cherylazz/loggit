export function BinocularsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left barrel - top view */}
      <ellipse cx="32" cy="50" rx="18" ry="24" fill="#1A1A1A" />
      <ellipse cx="32" cy="50" rx="14" ry="20" fill="#B2B1CF" />
      <ellipse cx="32" cy="50" rx="10" ry="16" fill="#98D2EB" />
      <ellipse cx="32" cy="48" rx="6" ry="10" fill="#E1F2FE" />
      
      {/* Right barrel - top view */}
      <ellipse cx="68" cy="50" rx="18" ry="24" fill="#1A1A1A" />
      <ellipse cx="68" cy="50" rx="14" ry="20" fill="#B2B1CF" />
      <ellipse cx="68" cy="50" rx="10" ry="16" fill="#98D2EB" />
      <ellipse cx="68" cy="48" rx="6" ry="10" fill="#E1F2FE" />
      
      {/* Bridge connecting the barrels */}
      <rect x="44" y="45" width="12" height="10" rx="2" fill="#1A1A1A" />
      
      {/* Focus wheel on bridge */}
      <circle cx="50" cy="50" r="6" fill="#98D2EB" />
      <circle cx="50" cy="50" r="3" fill="#B2B1CF" />
      
      {/* Eyepiece details at top */}
      <ellipse cx="32" cy="26" rx="12" ry="6" fill="#B2B1CF" />
      <ellipse cx="68" cy="26" rx="12" ry="6" fill="#B2B1CF" />
      
      {/* Lens highlights */}
      <ellipse cx="32" cy="46" rx="4" ry="6" fill="white" opacity="0.5" />
      <ellipse cx="68" cy="46" rx="4" ry="6" fill="white" opacity="0.5" />
    </svg>
  );
}
