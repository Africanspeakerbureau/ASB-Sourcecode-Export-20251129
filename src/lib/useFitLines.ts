import { RefObject, useEffect } from 'react';

/**
 * Shrinks the element's font-size down through the provided steps
 * until its height fits within `maxLines` of its computed line-height.
 * No truncation/ellipsis; purely resizes within bounds.
 */
export function useFitLines(
  ref: RefObject<HTMLElement>,
  opts?: { maxLines?: number; sizes?: number[] }
) {
  const maxLines = opts?.maxLines ?? 3;
  // Largest → smallest (px). Tweak freely.
  const sizes = opts?.sizes ?? [40, 38, 36, 34, 32, 30, 28, 26, 24];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const fit = () => {
      if (!el) return;
      // ensure numeric line-height; set a default if it's 'normal'
      const cs = window.getComputedStyle(el);
      let lh = parseFloat(cs.lineHeight);
      if (!Number.isFinite(lh)) {
        el.style.lineHeight = '1.15';
        lh = parseFloat(window.getComputedStyle(el).lineHeight);
      }

      // Try from biggest to smallest; stop when fits.
      for (const px of sizes) {
        el.style.fontSize = px + 'px';
        // Force reflow then measure
        const h = el.getBoundingClientRect().height;
        if (h / lh <= maxLines + 0.01) break;
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    schedule();
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, [ref, maxLines, JSON.stringify(opts?.sizes)]);
}

