'use client';

import { useRef, useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

/**
 * Custom hook to calculate an element's position in viewport as a percentage
 * This helps create position-aware gradient borders
 */
export const useViewportPosition = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [gradientVars, setGradientVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const updatePosition = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate position as percentage within viewport
      const x = Math.max(0, Math.min(100, (rect.left / viewportWidth) * 100));
      const y = Math.max(0, Math.min(100, (rect.top / viewportHeight) * 100));
      
      setPosition({ x, y });
      
      // Create CSS variables for gradient based on position
      const gradientX = 100 - x; // Invert for gradient direction
      const gradientY = 100 - y; // Invert for gradient direction
      
      setGradientVars({
        '--gradient-pos-x': `${gradientX}%`,
        '--gradient-pos-y': `${gradientY}%`,
        '--gradient-angle': `${Math.atan2(gradientY - 50, gradientX - 50) * (180 / Math.PI)}deg`,
      });
    };

    // Initialize on mount
    updatePosition();

    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  return { ref, position, gradientVars };
};

export default useViewportPosition;