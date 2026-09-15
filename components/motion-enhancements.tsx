"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MotionEnhancements() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const observed = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("motion-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    function scan() {
      document.querySelectorAll(".service-card,.project-card,.process-card,.about-copy,.about-photo,.contact-card,.stat-card,.module-metrics article,.content-editor-card,.quote-record,.pro-image-card").forEach(element => {
        if (observed.has(element)) return;
        observed.add(element);
        // Above-the-fold content remains immediately readable.
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        element.classList.add("motion-ready");
        observer.observe(element);
      });
    }
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      observed.forEach(element => element.classList.remove("motion-ready", "motion-visible"));
    };
  }, [pathname]);
  return null;
}
