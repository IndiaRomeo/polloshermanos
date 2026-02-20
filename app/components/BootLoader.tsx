"use client";

import { useEffect, useState } from "react";

export default function BootLoader({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="app-bg min-h-screen flex flex-col items-center justify-center text-white px-6">
      <div className="text-center space-y-6 w-full max-w-md">
        <h1 className="text-4xl font-extrabold tracking-widest">
          <span className="text-yellow-400">P</span>OLL
          <span className="text-orange-500">O</span>S
        </h1>

        <p className="text-cyan-400 text-sm tracking-wide">
          Inicializando sistema…
        </p>

        {/* Barra */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-yellow-400 via-orange-500 to-yellow-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-white/60">
          {progress}% completado
        </p>
      </div>
    </div>
  );
}