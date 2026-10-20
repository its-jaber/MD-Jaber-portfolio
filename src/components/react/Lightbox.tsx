import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';

export type LightboxItem = {
  src: string;
  srcset?: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** Tall full-page screenshots scroll vertically instead of being shrunk to fit. */
  tall?: boolean;
};

/**
 * Fullscreen screenshot viewer. Static markup opens it: any element with
 * [data-lightbox="<index>"] inside the page. Keyboard: ←/→ to move, Esc to close,
 * Tab stays inside the dialog. Touch: swipe left/right. Focus returns to the opener.
 */
export default function Lightbox({ items, title }: { items: LightboxItem[]; title: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = index !== null;

  const go = useCallback(
    (step: number) => {
      if (index === null || items.length < 2) return;
      setDir(step);
      setIndex((index + step + items.length) % items.length);
    },
    [index, items.length],
  );
  const close = useCallback(() => setIndex(null), []);

  // Openers in the static page.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element).closest<HTMLElement>('[data-lightbox]');
      if (!t) return;
      e.preventDefault();
      opener.current = t;
      setDir(0);
      setIndex(Number(t.dataset.lightbox) || 0);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Keyboard, scroll lock, focus handling.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden'; // modal scroll lock only while the viewer is open
    dialog.current?.querySelector<HTMLElement>('.lb__close')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab' && dialog.current) {
        const f = [...dialog.current.querySelectorAll<HTMLElement>('button, [tabindex="0"]')];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = prevOverflow;
      opener.current?.focus();
    };
  }, [open, go, close]);

  const item = index !== null ? items[index] : undefined;
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) go(info.offset.x < 0 ? 1 : -1);
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={dialog}
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={`${title}: image ${index! + 1} of ${items.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="lb__bar">
            <span className="lb__count" aria-live="polite">
              {index! + 1} / {items.length}
            </span>
            <button type="button" className="lb__close" onClick={close} aria-label="Close viewer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.figure
              key={index}
              className={`lb__stage${item.tall ? ' lb__stage--tall' : ''}`}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -60 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              drag={items.length > 1 && !item.tall ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={onDragEnd}
              tabIndex={item.tall ? 0 : -1}
              aria-label={item.tall ? 'Full-page screenshot, scroll to see all of it' : undefined}
              onClick={(e) => e.target === e.currentTarget && close()}
            >
              <img src={item.src} srcSet={item.srcset} sizes={`min(100vw, ${item.width}px)`} width={item.width} height={item.height} alt={item.alt} draggable={false} style={{ maxWidth: `min(100%, ${item.width}px)` }} />
              {item.caption && <figcaption>{item.caption}</figcaption>}
            </motion.figure>
          </AnimatePresence>

          {items.length > 1 && (
            <>
              <button type="button" className="lb__nav lb__nav--prev" onClick={() => go(-1)} aria-label="Previous image">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" className="lb__nav lb__nav--next" onClick={() => go(1)} aria-label="Next image">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
