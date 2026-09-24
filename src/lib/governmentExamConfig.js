// src/lib/governmentExamConfig.js

export const GOVERNMENT_EXAM_CONFIG = {
  "kerala-psc": {
    cid: 1,

    slug: "kerala-psc",

    name: "Kerala PSC",

    shortName: "KPSC",

    hero: {
      image:
        "/assets/kerala-psc-coaching.webp",

      eyebrow:
        "Kerala PSC Preparation",

      headingPrefix:
        "Your Dream.",

      headingHighlight:
        "Your Success!",

      descriptionItems: [
        "Mock Tests",
        "Current Affairs",
        "Previous Questions",
        "Study Materials",
      ],

      ctaText:
        "Check Notifications",

      ctaPath:
        "notifications",

      stats: [
        {
          type: "users",
          value: "100K+",
          label: "Learners",
        },

        {
          type: "book",
          value: "500+",
          label: "Study Materials",
        },

        {
          type: "calendar",
          value: "Daily",
          label: "Updates",
        },

        {
          type: "graduation",
          value: "Expert",
          label: "Guidance",
        },
      ],

      sideText: [
        "Kerala PSC",
        "Preparation",
      ],
    },
  },

  "rrb-ssc": {
    cid: 2,

    slug: "rrb-ssc",

    name: "RRB & SSC",

    shortName: "RRB & SSC",

    hero: {
      image:
        "/assets/rrb-exams-coaching.webp",

      eyebrow:
        "RRB & SSC Preparation",

      headingPrefix:
        "Crack Your",

      headingHighlight:
        "RRB & SSC Exams",

      descriptionItems: [
        "Railway Exams",
        "SSC Exams",
        "Mock Tests",
        "Previous Questions",
      ],

      ctaText:
        "Check Notifications",

      ctaPath:
        "notifications",

      stats: [
        {
          type: "users",
          value: "50K+",
          label: "Learners",
        },

        {
          type: "book",
          value: "300+",
          label: "Study Materials",
        },

        {
          type: "calendar",
          value: "Daily",
          label: "Updates",
        },

        {
          type: "graduation",
          value: "Expert",
          label: "Guidance",
        },
      ],

      sideText: [
        "RRB & SSC",
        "Preparation",
      ],
    },
  },
};

/* =========================================================
   GET CONFIG BY SLUG
========================================================= */

export function getGovernmentExamConfig(
  slug
) {
  if (!slug) {
    return null;
  }

  const normalizedSlug =
    String(slug)
      .trim()
      .toLowerCase();

  return (
    GOVERNMENT_EXAM_CONFIG[
      normalizedSlug
    ] ?? null
  );
}

/* =========================================================
   GET CONFIG BY CID
========================================================= */

export function getGovernmentExamConfigByCid(
  cid
) {
  if (
    cid === undefined ||
    cid === null ||
    cid === ""
  ) {
    return null;
  }

  return (
    Object.values(
      GOVERNMENT_EXAM_CONFIG
    ).find(
      (config) =>
        Number(
          config.cid
        ) ===
        Number(cid)
    ) ?? null
  );
}