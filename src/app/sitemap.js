
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || ""
).replace(/\/$/, "");

export default function sitemap() {
  if (!SITE_URL) {
    return [];
  }

  const now = new Date();

  const pages = [
    {
      path: "/",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      path: "/about-us",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/blogs",
      changeFrequency: "daily",
      priority: 0.9,
    },
     {
      path: "/testimonials",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      path: "/contact",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      path: "/government-exams-coaching/kerala-psc",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      path: "/government-exams-coaching/rrb-ssc",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      path: "/government-exams-coaching/kerala-psc/current-affairs",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      path: "/government-exams-coaching/kerala-psc/previous-questions",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/government-exams-coaching/kerala-psc/mock-tests",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/government-exams-coaching/rrb-ssc/mock-tests",
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return pages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    // Only add lastModified when the actual update date is known.
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
