/**
 * Lightweight scroll reveals for static (non-React) sections.
 * React islands animate themselves with Framer Motion.
 */
let io: IntersectionObserver | undefined;

export function initMotion() {
  document.documentElement.classList.add('js');
  io?.disconnect();

  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io?.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );
  targets.forEach((el) => io!.observe(el));

  // Nav: hide on scroll down, show on scroll up.
  const nav = document.querySelector<HTMLElement>('.nav');
  let last = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav?.classList.toggle('is-scrolled', y > 24);
    nav?.classList.toggle('is-hidden', y > last && y > 400 && !nav.classList.contains('is-open'));
    last = y;
  };
  removeEventListener('scroll', (window as any).__navScroll);
  (window as any).__navScroll = onScroll;
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
