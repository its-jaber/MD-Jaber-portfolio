import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Spring-follow cursor for fine pointers. Grows over interactive elements and
 * shows a "View" label over elements marked [data-cursor="view"].
 */
export default function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<'idle' | 'hover' | 'view'>('idle');
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as Element | null;
      if (t?.closest('[data-cursor="view"]')) setState('view');
      else if (t?.closest('a, button, input, label, [role="radio"]')) setState('hover');
      else setState('idle');
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;
  const size = state === 'view' ? 92 : state === 'hover' ? 56 : 12;

  return (
    <motion.div
      aria-hidden
      className="cursor-dot"
      data-state={state}
      style={{ x: sx, y: sy }}
      animate={{ width: size, height: size, opacity: visible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      <motion.span animate={{ opacity: state === 'view' ? 1 : 0 }}>View</motion.span>
    </motion.div>
  );
}
