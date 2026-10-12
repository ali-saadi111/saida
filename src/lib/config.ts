import type { AudienceId, CategoryId, ContactTopicId, Localized, NewsKindId, VenueId } from "./types";

/**
 * Booking rule. The brief leaves this open for the committee to decide:
 *  - "slot":      different events may share a venue on the same date if their times do not overlap
 *  - "venue-day": one event per venue per date
 *  - "day":       one event per date across the whole programme
 * Set BOOKING_RULE in the environment once the committee confirms.
 */
export type BookingRule = "slot" | "venue-day" | "day";

export function bookingRule(): BookingRule {
  const v = process.env.BOOKING_RULE;
  return v === "day" || v === "venue-day" ? v : "slot";
}

/** Bookable hours, Beirut local time. */
export const DAY_OPENS = "09:00";
export const DAY_CLOSES = "23:00";
export const SLOT_STEP_MIN = 30;

/** First and last date organizers may reserve. */
export const PROGRAMME_START = "2027-01-01";
export const PROGRAMME_END = "2027-12-31";

export interface Venue {
  id: VenueId;
  name: Localized;
  lat?: number;
  lng?: number;
}

/** Preferred venues offered on the organizer form. Each booking remains subject to venue approval. */
export const VENUES: Venue[] = [
  { id: "khan-al-franj", name: { en: "Khan al-Franj", ar: "خان الإفرنج" }, lat: 33.56357, lng: 35.37119 },
  { id: "sea-castle", name: { en: "Sea Castle esplanade", ar: "ساحة قلعة صيدا البحرية" }, lat: 33.56711, lng: 35.36975 },
  { id: "debbane-palace", name: { en: "Debbane Palace", ar: "قصر دبانة" }, lat: 33.56252, lng: 35.37225 },
  { id: "soap-museum", name: { en: "Saida Soap Museum", ar: "متحف الصابون" }, lat: 33.56262, lng: 35.37196 },
  { id: "old-city-square", name: { en: "Old City, Bab al-Saray square", ar: "صيدا القديمة، ساحة باب السراي" }, lat: 33.56405, lng: 35.37154 },
  { id: "corniche", name: { en: "Saida Corniche", ar: "كورنيش صيدا البحري" }, lat: 33.55851, lng: 35.36949 },
  { id: "other", name: { en: "Other venue", ar: "مكان آخر" } },
];

export const CATEGORIES: { id: CategoryId; name: Localized; image: string }[] = [
  { id: "music", name: { en: "Music", ar: "موسيقى" }, image: "/images/sea-castle-harbour.jpg" },
  { id: "exhibition", name: { en: "Exhibition", ar: "معرض" }, image: "/images/khan-al-franj-hall.jpg" },
  { id: "theatre", name: { en: "Theatre and dance", ar: "مسرح ورقص" }, image: "/images/khan-al-franj-courtyard.jpg" },
  { id: "film", name: { en: "Film", ar: "سينما" }, image: "/images/old-city-square.jpg" },
  { id: "talk", name: { en: "Talk and debate", ar: "ندوة وحوار" }, image: "/images/khan-al-franj-arch.jpg" },
  { id: "workshop", name: { en: "Workshop", ar: "ورشة عمل" }, image: "/images/old-city-street.jpg" },
  { id: "heritage", name: { en: "Heritage walk", ar: "جولة تراثية" }, image: "/images/sea-castle.jpg" },
  { id: "community", name: { en: "Community", ar: "مبادرة مجتمعية" }, image: "/images/old-city-play.jpg" },
];

export const AUDIENCES: { id: AudienceId; name: Localized }[] = [
  { id: "everyone", name: { en: "Everyone", ar: "الجميع" } },
  { id: "families", name: { en: "Families and children", ar: "العائلات والأطفال" } },
  { id: "youth", name: { en: "Young people", ar: "الشباب" } },
  { id: "adults", name: { en: "Adults", ar: "البالغون" } },
  { id: "professionals", name: { en: "Artists and professionals", ar: "الفنانون والمهنيون" } },
];

export const NEWS_KINDS: { id: NewsKindId; name: Localized }[] = [
  { id: "announcement", name: { en: "Announcement", ar: "إعلان" } },
  { id: "programme", name: { en: "Programme update", ar: "تحديث البرنامج" } },
  { id: "notice", name: { en: "Important notice", ar: "تنبيه هام" } },
];

export const CONTACT_TOPICS: { id: ContactTopicId; name: Localized }[] = [
  { id: "event", name: { en: "An event proposal", ar: "اقتراح فعالية" } },
  { id: "partnership", name: { en: "A partnership", ar: "شراكة" } },
  { id: "programme", name: { en: "The programme", ar: "البرنامج" } },
  { id: "press", name: { en: "Press and media", ar: "الصحافة والإعلام" } },
];

export const LANGUAGES: { id: string; name: Localized }[] = [
  { id: "ar", name: { en: "Arabic", ar: "العربية" } },
  { id: "en", name: { en: "English", ar: "الإنكليزية" } },
  { id: "fr", name: { en: "French", ar: "الفرنسية" } },
  { id: "es", name: { en: "Spanish", ar: "الإسبانية" } },
  { id: "none", name: { en: "No spoken language", ar: "بدون لغة محكية" } },
  { id: "multi", name: { en: "Several languages", ar: "عدة لغات" } },
];

export function venueById(id: string) {
  return VENUES.find((v) => v.id === id);
}
export function categoryById(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
export function audienceById(id: string) {
  return AUDIENCES.find((a) => a.id === id);
}
export function languageById(id: string) {
  return LANGUAGES.find((l) => l.id === id);
}

/** Public contact address. Leave unset until the committee confirms the official address. */
export function contactEmail(): string | undefined {
  return process.env.CONTACT_EMAIL || undefined;
}

export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
