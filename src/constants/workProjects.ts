export type WorkQuote = {
  text: string;
  name: string;
  title?: string;
  url?: string;
};

export type WorkCustomer = {
  name: string;
  url: string;
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
    | "med-supplies"
    | "scoutliner"
    | "berry-homes"
    | "albumart-digital"
    | "unicode-identifiers";
  heroImageSize?: HeroImageSize;
  teamSize?: string;
  status?: string;
  customer?: WorkCustomer;
  highlights?: string[];
  quotes?: WorkQuote[];
};

export const WORK_PROJECTS: WorkProject[] = [
  {
    title: "Scapher",
    roles: ["Software Developer", "Technical Owner"],
    period: "Nov 2024 — Present",
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
    teamSize: "2 (me and 1 Senior Software Developer)",
    status: "Actively in production",
    customer: {
      name: "Vine Media Inc.",
      url: "https://vineq.com",
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
      "Technical owner for a mission-critical rental + inventory platform " +
      "with Lightspeed R-Series integration supporting real-time, " +
      "location-based availability and operational workflows. Implemented " +
      "idempotent workflows and correctness guards to keep rental state " +
      "consistent with POS-side actions.",
    highlights: [
      "Designed near-real-time ingestion and reconciliation (streaming sync, " +
        "backfills, consistency checks) with a 2-minute worst-case " +
        "propagation SLA.",
      "Built a multi-tenant worker system with strict timeouts, " +
        "retries/backoff, and an ops dashboard to harden reliability under " +
        "third-party failures.",
      "Authored a typed R-Series client + distributed Redis token-bucket " +
        "limiter to stabilize concurrency and sustain 7+ months incident-" +
        "free operation.",
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
    customer: {
      name: "ATG Sports",
      url: "https://www.atgsportsmm.com",
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
      "Led architecture and major backend + UI components for a scouting/" +
      "ops platform that digitized the agency's workflows and transitioned " +
      "cleanly to a partner firm.",
    highlights: [
      "Drove a performance initiative: 21% overall improvement and 5× " +
        "faster critical endpoints by reshaping query patterns, adding " +
        "finer-grained caching, and materializing search-optimized views " +
        "(OpenSearch + Redis) with controlled staleness.",
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
    title: "Berry Homes Live Status Page",
    roles: ["Software Developer - Go"],
    period: "May 2023 — Sept 2023",
    url: "https://berryhomes.ca",
    usedBy: [],
    teamSize: "2 Software Developers + Company Representative",
    status: "Job completed.",
    customer: {
      name: "Berry Homes",
      url: "https://berryhomes.ca",
    },
    stack: ["Go"],
    description:
      "Built a Go web service that ingests company data and powers an " +
      "internal dashboard with visualizations and metrics.",
    highlights: [
      "Dashboard remains in use internally.",
    ],
    heroImage: "berry-homes",
    heroImageSize: {
      height: 600,
      width: 533,
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
      height: 600,
      width: 533,
    },
  },
];
