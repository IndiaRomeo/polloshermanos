"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-bg min-h-screen text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
          {/* Header igual a Home */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 grid place-items-center text-black font-bold">
              PH
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pollos Hermanos</h1>
              <p className="text-white/60 text-sm">
                Acceso seguro al sistema
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Usuario</label>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none
                           focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">Clave</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none
                           focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-yellow-400 to-orange-500 text-black font-bold py-3
                         disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Ingresando..." : "Entrar al sistema"}
            </button>

            <div className="flex items-center justify-between text-xs text-white/50 pt-2">
              <Link href="/" className="hover:text-white">
                ← Volver
              </Link>

              {/* si no vas a implementar recuperación, puedes quitar esto */}
              <button
                type="button"
                onClick={() => setError("Pídele al admin que reinicie tu clave.")}
                className="hover:text-white"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-white/50 flex justify-between">
            <span>Secure session</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </main>
  );
}