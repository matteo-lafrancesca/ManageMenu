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
    let touchStartY = 0;
    let isEdgeTouch = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        // On considère un contact comme "proche du bord" s'il commence à moins de 25px des bords gauche/droit
        isEdgeTouch = touchStartX < 25 || touchStartX > window.innerWidth - 25;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isEdgeTouch && e.touches.length > 0) {
        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const deltaX = Math.abs(touchCurrentX - touchStartX);
        const deltaY = Math.abs(touchCurrentY - touchStartY);

        // Si le geste est principalement horizontal et dépasse un seuil de déplacement (5px),
        // on appelle preventDefault() pour annuler le swipe de navigation d'historique.
        if (deltaX > deltaY && deltaX > 5) {
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
