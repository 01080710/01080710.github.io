// English text for the /en/ pages. Draft translation of profile.ts, pending Peter's review.
// Only text is overridden here; names, dates, tags and contact links come from profile.ts,
// so a date change is made once in profile.ts and both languages follow.
import { profile } from "./profile";

// Same order as profile.experience; only role and note are translated.
// Company names stay in Chinese until official English names are confirmed.
const experience_text = [
  { role: "Data Engineer (Data Specialist)",
    note: "Operations data infrastructure, risk-control reconciliation pipelines, operations accounting automation." },
  { role: "Data Engineer",
    note: "RESTful API for an equipment management platform; contributed to a smart monitoring dashboard." },
  { role: "Data Analyst",
    note: "Vehicle-model data crawler, VIN lookup system, OCR + NLP module for an insurance-claims platform, GCP VM/VPN administration." },
];

if (experience_text.length !== profile.experience.length) {
  throw new Error(
    `profile.en.ts: experience_text has ${experience_text.length} entries but profile.experience has ${profile.experience.length}; ` +
    "add the English role/note for every job in the same order.",
  );
}

// Same order as profile.life.photos; only text is translated, src comes from profile.ts.
const life_photo_text = [
  { place: "Maldives - Maafushi", caption: "Swimming with nurse sharks",
    alt:   "Aerial shot: me floating in a red life vest on turquoise water, surrounded by a dozen nurse sharks" },
  { place: "Thailand - Pattaya",  caption: "Tandem skydive",
    alt:   "Me on a tandem skydive with an instructor, just out of a red-and-white plane against a blue sky" },
  { place: "Taiwan - Xiaoliuqiu", caption: "Diving with a sea turtle",
    alt:   "Me and a dive buddy beside a coral reef while a sea turtle feeds in front of us" },
  { place: "Indonesia - Bali",    caption: "Manta ray",
    alt:   "A manta ray gliding through blue water with its mouth open" },
  { place: "Fiji - Kuata Island", caption: "Blacktip and whitetip reef sharks",
    alt:   "Video: reef sharks cruising over the reef in blue water" },
];

if (life_photo_text.length !== profile.life.photos.length) {
  throw new Error(
    `profile.en.ts: life_photo_text has ${life_photo_text.length} entries but profile.life.photos has ${profile.life.photos.length}; ` +
    "add the English place/caption/alt for every photo in the same order.",
  );
}

// Same groups and order as profile.certifications; only name and issuer are translated (dates and images from profile.ts).
// Names follow the English wording printed on each certificate where there is one.
const certification_text = [
  [
    { name: "TQC-DA MySQL 5, Professional Level",                     issuer: "Computer Skills Foundation" },
    { name: "TQC+ Python Machine Learning Expert",                    issuer: "Computer Skills Foundation" },
    { name: "TQC+ Python Data Analyst Expert",                        issuer: "Computer Skills Foundation" },
    { name: "TQC+ Software Development Knowledge",                    issuer: "Computer Skills Foundation" },
    { name: "TQC+ Machine Learning, Python 3",                        issuer: "Computer Skills Foundation" },
    { name: "TQC+ Web Data Extraction and Analysis, Python 3",        issuer: "Computer Skills Foundation" },
    { name: "TQC+ Programming Language, Python 3",                    issuer: "Computer Skills Foundation" },
  ],
  [
    { name: "Senior Securities Specialist",                           issuer: "Taiwan Securities Association" },
    { name: "Securities Specialist",                                  issuer: "Taiwan Securities Association" },
    { name: "Investment-linked Insurance Agent",                      issuer: "Taiwan Insurance Institute" },
    { name: "Foreign-currency Non-investment Insurance Agent",        issuer: "Life Insurance Association of the ROC" },
    { name: "Property Insurance Agent",                               issuer: "Non-Life Insurance Association of the ROC" },
    { name: "Life Insurance Agent",                                   issuer: "Life Insurance Association of the ROC" },
  ],
];

if (certification_text.length !== profile.certifications.length ||
    certification_text.some((items, g) => items.length !== profile.certifications[g].items.length)) {
  throw new Error(
    "profile.en.ts: certification_text must have the same groups and item counts as profile.certifications; " +
    "add the English name/issuer for every certificate in the same order.",
  );
}

export const profile_en: typeof profile = {
  ...profile,
  tagline: "I start from users' pain points, connect data scattered across systems, and turn it into automated services the team relies on every day and can hand over with confidence.",
  intro: [
    "Hi, I'm Peter, a data engineer who loves working with data. I built the operations data infrastructure and, on top of it, risk-control reconciliation and operations accounting automation.",
    "I look at a request from the user's side and check that it is complete before deciding how much architecture it deserves. What I deliver is not a one-off script but a service with validation, scheduling and records, so non-technical colleagues can run it themselves with confidence.",
    "I believe going far means growing with the team, so I enjoy sharing what I learn and work alongside decision-makers to propose improvements grounded in evidence. Next, I want to keep deepening my work in data engineering and AI and build smarter, friendlier systems. (Every case study includes real screen recordings and explanations.)",
  ],

  capabilities: [
    { name: "0-to-1 Engineering",         desc: "Builds a complete pipeline from a data-source inventory when no system exists yet." },
    { name: "Reverse Engineering",        desc: "When there is no official API or documentation, analyzes closed platforms' interfaces and builds data extraction modules." },
    { name: "Data Engineering",           desc: "ETL, hourly incremental sync, cross-platform data cleaning and metric alignment." },
    { name: "System Integration",         desc: "Integrates heterogeneous platforms such as CRM, PSP and CPS into one unified data view." },
    { name: "Automation Engineering",     desc: "Turns manual reconciliation and manual checks into scheduled jobs and one-click tools." },
    { name: "System Architecture",        desc: "Layered design across entry, orchestration, processing and governance, with input validation and auditing." },
    { name: "Bottom-up Engineering",      desc: "Understands how the lower layers work first, then builds abstractions on top." },
    { name: "Product-oriented Thinking",  desc: "Starts from business pain points, finds scenarios that generalize, and turns them into tools others can use directly." },
  ],

  philosophy: [
    { title: "Deliver services, not scripts",
      body:  "A reverse-engineered solution is only a starting point. A workaround that merely runs piles up technical debt, so I add validation, scheduling and audit records until it becomes a service that runs long-term and that others can take over." },
    { title: "Missing resources are no reason to stop",
      body:  "No DB access and no official API is the norm, not the exception. I first open a data path through reverse engineering so the business can move; once proper resources arrive, the system is already a proven MVP." },
    { title: "Understand systems from the bottom up",
      body:  "I learn how the lower layers work before abstracting upward. Problems outside the framework can only be traced by someone who understands what lies underneath." },
    { title: "Context first, architecture second",
      body:  "Before work starts, I align on business context and expected metrics. Requests with clear context get architectural investment; requests without it get the lowest-cost handling." },
  ],

  approach: [
    { step: "Align",       title: "Align on context",         body: "Confirm business context, decision rules and expected metrics with the requester.", example: "Credit card anomaly detection: every detection rule was aligned with operations first." },
    { step: "Generalize",  title: "Find the common pattern",  body: "Distill shared workflows from scattered requests instead of handling each case separately.", example: "Account operation automation engine: one shared workflow covering about 80% of business scenarios." },
    { step: "Unblock",     title: "Open the data path",       body: "When access or APIs are missing, build data channels through reverse engineering.", },
    { step: "Systematize", title: "Systematize",              body: "Add input validation, scheduling, normalization and auditing so the solution runs reliably and repeatably.", example: "Hourly incremental sync and an hourly reconciliation pipeline." },
    { step: "Deliver",     title: "Deliver and quantify",     body: "Package it as a tool non-technical colleagues can use directly, and report the impact in numbers.", example: "LarkSheet batch query engine; about 4,770 hours saved in total (estimate)." },
  ],

  career_label: "Data experience",

  experience: profile.experience.map((job, i) => ({ ...job, ...experience_text[i] })),

  education: {
    period: profile.education.period,
    school: "Ming Chuan University, B.S. in Biotechnology",
    note:   "National Yang Ming Chiao Tung University, Institute of Food Safety and Health Risk Assessment (master's program, not completed)",
  },

  certifications: profile.certifications.map((group, g) => ({
    ...group,
    items: group.items.map((item, i) => ({ ...item, ...certification_text[g][i] })),
  })),

  life: {
    intro:     "At work, I enjoy wrestling with technology and solving hard problems; off the clock, I head for the sky and dive deep into the sea. I've taken on a skydive in Pattaya and explored the underwater world of Xiaoliuqiu, Bali, the Maldives and Fiji, meeting sea life up close. I don't settle for routine: I love adventure and trying new things, and I always look forward to finding new scenery, and a different side of myself, in new places.",
    photos:    profile.life.photos.map((photo, i) => ({ ...photo, ...life_photo_text[i] })),
    cert:      { ...profile.life.cert, label: "Dive certification" },
  },

  contact_invite: "Whether it's a collaboration or a role in data pipelines, operations automation or system integration, I'd be glad to hear from you.",
  contact_facts: {
    seeking: "Open to new opportunities, with a strong interest in Forward Deployed Engineer (FDE), Data Engineer and AI Engineer roles, and other engineering roles that combine hands-on building with problem-solving.",
    reply:   "Usually within a day",
    hours:   "Any time",
  },
  talk_topics: [
    { title: "Data pipelines from 0 to 1",               body: "From a data-source inventory and sync schedules to a unified data view: building a usable foundation first when resources are limited." },
    { title: "Turning manual work into automated services", body: "How manual reconciliation and checks become scheduled jobs and one-click tools, with the hours saved measured in numbers." },
    { title: "Integrating heterogeneous platforms",       body: "Aligning fields and metrics across many systems with inconsistent formats and missing documentation, so the data can be viewed together." },
    { title: "Tools non-technical colleagues can use",    body: "Using familiar interfaces such as spreadsheets as the entry point, with input validation and records, so operations can run the tools themselves." },
  ],
};
