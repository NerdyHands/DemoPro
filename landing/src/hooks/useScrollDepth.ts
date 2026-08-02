import {useEffect, useRef} from 'react';
import {trackScrollDepth} from '../config/gtm';
import type {PageType, ScrollDepthPercent} from '../config/analyticsTypes';

const THRESHOLDS: ScrollDepthPercent[] = [25, 50, 75, 90];

/**
 * Fires scroll_depth at 25%, 50%, 75%, and 90% once per page view (pathname).
 */
export function useScrollDepth(pageType?: PageType) {
  const fired = useRef<Record<ScrollDepthPercent, boolean>>({
    25: false,
    50: false,
    75: false,
    90: false
  });

  useEffect(() => {
    fired.current = {25: false, 50: false, 75: false, 90: false};

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const height =
        (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      if (height <= 0) return;
      const pct = Math.round((scrollTop / height) * 100);

      for (const threshold of THRESHOLDS) {
        if (pct >= threshold && !fired.current[threshold]) {
          fired.current[threshold] = true;
          trackScrollDepth({percent_scrolled: threshold, page_type: pageType});
        }
      }
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [pageType]);
}
