/**
 * Scroll reveals for static (non-React) sections. React islands animate
 * themselves with Framer Motion `whileInView`.
 *
 * Reveals replay every time a section re-enters the viewport, in both scroll
 * directions. To avoid flicker while something is being read, an element only
 * resets once it has left the viewport *completely* (hysteresis: it reveals at
 * ≥12% visible, resets at 0%). The reset happens off-screen with transitions
 * disabled, so the user never sees an element snap back.
 */
const REVEAL_AT = 0.12;
let io: IntersectionObserver | undefined;

function reset(el: HTMLElement, exitedAbove: boolean) {
  // Re-enter from the side it left: things above the fold come back down into place.
  el.dataset.from = exitedAbove ? 'above' : 'below';
  el.classList.add('no-anim');
  el.classList.remove('is-in');
  void el.offsetWidth; // commit the reset before transitions come back
  el.classList.remove('no-anim');
}

export function initMotion() {
  document.documentElement.classList.add('js');
  io?.disconnect();

  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
  } else {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting && e.intersectionRatio >= REVEAL_AT) {
            el.classList.add('is-in');
          } else if (!e.isIntersecting && el.classList.contains('is-in')) {
            reset(el, e.boundingClientRect.bottom <= 0);
          }
        }
      },
      { threshold: [0, REVEAL_AT] },
    );
    targets.forEach((el) => io!.observe(el));
  }

  // Nav hide-on-scroll + reading-progress line (the progress line stands in for the hidden scrollbar).
  const nav = document.querySelector<HTMLElement>('.nav');
  const root = document.documentElement;
  let last = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--progress', String(max > 0 ? Math.min(1, y / max) : 0));
    nav?.classList.toggle('is-scrolled', y > 24);
    nav?.classList.toggle('is-hidden', y > last && y > 400 && !nav.classList.contains('is-open') && !nav.contains(document.activeElement));
    last = y;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  const w = window as Window & { __onScroll?: () => void };
  if (w.__onScroll) removeEventListener('scroll', w.__onScroll);
  w.__onScroll = onScroll;
  addEventListener('scroll', onScroll, { passive: true });
  update();
}
