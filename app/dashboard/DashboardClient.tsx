"use client";

import { useEffect, useMemo, useState } from "react";

type Sale = {
  id: string;
  date: string;
  qty: number;
  unitPrice: number;
  note?: string | null;
};

type Week = {
  id: string;
  startDate: string;
  initialQty: number;
  sales: Sale[];
};

type WeekHistoryRow = {
  id: string;
  startDate: string;
  initialQty: number;
  sold: number;
  remaining: number;
  revenue: number;
};

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardClient({ user }: { user: { username: string; role: string } }) {
  const [week, setWeek] = useState<Week | null>(null);

  // ✅ AQUÍ va history (dentro del componente)
  const [history, setHistory] = useState<WeekHistoryRow[]>([]);

  const [initialQty, setInitialQty] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(50000);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Respuesta no JSON (${res.status}): ${text.slice(0, 200)}`);
  }
}

async function loadCurrent() {
  setError("");

  try {
    const res = await fetch("/api/weeks/current", {
      cache: "no-store",
      credentials: "include",
    });

    const data = await safeJson(res);

    if (!res.ok) {
      setWeek(null);
      setHistory([]);
      setError(data?.error || `Error /api/weeks/current (${res.status})`);
      return;
    }

    setWeek(data?.week ?? null);
    if (data?.week?.initialQty != null) setInitialQty(data.week.initialQty);

    const res2 = await fetch("/api/weeks", {
      cache: "no-store",
      credentials: "include",
    });

    const data2 = await safeJson(res2);

    if (!res2.ok) {
      setHistory([]);
      setError(data2?.error || `Error /api/weeks (${res2.status})`);
      return;
    }

    setHistory(data2?.weeks ?? []);
  } catch (e: any) {
    setWeek(null);
    setHistory([]);
    setError(e?.message || "Error inesperado cargando datos");
  }
}

  useEffect(() => {
    loadCurrent();
  }, []);

    const totals = useMemo(() => {

    const sales = week?.sales ?? [];
    const sold = sales.reduce((acc, s) => acc + s.qty, 0);
    const revenue = sales.reduce((acc, s) => acc + s.qty * s.unitPrice, 0);
    const remainingRaw = (week?.initialQty ?? 0) - sold;
    const remaining = Math.max(0, remainingRaw); // nunca negativo
    return { sold, revenue, remaining };

    }, [week]);

    const isSoldOut = !!week && totals.remaining <= 0;

  async function saveInitial() {
    setError("");
    const res = await fetch("/api/weeks/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initialQty }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Error guardando inventario");
    await loadCurrent();
  }

  async function addSale() {
    setError("");
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty, unitPrice, note }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Error registrando venta");
    setQty(1);
    setNote("");
    await loadCurrent();
  }

  return (
    <main className="app-bg min-h-screen text-white p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-white/60 text-sm">
                Bienvenido, <span className="text-white">{user.username}</span> ({user.role})
              </p>
            </div>

            <div className="text-right text-xs text-white/60">
              <div>Semana activa (Bogotá)</div>
              <div className="text-white">
                {week ? new Date(week.startDate).toISOString().slice(0, 10) : "Sin iniciar"}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Inventario inicial" value={week ? `${week.initialQty} pollos` : "—"} />
          <Card title="Vendidos (semana)" value={week ? `${totals.sold} pollos` : "—"} />
          <Card title="Stock restante" value={week ? `${totals.remaining} pollos` : "—"} />
        </div>

        <div className="mt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Total ventas semana</h2>
              <div className="text-xl font-bold">{week ? formatCOP(totals.revenue) : "—"}</div>
            </div>
          </div>
        </div>

        {/* Inicializar semana */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
          <h2 className="font-bold">Semana activa</h2>
          <p className="text-white/60 text-sm mt-1">
            Define cuántos pollos tienes al iniciar la semana. Luego registra ventas con precio variable.
          </p>

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <input
              type="number"
              value={initialQty}
              onChange={(e) => setInitialQty(Number(e.target.value))}
              className="w-full md:w-64 rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none
                         focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20"
              placeholder="Inventario inicial"
            />
            <button
              onClick={saveInitial}
              className="rounded-xl bg-linear-to-r from-yellow-400 to-orange-500 text-black font-bold px-5 py-3 cursor-pointer"
            >
              Guardar inventario semanal
            </button>
          </div>
        </div>

        {/* Registrar venta */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
          <h2 className="font-bold">Registrar venta</h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none
                         focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20"
              placeholder="Cantidad"
            />
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none
                         focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20"
              placeholder="Precio unitario (COP)"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none
                         focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20"
              placeholder="Nota (opcional)"
            />
            <button
            onClick={addSale}
            disabled={!week || isSoldOut}
            className={`rounded-xl bg-linear-to-r from-yellow-400 to-orange-500 text-black font-bold px-5 py-3 cursor-pointer
                ${(!week || isSoldOut) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
            Agregar
            </button>

          </div>

          {week && isSoldOut && (
            <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                Semana agotada: ya no hay pollos disponibles. Para continuar, inicia la nueva semana cuando corresponda.
            </div>
            )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Lista simple */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-white/80">Ventas registradas</h3>
            <div className="mt-2 space-y-2">
              {(week?.sales ?? [])
                .slice()
                .reverse()
                .map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex justify-between"
                  >
                    <div className="text-sm">
                      <span className="font-bold">{s.qty}</span> × {formatCOP(s.unitPrice)}
                      {s.note ? <span className="text-white/50"> — {s.note}</span> : null}
                    </div>
                    <div className="font-bold">{formatCOP(s.qty * s.unitPrice)}</div>
                  </div>
                ))}
              {(week?.sales ?? []).length === 0 && (
                <div className="text-white/50 text-sm">Aún no hay ventas registradas.</div>
              )}
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Historial por semanas</h2>
            <span className="text-xs text-white/50">Últimas 20</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="py-2 text-left">Semana</th>
                  <th className="py-2 text-right">Inicial</th>
                  <th className="py-2 text-right">Vendidos</th>
                  <th className="py-2 text-right">Restante</th>
                  <th className="py-2 text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {history.map((w) => (
                  <tr key={w.id} className="border-b border-white/5">
                    <td className="py-2">{new Date(w.startDate).toISOString().slice(0, 10)}</td>
                    <td className="py-2 text-right">{w.initialQty}</td>
                    <td className="py-2 text-right">{w.sold}</td>
                    <td className="py-2 text-right">{w.remaining}</td>
                    <td className="py-2 text-right font-bold">{formatCOP(w.revenue)}</td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-3 text-white/50">
                      Aún no hay semanas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-xl">
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}