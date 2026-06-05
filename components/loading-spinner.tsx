"use client";

import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-neutral-200 flex flex-col items-center"
      >
        <div className="relative w-16 h-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-neutral-200 rounded-full"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
            className="absolute inset-0 border-4 border-t-neutral-900 rounded-full"
          />
        </div>
        <p className="mt-4 text-neutral-900 font-medium">Processing...</p>
        <p className="text-sm text-neutral-500 mt-1">Identifying</p>
      </motion.div>
    </div>
  );
}