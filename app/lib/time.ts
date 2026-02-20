// app/lib/time.ts
const TZ = "America/Bogota";

/**
 * Retorna la fecha "YYYY-MM-DD" en zona Bogotá (sin depender del timezone del server).
 */
export function bogotaYmd(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date); // "2026-02-20"
}

/**
 * Devuelve el inicio de semana (lunes) en Bogotá a las 00:00,
 * convertido a Date (UTC) para guardarlo en DB.
 */
export function bogotaWeekStartUtc(date = new Date()) {
  // 1) obtenemos Y-M-D de Bogotá
  const ymd = bogotaYmd(date);
  const [y, m, d] = ymd.split("-").map(Number);

  // 2) creamos un Date "UTC" con ese día para calcular weekday en Bogotá.
  // truco: calculamos el día de la semana usando un formatter en Bogotá
  const weekdayFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  });

  // Fecha base al mediodía UTC para evitar cruces raros
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const wd = weekdayFmt.format(base); // "Mon", "Tue", etc

  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  const daysFromMonday = map[wd] ?? 0;

  // 3) restamos días hasta lunes, y fijamos 00:00 Bogotá
  // Creamos un Date en UTC correspondiente a 00:00 Bogotá:
  // Bogotá = UTC-5, así que 00:00 Bogotá = 05:00 UTC
  const mondayYmdUtc = new Date(Date.UTC(y, m - 1, d - daysFromMonday, 5, 0, 0));
  return mondayYmdUtc;
}