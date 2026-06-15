'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Brand splash — shown once per browser session on first load, then fades out.
 * Intentionally light: a static gradient + the logo with a soft fade (no looping
 * animation, no heavy blur), so it never costs frames during navigation.
 */
export function Splash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only the very first load of a session shows it — keeps in-app nav instant.
    if (sessionStorage.getItem('pa_splash_seen')) return;
    sessionStorage.setItem('pa_splash_seen', '1');
    setShow(true);
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sunset"
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl font-bold tracking-tight text-ink drop-shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
          >
            PosterAI
          </motion.span>
          {/* subtle loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-6 h-[3px] w-28 rounded-full bg-black/10 overflow-hidden"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              className="h-full w-1/2 rounded-full bg-ink/70"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
