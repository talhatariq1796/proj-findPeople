export const includeExcludeFieldConfigs = [
  {
    key: "location",
    label: "Location",
    description:
      "City, state, or country. For best results use alpha-2 codes (US, IN, FR).",
    placeholders: {
      include: "US, IN, New York",
      exclude: "Los Angeles",
    },
    examples: {
      include: 'Example include: "US, IN, New York"',
      exclude: 'Example exclude: "Los Angeles"',
    },
    payloadKeys: ["location"],
  },
  {
    key: "currentJobTitle",
    label: "Current Job Title",
    description: "Open text search for a person's current job title.",
    placeholders: {
      include: "Software Engineer, Manager",
      exclude: "Intern",
    },
    examples: {
      include: 'Example include: "Software Engineer, Manager"',
      exclude: 'Example exclude: "Intern"',
    },
    payloadKeys: ["currentJobTitle"],
  },
  {
    key: "industry",
    label: "Industry / Current Company",
    description:
      "Matches industry keywords and the company where the person currently works.",
    placeholders: {
      include: "Google, Microsoft",
      exclude: "Facebook",
    },
    examples: {
      include: 'Example include: "Google, Microsoft"',
      exclude: 'Example exclude: "Facebook"',
    },
    payloadKeys: ["industry", "currentCompanyName"],
  },
  {
    key: "keyword",
    label: "Keyword",
    description:
      "Search across the entire profile (titles, descriptions, skills, education).",
    placeholders: {
      include: "CEO, Co-Founder",
      exclude: "Sales",
    },
    examples: {
      include: 'Example include: "CEO, Co-Founder"',
      exclude: 'Example exclude: "Sales"',
    },
    payloadKeys: ["keyword"],
  },
];

export const headcountFieldConfig = {
  key: "headcount",
  label: "Headcount (Staff Size)",
  description: "Filter by company size using more-than and less-than operators.",
  placeholders: {
    moreThan: "10",
    lessThanOrEqual: "20",
  },
  examples: {
    moreThan: "Example: enter 10 for headcount greater than 10.",
    lessThanOrEqual: "Example: enter 20 for headcount up to 20.",
  },
};

