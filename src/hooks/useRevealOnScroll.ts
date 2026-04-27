import { useEffect, useRef } from "react";

/**
 * Adds a smooth reveal animation to children when they scroll into view.
 * Wrap a section with a ref and pass it the returned ref, or call the
 * hook on a parent that contains `[data-reveal]` children.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLElement>(
  selector = "[data-reveal]"
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const root = containerRef.current ?? document;
    const els = Array.from(
      (root as ParentNode).querySelectorAll<HTMLElement>(selector)
    );
    if (!els.length) return;

    // Initial state
    els.forEach((el) => {
      el.classList.add("reveal-init");
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector]);

  return containerRef;
}