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
    roles: ["Software Developer", "Platform Owner"],
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
      "ASP.NET Core",
      "EF Core",
      "React",
      "TypeScript",
      "MySQL",
      "Redis",
      "Lightspeed R-Series API",
      "AWS",
      "Playwright",
    ],
    description:
      "Mission-critical rental logistics serving Edmonton vendors and " +
      "hospitals. Designed and implemented full Scapher platform, including " +
      "overdue legacy rental detection while shipping automation, " +
      "reliability tooling, and live inventory views.",
    highlights: [
      "Designed overdue detection that recovers tens of thousands of " +
        "dollars annually.",
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
      "C#",
      "React Native",
      "Expo",
      "PostgreSQL",
      "Redis",
      "Render.com",
    ],
    description:
      "Led architecture and most of the codebase for an " +
      "internal scouting/operations platform that digitized the agency's " +
      "workflows and transitioned cleanly to a partner firm.",
    highlights: [
      "Conducted a performance overhaul delivering 21% overall speedups and " +
        "5× faster hot endpoints while halving infrastructure spend.",
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
    roles: ["Software Developer Consultant"],
    period: "May 2023 — Sept 2023",
    url: "https://berryhomes.ca",
    usedBy: [],
    teamSize: "2 Software Developers + Company Representative",
    status:
      "Job completed; Dashboard and automation continues to run internally " +
      "to this day",
    customer: {
      name: "Berry Homes",
      url: "https://berryhomes.ca",
    },
    stack: ["Go", "JavaScript"],
    description:
      "Developed live dashboard along with lightweight automation, QA " +
      "tooling, and report generation.",
    highlights: [
      "Automated content updates and pricing digests that previously " +
        "consumed hours of manual spreadsheet work each week.",
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
      "0-dependency service for getting high quality album art from the " +
      "Apple Music API.",
    heroImage: "albumart-digital",
    heroImageSize: {
      height: 600,
      width: 533,
    },
  },
];
