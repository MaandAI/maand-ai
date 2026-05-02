"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 15, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.99 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
