"use client";

import React from "react";

interface GradientBarsProps {
  numBars?: number;
  gradientFrom?: string;
  gradientTo?: string;
  animationDuration?: number;
  className?: string;
}

export function GradientBars({
  numBars = 15,
  gradientFrom = "rgb(255, 99, 99)",
  gradientTo = "transparent",
  animationDuration = 2,
  className = "",
}: GradientBarsProps) {
  const calculateHeight = (index: number, total: number) => {
    const position = index / (total - 1);
    const maxHeight = 100;
    const minHeight = 30;
    const center = 0.5;
    const distanceFromCenter = Math.abs(position - center);
    const heightPercentage = Math.pow(distanceFromCenter * 2, 1.2);
    return minHeight + (maxHeight - minHeight) * heightPercentage;
  };

  return (
    <>
      <style>{`
        @keyframes pulseBar {
          0% { transform: scaleY(var(--initial-scale)); }
          100% { transform: scaleY(calc(var(--initial-scale) * 0.7)); }
        }
      `}</style>
      <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
        <div
          className="flex h-full w-full"
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        >
          {Array.from({ length: numBars }).map((_, index) => {
            const height = calculateHeight(index, numBars);
            return (
              <div
                key={index}
                className="flex-1"
                style={{
                  background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
                  transform: `scaleY(${height / 100})`,
                  transformOrigin: "bottom",
                  animation: `pulseBar ${animationDuration}s ease-in-out infinite alternate`,
                  animationDelay: `${index * 0.1}s`,
                  outline: "1px solid rgba(0, 0, 0, 0)",
                  boxSizing: "border-box" as const,
                  // @ts-ignore
                  "--initial-scale": height / 100,
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}