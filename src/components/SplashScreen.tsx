import { motion } from "motion/react";
import { FlatOrca } from "./FlatOrca";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 bg-gradient-to-b from-sky-blue to-alice-blue flex flex-col items-center justify-center overflow-hidden z-50"
    >
      {/* Clouds */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.6 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-20 left-10 w-24 h-16 bg-white/40 rounded-full blur-xl"
      />
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.6 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute top-32 right-8 w-32 h-20 bg-white/40 rounded-full blur-xl"
      />

      {/* Flat design orca swimming in background */}
      <motion.div
        initial={{ x: "-200%", y: 0 }}
        animate={{ x: "300%" }}
        transition={{ 
          duration: 8,
          ease: "linear",
          repeat: Infinity
        }}
        className="absolute w-32 h-20 sm:w-40 sm:h-24 opacity-80"
        style={{ top: '30%' }}
      >
        <FlatOrca className="w-full h-full" />
      </motion.div>
      
      {/* Second flat orca (slower, lower) */}
      <motion.div
        initial={{ x: "300%", y: 0 }}
        animate={{ x: "-200%" }}
        transition={{ 
          duration: 10,
          ease: "linear",
          repeat: Infinity,
          delay: 2
        }}
        className="absolute w-28 h-18 sm:w-36 sm:h-22 opacity-60"
        style={{ top: '65%' }}
      >
        <FlatOrca className="w-full h-full transform scale-x-[-1]" />
      </motion.div>

      {/* Orca swimming animation */}
      <motion.div
        initial={{ x: "-150%", y: "20%", rotate: -10 }}
        animate={{ 
          x: ["-150%", "0%", "150%"],
          y: ["20%", "-10%", "20%"],
          rotate: [-10, 0, 10]
        }}
        transition={{ 
          duration: 2.5,
          times: [0, 0.5, 1],
          ease: "easeInOut"
        }}
        className="absolute w-48 h-48 sm:w-64 sm:h-64"
        style={{ top: '50%', left: '50%', marginLeft: '-96px', marginTop: '-96px' }}
      >
        <FlatOrca className="w-full h-full object-contain" />
      </motion.div>

      {/* Splash effects */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 2], opacity: [0, 0.8, 0] }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute w-32 h-32 rounded-full bg-white/30"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1.8], opacity: [0, 0.6, 0] }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute w-24 h-24 rounded-full bg-white/20"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />

      {/* Water droplets */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0, y: 0 }}
          animate={{ 
            scale: [0, 1, 0.5],
            opacity: [0, 1, 0],
            y: [0, -80 - i * 15, -120 - i * 15],
            x: [0, (i - 2) * 25, (i - 2) * 35]
          }}
          transition={{ duration: 1.2, delay: 1.2 + i * 0.1 }}
          className="absolute w-3 h-3 rounded-full bg-sky-blue/60"
          style={{ top: '50%', left: '50%' }}
        />
      ))}

      {/* App name and tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="absolute bottom-24 sm:bottom-32 text-center px-6"
      >
        <h1 className="text-periwinkle mb-2">LoggIT</h1>
        <p className="text-gray-600">Your friendly field buddy at sea</p>
      </motion.div>

      {/* Auto-complete after animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0 }}
        onAnimationComplete={() => {
          setTimeout(() => onComplete(), 4000);
        }}
      />
    </motion.div>
  );
}