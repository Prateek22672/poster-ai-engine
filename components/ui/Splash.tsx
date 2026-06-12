'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

/**
 * Initial splash — a smooth animated sunset gradient with the logo, shown on
 * load, then fades out. Covers the page while it hydrates.
 */
export function Splash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-sunset-animated"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
              className="w-12 h-12 rounded-2xl bg-ink/85 backdrop-blur flex items-center justify-center shadow-2xl"
            >
              <Layers className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-neutral-900 tracking-tight drop-shadow-sm">PosterAI</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
