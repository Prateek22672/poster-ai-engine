'use client';

import { motion } from 'framer-motion';

/**
 * Smooth fade-in on every page open / navigation.
 * Opacity-only (no transform) so `position: fixed` gradient layers stay
 * anchored to the viewport, not this wrapper.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
