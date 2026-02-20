"use client";

import { useState } from "react";
import BootLoader from "./components/BootLoader";
import Link from "next/link";

export default function Home() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <BootLoader onFinish={() => setReady(true)} />;
  }

  return (
    <main className="app-bg min-h-screen text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 grid place-items-center text-black font-bold">
              PH
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pollos Hermanos</h1>
              <p className="text-white/60 text-sm">
                Control de inventario y ventas
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link href="/login" className="w-full block text-center rounded-xl bg-linear-to-r from-yellow-400 to-orange-500 text-black font-bold py-3">
              Entrar al sistema
            </Link>
          </div>

          <div className="mt-6 text-xs text-white/50 flex justify-between">
            <span>Secure session</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </main>
  );
}