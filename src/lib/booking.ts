import { bookingRule, DAY_CLOSES, DAY_OPENS, type BookingRule } from "./config";
import type { EventRecord } from "./types";

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

export interface SlotRequest {
  date: string;
  start: string;
  end: string;
  venueId: string;
}

/** Events that would conflict with the request under the active booking rule. */
export function conflictsFor(
  events: EventRecord[],
  req: SlotRequest,
  opts: { ignoreId?: string; rule?: BookingRule } = {},
) {
  const rule = opts.rule ?? bookingRule();
  return events.filter((e) => {
    if (e.status !== "confirmed" || e.id === opts.ignoreId || e.date !== req.date) return false;
    if (rule === "day") return true;
    // "Other venue" bookings are free-text locations, so they cannot clash with each other.
    if (req.venueId === "other" || e.venueId !== req.venueId) return false;
    if (rule === "venue-day") return true;
    return overlaps(e.start, e.end, req.start, req.end);
  });
}

export type SlotError = "time-order" | "time-range" | "time-format" | "date-format";

export function validateSlot(req: SlotRequest): SlotError | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.date) || Number.isNaN(Date.parse(req.date))) return "date-format";
  if (!/^\d{2}:\d{2}$/.test(req.start) || !/^\d{2}:\d{2}$/.test(req.end)) return "time-format";
  if (toMinutes(req.start) >= toMinutes(req.end)) return "time-order";
  if (toMinutes(req.start) < toMinutes(DAY_OPENS) || toMinutes(req.end) > toMinutes(DAY_CLOSES)) return "time-range";
  return null;
}

/** Public availability for one date and venue: busy ranges only, no organizer details. */
export function busyRanges(events: EventRecord[], date: string, venueId: string) {
  const rule = bookingRule();
  const probe = { date, venueId, start: DAY_OPENS, end: DAY_CLOSES };
  const hits = conflictsFor(events, probe, { rule });
  if (rule !== "slot") {
    return { rule, wholeDay: hits.length > 0, ranges: [] as { start: string; end: string }[] };
  }
  return {
    rule,
    wholeDay: false,
    ranges: hits.map((e) => ({ start: e.start, end: e.end })).sort((a, b) => a.start.localeCompare(b.start)),
  };
}
