export type Locale = "en" | "ar";

export type Localized = { en: string; ar: string };

export type EventStatus = "confirmed" | "cancelled";

/** A reservation is also the public event listing once confirmed. */
export interface EventRecord {
  id: string;
  slug: string;
  ref: string;
  status: EventStatus;
  title: string;
  summary: string;
  description: string;
  category: CategoryId;
  audience: AudienceId;
  date: string; // YYYY-MM-DD, Beirut local date
  start: string; // HH:MM
  end: string; // HH:MM
  venueId: VenueId;
  venueOther?: string;
  expectedAttendance?: number;
  accessibility?: string;
  language: string;
  cost?: string; // empty = free entry
  ticketUrl?: string;
  website?: string;
  attachment?: string; // stored upload file name
  // Public organizer identity
  organizerName: string;
  organization?: string;
  // Private organizer contact, never rendered on public pages
  contactEmail: string;
  contactPhone: string;
  consentPublish: boolean;
  consentContact: boolean;
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  kind: NewsKindId;
  publishAt: string; // ISO; future = scheduled
  author: string;
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  topic: ContactTopicId;
  name: string;
  email: string;
  organization?: string;
  message: string;
  createdAt: string;
}

export interface Database {
  events: EventRecord[];
  news: NewsPost[];
  messages: ContactMessage[];
}

export type CategoryId =
  | "music"
  | "exhibition"
  | "theatre"
  | "film"
  | "talk"
  | "workshop"
  | "heritage"
  | "community";

export type AudienceId = "everyone" | "families" | "youth" | "adults" | "professionals";

export type VenueId =
  | "khan-al-franj"
  | "sea-castle"
  | "debbane-palace"
  | "soap-museum"
  | "old-city-square"
  | "corniche"
  | "other";

export type NewsKindId = "announcement" | "programme" | "notice";

export type ContactTopicId = "event" | "partnership" | "programme" | "press";
