import { Mic } from "lucide-react";
import { motion } from "motion/react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-[88px] right-6 z-10">
      {/* Subtle pulse ring - draws attention without being distracting */}
      <motion.div
        className="absolute inset-0 rounded-full bg-periwinkle/20"
        animate={{
          scale: [1, 1.35, 1.35],
          opacity: [0.4, 0, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeOut",
        }}
      />
      <motion.button
        initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", duration: 0.45, bounce: 0, delay: 0.2 }}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className="relative w-14 h-14 rounded-full bg-periwinkle text-white shadow-soft flex items-center justify-center"
      >
        <Mic size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
