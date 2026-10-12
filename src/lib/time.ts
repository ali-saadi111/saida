/** UTC offset of Beirut on a given local date and time, e.g. "+02:00" in winter, "+03:00" in summer. */
export function beirutOffset(date: string, time = "12:00") {
  const guess = new Date(`${date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Beirut", timeZoneName: "longOffset" }).formatToParts(guess);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+02:00";
  const m = name.match(/GMT([+-]\d{2}):?(\d{2})?/);
  return m ? `${m[1]}:${m[2] ?? "00"}` : "+02:00";
}

export function beirutIso(date: string, time: string) {
  return `${date}T${time}:00${beirutOffset(date, time)}`;
}
