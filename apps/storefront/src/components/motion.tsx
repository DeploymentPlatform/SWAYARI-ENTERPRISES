import React from 'react';
import { motion, type Variants } from 'framer-motion';

/* Shared motion primitives. MotionConfig reducedMotion="user" (App.tsx) turns these into plain fades
   for visitors who ask for less motion. */

export const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children into view the first time they scroll on screen. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}> = ({ children, className, delay = 0, y = 24, as = 'div' }) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.9, ease: EASE_LUXURY, delay }}
    >
      {children}
    </Comp>
  );
};

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_LUXURY } }
};

/** Container that staggers <StaggerItem> children into view. */
export const StaggerGroup: React.FC<{ children: React.ReactNode; className?: string; as?: 'div' | 'ul' }> = ({
  children,
  className,
  as = 'div'
}) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
    >
      {children}
    </Comp>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string; as?: 'div' | 'li' }> = ({
  children,
  className,
  as = 'div'
}) => {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={itemVariants}>
      {children}
    </Comp>
  );
};

/** Gentle cross-fade for route changes; keyed by path in App.tsx. */
export const PageTransition: React.FC<{ children: React.ReactNode; routeKey: string }> = ({ children, routeKey }) => (
  <motion.div
    key={routeKey}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: EASE_LUXURY }}
  >
    {children}
  </motion.div>
);
