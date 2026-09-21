/** Dates et crédits affichés en français, à l'heure du téléphone. */

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const longDayFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const hourFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function formatDay(date: Date) {
  return dayFormat.format(date);
}

export function formatLongDay(date: Date) {
  return longDayFormat.format(date);
}

export function formatHour(date: Date) {
  return hourFormat.format(date);
}

export function formatSlot(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return `${longDayFormat.format(start)} · ${hourFormat.format(start)} – ${hourFormat.format(end)}`;
}

export function formatCredits(value: number) {
  return `${value} crédit${Math.abs(value) > 1 ? "s" : ""}`;
}
