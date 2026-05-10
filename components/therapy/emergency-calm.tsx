"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, ShieldAlert, Wind, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmergencyCalm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<"ready" | "active">("ready");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setPhase("ready");
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-8 right-8 text-white/40 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Calming Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <motion.div 
               className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px]" 
               animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             />
             <motion.div 
               className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]" 
               animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -50, 0] }}
               transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
             />
          </div>

          <div className="relative z-10 max-w-xl w-full px-8 text-center space-y-12">
             <AnimatePresence mode="wait">
                {phase === "ready" ? (
                   <motion.div
                     key="ready"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="space-y-8"
                   >
                      <div className="h-20 w-20 rounded-[2.5rem] bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                         <ShieldAlert className="h-10 w-10" />
                      </div>
                      <div className="space-y-4">
                         <h2 className="text-4xl font-black text-white tracking-tight">Emotional Safety Mode</h2>
                         <p className="text-white/60 font-medium leading-relaxed">
                           Take a moment to stabilize. We'll guide you through a gentle grounding cycle to reduce your physiological distress.
                         </p>
                      </div>
                      <Button 
                        size="lg" 
                        className="rounded-3xl h-16 px-12 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs"
                        onClick={() => setPhase("active")}
                      >
                         Initiate Grounding
                      </Button>
                   </motion.div>
                ) : (
                   <motion.div
                     key="active"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="space-y-16"
                   >
                      <div className="relative flex items-center justify-center">
                         <motion.div 
                           className="h-64 w-64 md:h-80 md:w-80 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl"
                           animate={{ scale: [1, 1.4, 1] }}
                           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                         >
                            <Wind className="h-12 w-12 text-blue-400 animate-pulse" />
                         </motion.div>
                         <motion.div 
                           className="absolute inset-0 rounded-full border border-blue-400/30"
                           animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                         />
                      </div>

                      <div className="space-y-4">
                         <motion.p 
                           className="text-3xl font-black text-white"
                           animate={{ opacity: [0.4, 1, 0.4] }}
                           transition={{ duration: 6, repeat: Infinity }}
                         >
                            Follow the Pulse...
                         </motion.p>
                         <div className="flex justify-center gap-6 pt-4">
                            <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                               <Heart className="h-4 w-4 text-rose-500" />
                               Safe Environment
                            </div>
                            <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                               <Sparkles className="h-4 w-4 text-amber-500" />
                               AI Supported
                            </div>
                         </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        className="text-white/40 hover:text-white hover:bg-white/5 rounded-2xl"
                        onClick={() => setPhase("ready")}
                      >
                         Reset Session
                      </Button>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
