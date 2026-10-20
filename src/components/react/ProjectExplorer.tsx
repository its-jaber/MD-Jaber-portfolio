import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import ProjectCard, { type CardProject } from './ProjectCard';

/*
 * Filter pattern adapted from the 21st.dev "Filter Grid" component (ddoemonn):
 * a radiogroup of chips with a shared-layout thumb, live counts, arrow-key
 * navigation, popLayout reflow and an aria-live summary.
 */

type Props = {
  projects: CardProject[];
  categories: readonly string[];
  /** "full" = filters + search (Work page). "featured" = cards only (home). */
  variant?: 'full' | 'featured';
};

const THUMB = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
const MOVE = { type: 'spring', stiffness: 260, damping: 32, mass: 0.8 } as const;

export default function ProjectExplorer({ projects, categories, variant = 'full' }: Props) {
  const uid = useId();
  const reduce = useReducedMotion();
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');
  const chips = useRef<(HTMLButtonElement | null)[]>([]);

  const filters = useMemo(() => ['All', ...categories.filter((c) => projects.some((p) => p.category === c))], [categories, projects]);
  const counts = useMemo(() => {
    const out: Record<string, number> = { All: projects.length };
    for (const c of categories) out[c] = projects.filter((p) => p.category === c).length;
    return out;
  }, [projects, categories]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (active !== 'All' && p.category !== active) return false;
      if (!q) return true;
      return [p.title, p.tagline, p.kind, ...p.tags, ...p.stack].join(' ').toLowerCase().includes(q);
    });
  }, [projects, active, query]);

  const go = (i: number) => {
    const n = (i + filters.length) % filters.length;
    chips.current[n]?.focus();
    setActive(filters[n]!);
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: filters.length - 1 };
    if (e.key in map) {
      e.preventDefault();
      go(map[e.key]!);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="explorer-empty">
        <p className="eyebrow">Case studies</p>
        <h3>
          Detailed case studies are <em className="serif accent">being prepared.</em>
        </h3>
        <p>
          I’m putting together verified write-ups, screenshots and demos for my product, website and automation work.
          Want a walkthrough before they go live?
        </p>
        <a className="btn" href="/#contact">
          Ask for a walkthrough <span className="arrow" aria-hidden>→</span>
        </a>
      </div>
    );
  }

  return (
    <div className="explorer">
      {variant === 'full' && (
        <div className="explorer__bar">
          <LayoutGroup id={uid}>
            <div role="radiogroup" aria-label="Filter projects by category" aria-controls={`${uid}-grid`} className="explorer__chips">
              {filters.map((f, i) => {
                const on = f === active;
                return (
                  <button
                    key={f}
                    ref={(el) => {
                      chips.current[i] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(f)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`explorer__chip${on ? ' is-on' : ''}`}
                  >
                    {on && <motion.span layoutId="thumb" className="explorer__thumb" transition={reduce ? { duration: 0 } : THUMB} aria-hidden />}
                    <span className="explorer__chip-label">
                      {f}
                      <span className="explorer__count">{counts[f] ?? 0}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <label className="explorer__search">
            <span className="sr-only">Search projects</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="Search by name, tag or tool" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
      )}

      <motion.ul id={`${uid}-grid`} className={`explorer__grid explorer__grid--${variant}`} layout={!reduce}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout={reduce ? false : 'position'}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
              transition={reduce ? { duration: 0 } : { layout: MOVE, duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 6) * 0.04 }}
            >
              <ProjectCard project={p} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>
        {visible.length === 0 && (
          <motion.p className="explorer__none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            No projects match “{query}”.{' '}
            <button type="button" onClick={() => { setQuery(''); setActive('All'); }}>
              Clear filters
            </button>
          </motion.p>
        )}
      </AnimatePresence>

      <p aria-live="polite" className="sr-only">
        {active}: {visible.length} of {projects.length} projects shown
      </p>
    </div>
  );
}
