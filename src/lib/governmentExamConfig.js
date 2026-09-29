// src/lib/governmentExamConfig.js

export const GOVERNMENT_EXAM_CONFIG = {
  "kerala-psc": {
    cid: 1,

    slug: "kerala-psc",

    name: "Kerala PSC",

    shortName: "KPSC",

    examLevels: {
      "degree-level-exams": {
        subId: 1,
        name: "Degree Level Exams",
      },
    },

    faq: {
      eyebrow:
        "Kerala PSC FAQs",

      titlePrefix:
        "Frequently Asked",

      titleHighlight:
        "Questions",

      description:
        "Find quick answers about Kerala PSC preparation, exams and learning resources.",

      items: [
        {
          question:
            "What is the best way to prepare for Kerala PSC exams?",

          answer:
            "Start with the official Kerala PSC syllabus and build a structured study plan. Focus on SCERT topics, current affairs, previous question papers, topic-wise practice and regular mock tests to improve both accuracy and speed.",
        },

        {
          question:
            "Which Kerala PSC exams can I prepare for here?",

          answer:
            "You can prepare for major Kerala PSC exam categories including 10th Level, 12th Level, Degree Level and related exam preparation resources.",
        },

        {
          question:
            "Are mock tests and previous questions useful for Kerala PSC preparation?",

          answer:
            "Yes. Previous questions help you understand frequently tested topics and exam patterns, while mock tests help improve time management, accuracy and confidence.",
        },

        {
          question:
            "How can I stay updated with Kerala PSC notifications?",

          answer:
            "Use the Current Affairs, Notifications and related exam update sections regularly to follow important Kerala PSC updates.",
        },
      ],
    },

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

    examLevels: {},

    faq: {
      eyebrow:
        "RRB & SSC FAQs",

      titlePrefix:
        "Frequently Asked",

      titleHighlight:
        "Questions",

      description:
        "Find quick answers about RRB and SSC preparation, exams and learning resources.",

      items: [
        {
          question:
            "How should I prepare for RRB and SSC exams?",

          answer:
            "Start with the latest syllabus and exam pattern, then follow a structured plan for quantitative aptitude, reasoning, general awareness, English and subject-specific topics.",
        },

        {
          question:
            "Which RRB and SSC exams can I prepare for here?",

          answer:
            "You can explore preparation resources for available Railway Recruitment Board and Staff Selection Commission examinations listed on the platform.",
        },

        {
          question:
            "Are mock tests useful for RRB and SSC preparation?",

          answer:
            "Yes. Mock tests help improve speed, time management, accuracy and familiarity with the exam pattern.",
        },

        {
          question:
            "How can I stay updated with RRB and SSC notifications?",

          answer:
            "Use the Notifications, Current Affairs and exam update sections regularly to follow important recruitment and examination updates.",
        },
      ],
    },

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

/* =========================================================
   GET EXAM LEVEL CONFIG
========================================================= */

export function getExamLevelConfig(
  governmentExamsSlug,
  levelSlug
) {
  if (
    !governmentExamsSlug ||
    !levelSlug
  ) {
    return null;
  }

  const governmentConfig =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!governmentConfig) {
    return null;
  }

  const normalizedLevelSlug =
    String(levelSlug)
      .trim()
      .toLowerCase();

  const level =
    governmentConfig
      ?.examLevels?.[
        normalizedLevelSlug
      ];

  if (!level) {
    return null;
  }

  return {
    ...level,

    cid:
      governmentConfig.cid,

    governmentExamsSlug:
      governmentConfig.slug,

    governmentExamName:
      governmentConfig.name,
  };
}