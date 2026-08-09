export type WorkQuote = {
  text: string;
  name: string;
  title?: string;
  url?: string;
};

export type WorkCustomer = {
  name: string;
  url: string;
  type: "contract" | "job";
};

export type HeroImageSize = {
  width: number;
  height: number;
};

export type WorkUsage = {
  name: string;
  url: string;
};

export type WorkProject = {
  title: string;
  roles: string[];
  period: string;
  stack: string[];
  description: string;
  url?: string;
  usedBy?: WorkUsage[];
  heroImage:
    | "riva"
    | "med-supplies"
    | "scoutliner"
    | "berry-homes"
    | "albumart-digital"
    | "unicode-identifiers";
  heroImageSize?: HeroImageSize;
  teamSize?: string;
  status?: string;
  for?: WorkCustomer;
  highlights?: string[];
  quotes?: WorkQuote[];
};

export const WORK_PROJECTS: WorkProject[] = [
  {
    title: "Riva",
    roles: ["Senior Backend Developer"],
    period: "March 2026 — Present",
    url: "https://rivaengine.com/",
    usedBy: [
      {
        name: "MassMutual",
        url: "https://www.massmutual.com/",
      },
      {
        name: "Pernod Ricard",
        url: "https://www.pernod-ricard.com",
      },
      {
        name: "Houlihan Lokey",
        url: "https://hl.com/",
      },
      {
        name: "Mizuho Financial Group",
        url: "https://www.mizuhogroup.com/",
      },
    ],
    heroImage: "riva",
    heroImageSize: {
      width: 500,
      height: 283,
    },
    teamSize: "6",
    status: "In production, actively used by 200+ organizations",
    for: {
      name: "Riva International Inc.",
      url: "https://rivaengine.com/",
      type: "job",
    },
    description:
      "SaaS and On-Premise software which syncs data between a CRM and " +
      "Email/Calendar/Meeting providers trusted by 200+ organizations " +
      "worldwide.",
    highlights: [
      "Worked on the core product, evolving and maintaining " +
        "mission-critical code",
      "Acted as feature-lead on projects, driving the end-to-end delivery " +
        "of project features, owning design and implementation concerns",
      "Worked directly with high-profile customers in order to deliver " +
        "features and customizations tailored to their business needs",
    ],
    stack: [
      "C#",
      ".NET 8",
      ".NET Framework 4.8",
      "AWS",
      "MongoDB",
      "Redis",
      "Exchange Web Services (EWS) API",
      "Microsoft Graph API",
      "Salesforce API",
      "Microsoft Dynamics API",
    ],
  },
  {
    title: "Scapher",
    roles: ["Software Developer", "Technical Owner"],
    period: "Nov 2024 — March 2026",
    url: "https://medsupplies.co",
    usedBy: [
      {
        name: "Med Supplies",
        url: "https://medsupplies.co",
      },
      {
        name: "Fit Essentials",
        url: "https://fitessentials.ca",
      },
      {
        name: "Medical Equipment Rentals Edmonton",
        url: "https://medicalequipmentrental.ca",
      },
      {
        name: "Medicine Place",
        url: "https://www.medicineplace.ca",
      },
    ],
    teamSize: "2",
    status: "In production, actively used.",
    for: {
      name: "Vine Media Inc.",
      url: "https://vineq.com",
      type: "job",
    },
    stack: [
      "Go",
      "ASP.NET Core",
      "React",
      "MySQL",
      "Redis",
      "Lightspeed R-Series API",
    ],
    description:
      "Rental + inventory management platform with Lightspeed R-Series " +
      "integration supporting real-time location-based availability and " +
      "operational workflows.",
    highlights: [
      "Designed ingestion and reconciliation for Lightspeed data (streaming " +
        "sync, backfills, consistency checks)",
      "Built a multi-tenant worker system with strict timeouts, " +
        "retries/backoff, and ops dashboard",
      "Authored a typed Lightspeed R-Series API client + distributed Redis " +
        "token-bucket limiter to stabilize concurrency",
    ],
    heroImage: "med-supplies",
    heroImageSize: {
      width: 500,
      height: 360,
    },
    quotes: [],
  },
  {
    title: "Scoutliner",
    roles: ["Lead Software Developer"],
    period: "Jan 2025 — Nov 2025",
    url: "https://www.atgsportsmm.com",
    teamSize: "5-person engineering pod + founder",
    status: "Handed off to a long-term partner firm",
    for: {
      name: "ATG Sports",
      url: "https://www.atgsportsmm.com",
      type: "job",
    },
    stack: [
      "ASP.NET Core",
      "React",
      "React Native",
      "PostgreSQL",
      "Redis",
      "OpenSearch",
      "Render.com",
    ],
    description:
      "A scouting/ops platform that digitized the agency's workflows and " +
      "transitioned cleanly to a partner firm.",
    highlights: [
      "Led project, including designing architecture and major backend + UI " +
        "flows",
      "Drove performance initiative: 21% overall improvement and 5x " +
        "faster critical endpoints by reshaping query patterns, adding " +
        "finer-grained caching, and materializing search-optimized views " +
        "with controlled staleness.",
      "Built ingestion pipelines and operational tooling while partnering " +
        "with the founder/PM on roadmap tradeoffs and delivery.",
    ],
    heroImage: "scoutliner",
    heroImageSize: {
      width: 507,
      height: 360,
    },
    quotes: [
      {
        text:
          "Beyond his technical expertise, Ayman was an excellent " +
          "team player—reliable, communicative, and proactive in sharing " +
          "knowledge with others.",
        name: "Nedal Huoseh",
        title: "Founder, ATG Sports",
        url: "https://atgsportsmm.com/",
      },
    ],
  },
  {
    title: "Berry Homes Internal Live Status Page",
    roles: ["Software Developer - Go"],
    period: "May 2023 — Sept 2023",
    url: "https://berryhomes.ca",
    usedBy: [],
    teamSize: "2 Software Developers + Company Representative",
    status: "Job completed.",
    for: {
      name: "Berry Homes",
      url: "https://berryhomes.ca",
      type: "contract",
    },
    stack: ["Go"],
    description:
      "Built a Go web service that ingests company data and powers an " +
      "internal dashboard with visualizations and metrics.",
    heroImage: "berry-homes",
    heroImageSize: {
      height: 196,
      width: 500,
    },
  },
  {
    title: "Albumart.digital",
    roles: ["Creator"],
    period: "Aug 2022 — Current",
    url: "https://albumart.digital",
    status: "Stable",
    stack: ["Go"],
    description:
      "Dependency-free Go web service integrating directly with the Apple " +
      "Music API for high-resolution album art.",
    highlights: ["Source code on GitHub: github.com/aeldidi/albumart.digital."],
    heroImage: "albumart-digital",
    heroImageSize: {
      height: 222,
      width: 496,
    },
  },
];
