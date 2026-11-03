import React, { useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion, type Variants } from 'framer-motion';

/* Admin motion primitives — same vocabulary as the storefront (calm fade + lift, luxury ease), but quicker
   and smaller, as befits an operations console. <MotionConfig reducedMotion="user"> in App.tsx turns
   transforms off for staff who ask for less motion. */

export const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

/** Cross-fade + lift for a whole screen; keyed by tab in App.tsx. */
export const PageTransition: React.FC<{ children: React.ReactNode; routeKey: string }> = ({ children, routeKey }) => (
  <motion.div key={routeKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_LUXURY }}>
    {children}
  </motion.div>
);

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_LUXURY } }
};

/** Staggers <StaggerItem> children in on mount. */
export const Stagger: React.FC<{ children: React.ReactNode; className?: string; as?: 'div' | 'ul' | 'dl'; stagger?: number }> = ({
  children,
  className,
  as = 'div',
  stagger
}) => {
  const Comp = motion[as];
  const variants: Variants = stagger === undefined ? groupVariants : { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: 0.04 } } };
  return (
    <Comp className={className} variants={variants} initial="hidden" animate="show">
      {children}
    </Comp>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string; as?: 'div' | 'li' }> = ({ children, className, as = 'div' }) => {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={itemVariants}>
      {children}
    </Comp>
  );
};

/** Animates a number up from its previous value. Renders the final value immediately for reduced motion. */
export const CountUp: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = value.toLocaleString('en-IN');
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration: 1.1,
      ease: EASE_LUXURY,
      onUpdate: v => {
        el.textContent = Math.round(v).toLocaleString('en-IN');
      }
    });
    from.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span ref={ref} className={className}>
      {reduce ? value.toLocaleString('en-IN') : from.current.toLocaleString('en-IN')}
    </span>
  );
};
