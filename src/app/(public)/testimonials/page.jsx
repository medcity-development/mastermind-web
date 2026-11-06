
import TestimonialCardWrapper from "./components/TestimonialCardWrapper";
import TestimonialFAQ from "./components/TestimonialFAQ";
import TestimonialsHero from "./components/TestimonialsHero";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.yourdomain.com";

const PAGE_PATH = "/testimonials";

const PAGE_URL = new URL(
  PAGE_PATH,
  SITE_URL
).toString();

const PAGE_TITLE =
  "Student Reviews & Success Stories | MasterMind Academy";

const PAGE_DESCRIPTION =
  "Explore MasterMind Academy student reviews, testimonials and success stories. Discover student experiences with Kerala PSC, SSC and RRB exam coaching and preparation.";

export const metadata = {
  title: PAGE_TITLE,

  description: PAGE_DESCRIPTION,

  keywords: [
    "MasterMind Academy reviews",
    "MasterMind Academy testimonials",
    "MasterMind Academy student reviews",
    "Kerala PSC coaching reviews",
    "Kerala PSC student testimonials",
    "PSC coaching success stories",
    "SSC coaching reviews",
    "RRB coaching reviews",
    "competitive exam coaching reviews",
    "PSC exam preparation experiences",
    "MasterMind Academy student success stories",
  ],

  alternates: {
    canonical: PAGE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: "MasterMind Academy",
    type: "website",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },

  category: "education",
};

/* ==========================================
   STRUCTURED DATA
========================================== */

function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "en-IN",
        isPartOf: {
          "@type": "WebSite",
          name: "MasterMind Academy",
          url: SITE_URL,
        },
        breadcrumb: {
          "@id": `${PAGE_URL}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Student Testimonials",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

/* ==========================================
   TESTIMONIALS PAGE
========================================== */

export default function TestimonialsPage() {
  const structuredData = getStructuredData();

  return (
    <main
      id="main-content"
      aria-label="MasterMind Academy Student Testimonials"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      <TestimonialsHero />

      <section
        aria-label="Student Reviews and Success Stories"
      >
        <TestimonialCardWrapper />
      </section>

      <section
        aria-label="Frequently Asked Questions About MasterMind Academy"
      >
        <TestimonialFAQ />
      </section>
    </main>
  );
}
