# MCCD Saida 2027 website

The public website for Saida's year as a Mediterranean Capital of Culture and Dialogue 2027, under the programme name *Threads of the Sea*. It is built from the agency brief (`MCCD_Saida_2027_Website_Brief.pdf`).

## What it does

- **Arabic and English.** The site launches in both languages, with a full right-to-left layout for Arabic. Visitors are sent to their browser's language, and Arabic is the fallback.
- **Home page.** Introduces the programme, lists upcoming events, invites organizers to take part, shows the latest news and says who is behind the programme.
- **Events.** List and calendar views, filters by month, type and audience. Each event page shows:
  - date and time, venue and map
  - organizer, audience and language
  - entry price or free entry, plus accessibility details
  - ticket link, share buttons, an add-to-calendar file (`.ics`) and structured data for search engines
- **Submit an event and reserve a date.** The organizer form contains every field the brief asks for.
  - **Availability:** it shows live availability for the chosen date and venue, and greys out times that are already taken.
  - **Double-booking:** the server checks the slot again inside a locked transaction, so two people can't take the same time.
  - **Confirmation:** a free slot is confirmed straight away. The organizer receives an email and the event appears in the public calendar.
- **Privacy.** The organizer's email and phone are never sent to public pages; this is enforced in `toPublic()`. A privacy page explains how contact details are used.
- **News.** Posts are bilingual. Only the team can publish them, and a post can be scheduled for a future date.
- **About and Contact.** These pages describe the initiative, the 2027 designation, the theme and the link with Cordoba, and show organizer and partner roles using the brief's wording. The contact form stores each message and emails it to the team.
- **Admin (`/admin`).** The team can:
  - see a calendar of booked and available dates
  - edit, cancel, reinstate or delete reservations; the clash check still applies
  - manage news posts and read contact messages
  - export reservations and messages as CSV

## Decisions the committee still needs to make

The brief leaves these open, so the site is built to switch easily:

| Open question | Where to set it |
|---|---|
| Can one date or venue hold several events at different times? | `BOOKING_RULE` = `slot` (default), `venue-day` or `day` |
| Official contact email | `CONTACT_EMAIL` (until it is set, the Contact page shows a "to be confirmed" note) |
| Committee name, organizer roles, partner wording | `partners` in `src/lib/dictionaries/en.ts` and `ar.ts` |
| Official logos | Partner logos are left out until approved. The wave mark in `src/components/Mark.tsx` is a placeholder |
| Venue list | `VENUES` in `src/lib/config.ts` |

## Running it

```bash
npm install
cp .env.example .env.local   # adjust values
npm run dev                  # http://localhost:3000
```

In development you can sign in to `/admin` with `admin` / `saida2027`. In production, admin is turned off until `ADMIN_USERS` is set.

On first run, `data/db.json` is created with **example** events and news so the pages are not empty. They are labelled "Example listing" on the site. Remove them before launch with the button in the admin area, or set `SEED_SAMPLES=false`.

## Hosting note

All data goes through `src/lib/db.ts`, a JSON-file store. Its write queue makes bookings safe on a **single Node server**, such as a VPS or one container with a persistent disk.

For serverless or multi-instance hosting, replace that one module with a database (for example Postgres with a unique constraint on venue and time). Uploads also need object storage in that setup.

## Design

The look takes its cues from the Saida Municipality crest and the city itself:

- **Colour:** Mediterranean sea blue is the single accent, set against cool limestone neutrals. Dark mode uses a deep harbour navy.
- **Type:** Readex Pro, self-hosted, covers both Arabic and Latin.
- **Motion:** kept light and switched off for visitors who prefer reduced motion.

The design follows the `taste-skill` and `web-design-guidelines` rules from `ali-saadi111/claude-design-skills`.

## Photo credits

All photographs are openly licensed. The full list with links is on the About page (`/en/about#credits`):

- Vyacheslav Argenberg (CC BY 4.0)
- rabiem22, heatheronhertravels, liakada-web (CC BY 2.0)
- Raini4 (Public Domain Mark)

They are stand-ins until the committee provides its own photography.
