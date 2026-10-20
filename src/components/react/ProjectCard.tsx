import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

export type CardProject = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  kind: string;
  year?: string;
  tags: string[];
  stack: string[];
  accent: string;
  draft: boolean;
  initials: string;
  cover?: { src: string; srcset?: string; width: number; height: number; alt: string };
};

/** Card with pointer spotlight + subtle 3D tilt. No fake screenshots: without a cover we draw an abstract placeholder. */
export default function ProjectCard({ project: p, index }: { project: CardProject; index: number }) {
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
    <motion.a
      ref={ref}
      href={`/work/${p.slug}`}
      className="card"
      data-cursor="view"
      style={{ ['--accent' as string]: p.accent, rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformPerspective: 1200 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={{ scale: 0.985 }}
    >
      <motion.div className="card__glow" style={{ background: glow }} aria-hidden />
      <div className="card__media">
        {p.cover ? (
          <img src={p.cover.src} srcSet={p.cover.srcset} sizes="(min-width: 900px) 50vw, 100vw" width={p.cover.width} height={p.cover.height} alt={p.cover.alt} loading="lazy" decoding="async" />
        ) : (
          <div className="card__placeholder" aria-hidden>
            <span className="card__initials">{p.initials}</span>
            <span className="card__pending">Visuals coming soon</span>
          </div>
        )}
      </div>
      <div className="card__body">
        <div className="card__top">
          <span className="card__index">{String(index + 1).padStart(2, '0')}</span>
          <span className="card__kind">{p.kind}</span>
          {p.draft && <span className="badge-draft">Draft</span>}
        </div>
        <h3 className="card__title">{p.title}</h3>
        <p className="card__tagline">{p.tagline}</p>
        <div className="card__foot">
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
  );
}
