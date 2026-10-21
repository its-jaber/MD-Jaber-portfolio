import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from 'framer-motion';
import MediaFrame from './MediaFrame';

export type CardProject = {
  slug: string;
  title: string;
  /** Undefined while the real tagline is still a TODO. */
  tagline?: string;
  category: string;
  kind: string;
  year?: string;
  tags: string[];
  stack: string[];
  accent: string;
  draft: boolean;
  frameLabel: string;
  /** "Concept", "UI prototype"… always shown so concept work is clearly labelled. */
  stage?: string;
  /** narrow = small native capture: shown at real size, never upscaled. */
  cover?: {
    src: string;
    srcset?: string;
    width: number;
    height: number;
    alt: string;
    narrow?: boolean;
    display?: 'wide' | 'phone' | 'page';
    /** Display-only border crop (see trimStyles). */
    trim?: { wrap: React.CSSProperties; img: React.CSSProperties };
  };
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Replays on every viewport entry (viewport.once = false). Framer only resets
// once the card has fully left the viewport, so cards never flicker while read.
const reveal: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: ({ i, reduce }: { i: number; reduce: boolean | null }) => ({
    opacity: 1,
    y: 0,
    transition: reduce ? { duration: 0 } : { duration: 0.75, ease: EASE, delay: (i % 3) * 0.07 },
  }),
};

/** Card with pointer spotlight + subtle 3D tilt, framed media and a replaying scroll reveal. */
/** `wide` = the card fills the double-width first slot on /work, so it needs a larger image. */
export default function ProjectCard({ project: p, index, wide = false }: { project: CardProject; index: number; wide?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useSpring(useTransform(my, [0, 100], [4, -4]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 100], [-5, 5]), { stiffness: 150, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(480px circle at ${mx}% ${my}%, ${p.accent}2e, transparent 60%)`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };
  const onLeave = () => {
    mx.set(50);
    my.set(50);
  };

  return (
    <motion.div
      className="card-reveal"
      variants={reveal}
      custom={{ i: index, reduce }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.15 }}
    >
      <motion.a
        ref={ref}
        href={`/work/${p.slug}`}
        className="card"
        data-cursor="view"
        aria-label={`${p.title}, ${p.kind}${p.draft ? ' (draft)' : ''}`}
        style={{ ['--accent' as string]: p.accent, rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformPerspective: 1200 }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        whileTap={{ scale: 0.985 }}
      >
        <motion.div className="card__glow" style={{ background: glow }} aria-hidden />
        <div className="card__media">
          <MediaFrame label={p.frameLabel} category={p.category} narrow={p.cover?.narrow} display={p.cover?.display}>
            {p.cover?.trim ? (
              <span className="trim" style={p.cover.trim.wrap}>
                <img src={p.cover.src} srcSet={p.cover.srcset} sizes={`${p.cover.width}px`} width={p.cover.width} height={p.cover.height} alt={p.cover.alt} style={p.cover.trim.img} loading="lazy" decoding="async" />
              </span>
            ) : p.cover && (
              <img
                src={p.cover.src}
                srcSet={p.cover.srcset}
                sizes={p.cover.narrow ? `${p.cover.width}px` : wide ? '(min-width: 760px) 92vw, 100vw' : '(min-width: 760px) 50vw, 100vw'}
                width={p.cover.width}
                height={p.cover.height}
                alt={p.cover.alt}
                className={p.cover.narrow ? 'is-narrow' : undefined}
                style={p.cover.narrow ? ({ ['--native' as string]: `${p.cover.width}px` } as React.CSSProperties) : undefined}
                loading="lazy"
                decoding="async"
              />
            )}
          </MediaFrame>
        </div>
        <div className="card__body">
          <div className="card__top">
            <span className="card__index">{String(index + 1).padStart(2, '0')}</span>
            <span className="card__kind">{p.kind}</span>
            {p.draft && <span className="badge-draft">Draft</span>}
          </div>
          <h3 className="card__title">{p.title}</h3>
          {p.tagline && <p className="card__tagline">{p.tagline}</p>}
          <div className="card__foot">
            {p.stage && <span className="chip chip--stage">{p.stage}</span>}
            <span className="chip">{p.category}</span>
            {p.year && <span className="chip">{p.year}</span>}
            <span className="card__go" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </span>
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
}
