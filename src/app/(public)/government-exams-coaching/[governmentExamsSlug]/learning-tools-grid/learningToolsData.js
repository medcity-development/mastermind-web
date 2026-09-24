import {
  Bell,
  BookOpen,
  Bot,
  ClipboardCheck,
  FileText,
  LibraryBig,
  Megaphone,
  Newspaper,
  NotepadText,
  Target,
  Trophy,
} from "lucide-react";

/* =========================================================
   NORMALIZE API TITLE

   Example:

   "Topicwise statement type qns"
       ↓
   "topicwisestatementtypeqns"
========================================================= */

function normalizeToolTitle(
  value = ""
) {
  return String(
    value ?? ""
  )
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(
      /[^a-z0-9]+/g,
      ""
    );
}

/* =========================================================
   TOOL DEFINITIONS

   route = REAL Next.js folder name
========================================================= */

const TOOL_DEFINITIONS = {
  currentAffairs: {
    subtitle:
      "Daily updates",

    route:
      "current-affairs",

    icon:
      Newspaper,

    iconColor:
      "text-[#ec2384]",

    iconBg:
      "bg-[#ffe1f1]",
  },

  mockTests: {
    subtitle:
      "Practice now",

    route:
      "mock-tests",

    icon:
      ClipboardCheck,

    iconColor:
      "text-[#087bea]",

    iconBg:
      "bg-[#dcefff]",
  },

  previousQuestions: {
    subtitle:
      "Question bank",

    route:
      "previous-questions",

    icon:
      NotepadText,

    iconColor:
      "text-[#0dac77]",

    iconBg:
      "bg-[#d9f7eb]",
  },

  examSyllabus: {
    subtitle:
      "Detailed syllabus",

    route:
      "exam-syllabus",

    icon:
      BookOpen,

    iconColor:
      "text-[#6131e8]",

    iconBg:
      "bg-[#ebe4ff]",
  },

  scertTests: {
    subtitle:
      "Textbook based",

    route:
      "scert-tests",

    icon:
      LibraryBig,

    iconColor:
      "text-[#f26522]",

    iconBg:
      "bg-[#fff0df]",
  },

  notifications: {
    subtitle:
      "Notifications",

    route:
      "notifications",

    icon:
      Bell,

    iconColor:
      "text-[#1688ed]",

    iconBg:
      "bg-[#dff1ff]",
  },

  pscBulletin: {
    subtitle:
      "Official updates",

    route:
      "psc-bulletin-ca",

    icon:
      Megaphone,

    iconColor:
      "text-[#ef2786]",

    iconBg:
      "bg-[#ffe2f1]",
  },

  topicWiseExams: {
    subtitle:
      "Practice topic-wise",

    route:
      "topic-wise-exams",

    icon:
      Target,

    iconColor:
      "text-[#f3195d]",

    iconBg:
      "bg-[#ffe3eb]",
  },

  statementTypeExams: {
    subtitle:
      "Statement practice",

    route:
      "statement-type-exams",

    icon:
      NotepadText,

    iconColor:
      "text-[#5933eb]",

    iconBg:
      "bg-[#e9e4ff]",
  },

  studyMaterials: {
    subtitle:
      "Study materials",

    route:
      "study-materials",

    icon:
      FileText,

    iconColor:
      "text-[#ed245b]",

    iconBg:
      "bg-[#ffe2ea]",
  },

  currentAffairsQuiz: {
    subtitle:
      "Test your knowledge",

    route:
      "current-affairs-quiz",

    icon:
      Trophy,

    iconColor:
      "text-[#f4a000]",

    iconBg:
      "bg-[#fff0d7]",
  },

  aiVideos: {
    subtitle:
      "Learn with AI",

    route:
      "ai-videos",

    icon:
      Bot,

    iconColor:
      "text-[#147be8]",

    iconBg:
      "bg-[#dcefff]",
  },
};

/* =========================================================
   API TITLE -> TOOL DEFINITION

   LEFT:
   normalized API title

   RIGHT:
   definition key
========================================================= */

const TOOL_ALIASES = {
  /* CURRENT AFFAIRS */

  currentaffairs:
    "currentAffairs",

  dailycurrentaffairs:
    "currentAffairs",

  /* MOCK TESTS */

  mocktests:
    "mockTests",

  mocktest:
    "mockTests",

  /* PREVIOUS QUESTIONS */

  previousquestions:
    "previousQuestions",

  previousyearquestions:
    "previousQuestions",

  pyq:
    "previousQuestions",

  /* EXAM SYLLABUS */

  examsyllabus:
    "examSyllabus",

  syllabus:
    "examSyllabus",

  /* SCERT */

  scerttests:
    "scertTests",

  scerttest:
    "scertTests",

  /* NOTIFICATIONS */

  pscalerts:
    "notifications",

  rrbalerts:
    "notifications",

  sscalerts:
    "notifications",

  notifications:
    "notifications",

  notification:
    "notifications",

  pscnotifications:
    "notifications",

  rrbnotifications:
    "notifications",

  sscnotifications:
    "notifications",

  /* PSC BULLETIN */

  pscbulletin:
    "pscBulletin",

  pscbulletinca:
    "pscBulletin",

  pscbulletincurrentaffairs:
    "pscBulletin",

  /* =====================================================
     TOPIC / SUB TOPIC EXAMS

     API examples:
     Topic/Sub Topic wise exams
     Topic / Subtopic Exams
     Topic Wise Exams
  ===================================================== */

  topicsubtopicexams:
    "topicWiseExams",

  topicsubtopicwiseexams:
    "topicWiseExams",

  topicsubtopicwiseexam:
    "topicWiseExams",

  topicsubtopicwisequestions:
    "topicWiseExams",

  topicsubtopicwiseqns:
    "topicWiseExams",

  topicwisesubtopicexams:
    "topicWiseExams",

  topicwiseexams:
    "topicWiseExams",

  topicwiseexam:
    "topicWiseExams",

  /* =====================================================
     STATEMENT TYPE EXAMS

     THIS WAS YOUR MISSING PART.

     Backend currently appears to return:

     "Topicwise statement type qns"

     normalized:
     topicwisestatementtypeqns
  ===================================================== */

  topicwisestatementtype:
    "statementTypeExams",

  topicwisestatementtypeexam:
    "statementTypeExams",

  topicwisestatementtypeexams:
    "statementTypeExams",

  topicwisestatementtypeqns:
    "statementTypeExams",

  topicwisestatementtypequestions:
    "statementTypeExams",

  topicstatementtypeqns:
    "statementTypeExams",

  topicstatementtypequestions:
    "statementTypeExams",

  statementtype:
    "statementTypeExams",

  statementtypeexam:
    "statementTypeExams",

  statementtypeexams:
    "statementTypeExams",

  statementtypeqns:
    "statementTypeExams",

  statementtypequestions:
    "statementTypeExams",

  /* STUDY MATERIALS */

  pdf:
    "studyMaterials",

  studymaterials:
    "studyMaterials",

  studymaterial:
    "studyMaterials",

  /* CURRENT AFFAIRS QUIZ */

  monthlyquiz:
    "currentAffairsQuiz",

  currentaffairsquiz:
    "currentAffairsQuiz",

  /* AI VIDEOS */

  aivideos:
    "aiVideos",

  aivideo:
    "aiVideos",
};

/* =========================================================
   PUBLIC RESOLVER
========================================================= */

export function getLearningToolMeta(
  title
) {
  const normalizedTitle =
    normalizeToolTitle(
      title
    );

  const definitionKey =
    TOOL_ALIASES[
      normalizedTitle
    ];

  if (!definitionKey) {
    console.warn(
      "Unknown learning tool:",
      {
        title,
        normalizedTitle,
      }
    );

    return null;
  }

  return (
    TOOL_DEFINITIONS[
      definitionKey
    ] || null
  );
}

/* =========================================================
   FALLBACK
========================================================= */

export const DEFAULT_LEARNING_TOOL_META = {
  subtitle:
    "Explore resources",

  route: null,

  icon:
    FileText,

  iconColor:
    "text-[#017cc0]",

  iconBg:
    "bg-[#e3f5ff]",
};