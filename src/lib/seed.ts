import type { Database, EventRecord, NewsPost } from "./types";

/**
 * Example content so the calendar and news pages are not empty in preview.
 * Every record is flagged `sample: true`; remove them from the admin area
 * (or delete data/db.json and set SEED_SAMPLES=false) before launch.
 */
const now = "2026-10-01T09:00:00.000Z";

type SampleEvent = Omit<
  EventRecord,
  "id" | "ref" | "status" | "contactEmail" | "contactPhone" | "consentPublish" | "consentContact" | "createdAt" | "updatedAt" | "sample"
>;

const events: SampleEvent[] = [
  {
    slug: "threads-of-the-sea-opening-night",
    title: "Threads of the Sea: opening night",
    summary: "The year opens at the Sea Castle with music, light and a welcome from Saida's cultural community.",
    description:
      "An open-air evening on the esplanade facing the Sea Castle. Local ensembles and guest musicians from across the Mediterranean share one stage to open the 2027 programme.\n\nSeating is limited near the stage; standing areas along the waterfront are open to everyone.",
    category: "music",
    audience: "everyone",
    date: "2027-01-15",
    start: "18:30",
    end: "21:30",
    venueId: "sea-castle",
    accessibility: "Step-free route from the corniche. Accessible seating near the stage on request.",
    language: "multi",
    organizerName: "MCCD Saida 2027 programme team",
  },
  {
    slug: "maritime-memory-exhibition",
    title: "ذاكرة البحر: معرض صور وأرشيف",
    summary: "صور وخرائط ووثائق من أرشيف عائلات الصيادين والبحّارة في صيدا.",
    description:
      "يجمع المعرض صوراً قديمة وخرائط ووثائق قدّمتها عائلات من صيدا، ويروي علاقة المدينة بالبحر عبر أجيال من الصيادين وصنّاع المراكب والتجار.\n\nالمعرض مفتوح يومياً خلال ساعات الفعالية، والدخول مجاني.",
    category: "exhibition",
    audience: "everyone",
    date: "2027-01-23",
    start: "10:00",
    end: "18:00",
    venueId: "khan-al-franj",
    accessibility: "الطابق الأرضي من دون درج. لوحات الشرح بالعربية والإنكليزية.",
    language: "ar",
    organizerName: "جمعية أصدقاء صيدا القديمة",
    organization: "جمعية أصدقاء صيدا القديمة",
  },
  {
    slug: "saida-cordoba-dialogue",
    title: "Saida and Cordoba in dialogue",
    summary: "Writers and historians from both 2027 capitals talk about shared Mediterranean memory.",
    description:
      "A public conversation between guests from Saida and Cordoba on how two port and river cities carry their histories into the present. Simultaneous Arabic and Spanish interpretation is provided.",
    category: "talk",
    audience: "adults",
    date: "2027-02-06",
    start: "17:00",
    end: "19:00",
    venueId: "debbane-palace",
    accessibility: "Ground floor hall. Interpretation headsets available.",
    language: "multi",
    organizerName: "MCCD Saida 2027 programme team",
  },
  {
    slug: "soap-making-family-workshop",
    title: "ورشة صناعة الصابون للعائلات",
    summary: "ورشة عملية للأهل والأطفال حول صناعة صابون زيت الزيتون التقليدية.",
    description:
      "يتعرّف المشاركون إلى مراحل صناعة الصابون التقليدي في صيدا، ثم يصنع كل مشارك قطعة صابون يأخذها معه.\n\nالأماكن محدودة، والتسجيل المسبق مطلوب عبر الرابط.",
    category: "workshop",
    audience: "families",
    date: "2027-02-13",
    start: "11:00",
    end: "13:00",
    venueId: "soap-museum",
    accessibility: "مناسب للأطفال من عمر 7 سنوات. مدخل من دون درج.",
    language: "ar",
    cost: "5 USD",
    ticketUrl: "https://example.org/register",
    organizerName: "متحف الصابون",
    organization: "متحف الصابون",
  },
  {
    slug: "old-city-heritage-walk",
    title: "Old City heritage walk",
    summary: "A guided walk through the souks, khans and alleys of Saida's old city.",
    description:
      "Start at Bab al-Saray square and walk through the old souks to Khan al-Franj with a local guide. The walk lasts about two hours and ends near the Sea Castle.",
    category: "heritage",
    audience: "everyone",
    date: "2027-02-20",
    start: "09:30",
    end: "11:30",
    venueId: "old-city-square",
    accessibility: "Uneven stone paths and some steps. Not suitable for wheelchairs.",
    language: "en",
    organizerName: "Saida Old City guides",
  },
  {
    slug: "harbour-cinema-night",
    title: "سينما على الكورنيش",
    summary: "عرض فيلم متوسطي في الهواء الطلق على الواجهة البحرية.",
    description: "عرض مفتوح لفيلم من إنتاج متوسطي مع ترجمة عربية. يُنصح بإحضار وسادة أو كرسي صغير.",
    category: "film",
    audience: "everyone",
    date: "2027-03-05",
    start: "19:30",
    end: "21:45",
    venueId: "corniche",
    accessibility: "منطقة جلوس مستوية قرب الشاشة.",
    language: "multi",
    organizerName: "نادي السينما في صيدا",
  },
  {
    slug: "youth-theatre-lab",
    title: "Youth theatre lab: stories from the port",
    summary: "Young performers present short pieces built from interviews with port workers.",
    description:
      "After a month of workshops, young people from Saida present short theatre pieces based on stories they collected at the port.",
    category: "theatre",
    audience: "youth",
    date: "2027-03-12",
    start: "18:00",
    end: "19:30",
    venueId: "khan-al-franj",
    accessibility: "Courtyard seating, step-free.",
    language: "ar",
    organizerName: "Saida youth theatre collective",
  },
  {
    slug: "neighbourhood-mural-day",
    title: "يوم الجداريات في الحيّ",
    summary: "رسم جماعي مفتوح لسكان الحيّ مع فنانين محليين.",
    description: "يدعو فنانون محليون سكان الحيّ إلى رسم جدارية مشتركة عن البحر والمدينة. المواد متوفرة في المكان.",
    category: "community",
    audience: "families",
    date: "2027-03-20",
    start: "10:00",
    end: "15:00",
    venueId: "old-city-square",
    accessibility: "ساحة مفتوحة ومستوية.",
    language: "ar",
    organizerName: "مبادرة ألوان صيدا",
  },
];

const news: Omit<NewsPost, "id" | "createdAt" | "updatedAt" | "sample" | "author">[] = [
  {
    slug: "saida-and-cordoba-named-2027-capitals",
    kind: "announcement",
    publishAt: "2026-09-20T08:00:00.000Z",
    title: {
      en: "Saida and Cordoba named Mediterranean Capitals of Culture and Dialogue for 2027",
      ar: "صيدا وقرطبة عاصمتا الثقافة والحوار في المتوسط لعام 2027",
    },
    excerpt: {
      en: "Foreign ministers of the Union for the Mediterranean endorsed the two cities for the 2027 edition.",
      ar: "أقرّ وزراء خارجية الاتحاد من أجل المتوسط اختيار المدينتين لنسخة عام 2027.",
    },
    body: {
      en: "The Union for the Mediterranean endorsed Saida, Lebanon, and Cordoba, Spain, as the Mediterranean Capitals of Culture and Dialogue for 2027.\n\nThe initiative is coordinated by the Union for the Mediterranean and the Anna Lindh Foundation. In Saida, the year will be built around the programme Threads of the Sea.",
      ar: "أقرّ الاتحاد من أجل المتوسط اختيار صيدا في لبنان وقرطبة في إسبانيا عاصمتين للثقافة والحوار في المتوسط لعام 2027.\n\nتنسّق المبادرة كلٌّ من الاتحاد من أجل المتوسط ومؤسسة آنا ليند. وفي صيدا، يقوم برنامج العام على عنوان «خيوط البحر».",
    },
  },
  {
    slug: "event-submissions-open",
    kind: "programme",
    publishAt: "2026-10-05T08:00:00.000Z",
    title: {
      en: "Cultural organizations can now reserve dates for 2027",
      ar: "باب حجز المواعيد مفتوح أمام المؤسسات الثقافية لعام 2027",
    },
    excerpt: {
      en: "Use the organizer form to choose a free date and venue. Your booking is confirmed straight away.",
      ar: "استخدموا نموذج المنظّمين لاختيار موعد ومكان متاحين، ويُثبَّت الحجز فوراً.",
    },
    body: {
      en: "Associations, artists, schools and cultural institutions can propose events for the 2027 programme. The form shows which dates and times are still free at each venue, and confirms your reservation immediately.\n\nThe programme team may contact you to coordinate details before your event appears with full information.",
      ar: "يمكن للجمعيات والفنانين والمدارس والمؤسسات الثقافية اقتراح فعاليات ضمن برنامج 2027. يعرض النموذج المواعيد والأوقات المتاحة في كل مكان، ويثبّت الحجز فوراً.\n\nقد يتواصل معكم فريق البرنامج لتنسيق التفاصيل.",
    },
  },
  {
    slug: "venue-access-notice",
    kind: "notice",
    publishAt: "2026-10-08T08:00:00.000Z",
    title: {
      en: "Venue list and access information",
      ar: "لائحة الأماكن ومعلومات الوصول",
    },
    excerpt: {
      en: "Preferred venues are listed on the organizer form. Each booking remains subject to venue approval.",
      ar: "الأماكن المقترحة مدرجة في نموذج المنظّمين، وكل حجز يبقى رهن موافقة إدارة المكان.",
    },
    body: {
      en: "The organizer form lists the preferred venues for 2027. If you choose another venue, tell us its name and address and the team will follow up.\n\nPlease describe any accessibility needs for your audience so we can plan together.",
      ar: "يضم نموذج المنظّمين لائحة الأماكن المقترحة لعام 2027. إذا اخترتم مكاناً آخر، يرجى ذكر اسمه وعنوانه وسيتابع الفريق معكم.\n\nيرجى وصف احتياجات الوصول لجمهوركم لنخطط معاً.",
    },
  },
];

export function seedDatabase(): Database {
  if (process.env.SEED_SAMPLES === "false") return { events: [], news: [], messages: [] };
  return {
    events: events.map((e, i) => ({
      ...e,
      id: `sample-event-${i + 1}`,
      ref: `SDA-SAMPLE${i + 1}`,
      status: "confirmed",
      contactEmail: "programme@example.org",
      contactPhone: "+961 7 000 000",
      consentPublish: true,
      consentContact: true,
      sample: true,
      createdAt: now,
      updatedAt: now,
    })),
    news: news.map((n, i) => ({
      ...n,
      id: `sample-news-${i + 1}`,
      author: "MCCD Saida team",
      sample: true,
      createdAt: now,
      updatedAt: now,
    })),
    messages: [],
  };
}
