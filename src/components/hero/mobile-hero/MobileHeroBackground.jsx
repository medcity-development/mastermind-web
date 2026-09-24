"use client";

import { useEffect, useRef } from "react";

export default function MobileHeroBackground() {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) return;

    const handleMouseMove = (event) => {
      const x = event.clientX - window.innerWidth / 2;
      const y = event.clientY - window.innerHeight / 2;

      grid.style.setProperty("--grid-x", `${x / 35}px`);
      grid.style.setProperty("--grid-y", `${y / 35}px`);
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base background */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-[#030b32]
          via-[#091958]
          to-[#24104f]
        "
      />

      {/* Blue glow */}

      <Glow
        className="
          -left-32
          top-12
          h-[360px]
          w-[360px]
          bg-blue-500/30
        "
      />

      {/* Violet glow */}

      <Glow
        className="
          -right-32
          top-16
          h-[370px]
          w-[370px]
          bg-violet-500/30
        "
      />

      {/* Pink glow */}

      <Glow
        className="
          -right-24
          bottom-16
          h-[340px]
          w-[340px]
          bg-fuchsia-500/20
        "
      />

      {/* Bottom purple glow */}

      <Glow
        className="
          -left-20
          bottom-[-80px]
          h-[300px]
          w-[300px]
          bg-purple-500/20
        "
      />

      {/* Center glow */}

      <Glow
        className="
          left-[35%]
          top-[40%]
          h-[250px]
          w-[250px]
          bg-pink-500/10
        "
      />

      {/* Moving grid */}

      <div
        ref={gridRef}
        className="
          hero-moving-grid
          absolute
          -inset-[100px]
          opacity-[0.10]
          will-change-transform
        "
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(255,255,255,0.16) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255,255,255,0.16) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "40px 40px",
          transform:
            "translate(var(--grid-x, 0px), var(--grid-y, 0px))",
        }}
      />

      {/* Dot pattern */}

      <div
        className="
          absolute
          right-2
          top-28
          h-40
          w-40
          opacity-[0.16]
        "
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1.2px, transparent 1.2px)",
          backgroundSize: "12px 12px",
          maskImage:
            "linear-gradient(to bottom left, black, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom left, black, transparent)",
        }}
      />

      {/* Decorative rings */}

      <div
        className="
          absolute
          -right-14
          bottom-40
          h-40
          w-40
          rounded-full
          border
          border-violet-300/10
        "
      />

      <div
        className="
          absolute
          -right-2
          bottom-48
          h-24
          w-24
          rounded-full
          border
          border-pink-300/10
        "
      />

      {/* Diagonal light */}

      <div
        className="
          absolute
          left-[-20%]
          top-[48%]
          h-[180px]
          w-[140%]
          rotate-[-12deg]
          bg-gradient-to-r
          from-transparent
          via-purple-400/[0.06]
          to-transparent
          blur-2xl
        "
      />
    </div>
  );
}

function Glow({ className }) {
  return (
    <div
      className={`
        absolute
        rounded-full
        blur-[110px]
        ${className}
      `}
    />
  );
}