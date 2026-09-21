/** Créneaux d'une heure, de 9 h à 20 h, sur les sept prochains jours. */

const OPENING_HOUR = 9;
const CLOSING_HOUR = 20;
const DAYS_AHEAD = 7;

export type SlotState = "free" | "busy" | "past";

export type Slot = {
  start: Date;
  end: Date;
  state: SlotState;
};

export function nextDays(from: Date = new Date()): Date[] {
  return Array.from({ length: DAYS_AHEAD }, (_, index) => {
    const day = new Date(from);
    day.setDate(day.getDate() + index);
    day.setHours(0, 0, 0, 0);
    return day;
  });
}

/** Format attendu par la fonction SQL machine_busy_slots : une date civile. */
export function toDayParam(day: Date) {
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${date}`;
}

export function buildSlots(
  day: Date,
  busy: { starts_at: string; ends_at: string }[],
  now: Date = new Date(),
): Slot[] {
  const ranges = busy.map((slot) => ({
    start: new Date(slot.starts_at).getTime(),
    end: new Date(slot.ends_at).getTime(),
  }));

  const slots: Slot[] = [];

  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour += 1) {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(hour + 1);

    // Un créneau chevauche une réservation dès que les deux intervalles se croisent.
    const taken = ranges.some((range) => start.getTime() < range.end && end.getTime() > range.start);

    slots.push({
      start,
      end,
      state: start.getTime() <= now.getTime() ? "past" : taken ? "busy" : "free",
    });
  }

  return slots;
}
