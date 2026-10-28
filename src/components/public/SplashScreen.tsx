import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { KriyaaLogo } from '../KriyaaLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] w-screen h-screen bg-[#113B24] flex items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute w-[450px] h-[450px] bg-[#15803D]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Skip button in the top right corner */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-emerald-100 hover:text-white transition-all border border-white/10 cursor-pointer backdrop-blur-md"
        title="Skip to Website"
      >
        Skip
      </button>

      {/* Dead-Center Minimal Content: Logo + Company Name */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center space-y-6 z-10"
      >
        {/* Geometric Logo Badge */}
        <div className="relative">
          <div className="absolute -inset-3 bg-[#15803D]/30 rounded-3xl blur-xl" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0B2516] border-2 border-[#EAB308]/80 p-4 flex items-center justify-center shadow-2xl shadow-black/50">
            <KriyaaLogo className="w-full h-full" />
          </div>
        </div>

        {/* Company Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-[0.25em] drop-shadow-md">
          KRIYAA PROMOTERS
        </h1>
      </motion.div>
    </motion.div>
  );
};
