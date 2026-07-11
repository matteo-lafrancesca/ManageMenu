'use client';

import { useEffect } from 'react';

export default function GestureBlocker() {
  useEffect(() => {
    // 1. Bloquer le pincement pour zoomer (pinch-to-zoom)
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('gesturestart', handleGestureStart);

    // 2. Bloquer le swipe de navigation d'historique (edge swipe back/forward) sur Safari iOS
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touchStartXOffset = touchStartX;
        // Si le geste commence près des bords gauche (0-20px) ou droit (largeur - 20px)
        if (touchStartXOffset < 20 || touchStartXOffset > window.innerWidth - 20) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', handleGestureStart);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return null;
}
