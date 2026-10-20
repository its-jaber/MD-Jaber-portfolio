import { useRef, type ReactNode } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import Magnetic from './Magnetic';

type Props = {
  lines: string[];
  intro: string;
  role: string;
  location: string;
  availability?: string;
  /** Portrait <picture> rendered by Astro and passed in as a slot. */
  children?: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

const line: Variants = {
  hidden: { y: '110%', rotate: 2.5 },
  show: (i: number) => ({ y: '0%', rotate: 0, transition: { duration: 1.25, ease: EASE, delay: 0.25 + i * 0.12 } }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: d } }),
};

/** `*word*` inside a line renders in the italic serif accent face. */
function renderLine(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') ? (
      <em key={i} className="serif accent">
        {part.slice(1, -1)}
      </em>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function Hero({ lines, intro, role, location, availability, children }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Scroll: headline drifts up, portrait sinks slower (depth), whole hero dims.
  const headY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-18%']);
  const portraitY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '22%']);
  const dim = useTransform(scrollYProgress, [0, 0.9], [1, reduce ? 1 : 0.25]);

  // Pointer tilt on the portrait.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const initial = reduce ? 'show' : 'hidden';

  return (
    <motion.section ref={ref} className="hero" style={{ opacity: dim }} aria-labelledby="hero-title">
      <div className="hero__aura" aria-hidden />
      <div className="container hero__grid">
        <motion.div className="hero__copy" style={{ y: headY }}>
          <motion.div className="hero__meta" variants={fade} initial={initial} animate="show" custom={0.1}>
            <span>{role}</span>
            <span className="hero__sep" aria-hidden />
            <span>{location}</span>
          </motion.div>

          <h1 id="hero-title" className="hero__title">
            {lines.map((l, i) => (
              <span className="line-mask" key={i}>
                <motion.span variants={line} initial={initial} animate="show" custom={i} style={{ display: 'inline-block' }}>
                  {renderLine(l)}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="hero__intro" variants={fade} initial={initial} animate="show" custom={0.85}>
            {intro}
          </motion.p>

          <motion.div className="hero__ctas" variants={fade} initial={initial} animate="show" custom={1}>
            <Magnetic>
              <a className="btn" href="/work">
                Explore my work <span className="arrow" aria-hidden>→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn--ghost" href="#contact">
                Start a project
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__portrait-wrap"
          style={{ y: portraitY }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <motion.div
            className="hero__portrait"
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
            initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0% round 28px)', scale: 1.08 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 28px)', scale: 1 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.35 }}
          >
            {children}
            <div className="hero__portrait-shade" aria-hidden />
          </motion.div>
          {availability && (
            <motion.div
              className="hero__status"
              initial={reduce ? false : { opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 1.3 }}
            >
              <span className="dot" aria-hidden /> {availability}
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.a
        href="#about"
        className="hero__scroll"
        aria-label="Scroll to about section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span>Scroll</span>
        <motion.i
          aria-hidden
          animate={reduce ? undefined : { scaleY: [0, 1, 1], originY: [0, 0, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.a>
    </motion.section>
  );
}
