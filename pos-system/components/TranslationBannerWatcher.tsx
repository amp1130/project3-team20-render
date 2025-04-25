'use client';

import { useEffect } from 'react';

export function TranslationBannerWatcher() {
  useEffect(() => {
    const interval = setInterval(() => {
      const banner = document.querySelector(".goog-te-banner-frame");
      if (banner) {
        document.body.classList.add("translated");
      } else {
        document.body.classList.remove("translated");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return null;
}
