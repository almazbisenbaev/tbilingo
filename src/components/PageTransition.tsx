'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  in: {
    opacity: 1,
    scale: 1
  },
  out: {
    opacity: 0,
    scale: 0.9
  }
};

// Transition configuration for smooth animations
const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.3
};

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="page-transition-wrapper"
    >
      {children}
    </motion.div>
  );
}