import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function AnimatedNumber({ value, decimals = 2, className = '' }) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { damping: 20, stiffness: 120 });
  const display = useTransform(spring, v => v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
} 