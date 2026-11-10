"use client";
import { useCallback, useRef, useState } from "react";

interface TiltState {
  rotateX: number;
  rotateY: number;
  shadowX: number;
  shadowY: number;
  glowX: number;
  glowY: number;
}

const DEFAULT: TiltState = { rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 0, glowX: 50, glowY: 50 };

export function useMouseTilt(intensity = 12) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>(DEFAULT);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setTilt({
        rotateX: -dy * intensity,
        rotateY: dx * intensity,
        shadowX: dx * 20,
        shadowY: dy * 20,
        glowX: ((e.clientX - rect.left) / rect.width) * 100,
        glowY: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [intensity]
  );

  const onMouseLeave = useCallback(() => setTilt(DEFAULT), []);

  return { ref, tilt, onMouseMove, onMouseLeave };
}

