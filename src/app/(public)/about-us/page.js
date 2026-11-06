
import AboutFAQ from "./components/AboutFAQ";
import AboutHero from "./components/AboutHero";
import AboutStorySection from "./components/AboutStorySection";
import WhyChooseMasterMind from "./components/WhyChooseMasterMind";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || ""
).replace(/\/$/, "");

const PAGE_PATH = "/about-us";

const PAGE_TITLE =
  "About MasterMind Academy | Kerala PSC, SSC & RRB Coaching";

const PAGE_DESCRIPTION =
  "Explore MasterMind Academy's Kerala PSC, SSC and RRB exam coaching, structured preparation, study materials, mock tests and personalised learning support.";

const PAGE_URL = SITE_URL
  ? `${SITE_URL}${PAGE_PATH}`
  : PAGE_PATH;

// Set this to an image that actually exists in /public.
const OG_IMAGE_PATH = "/og-about.jpg";

/* =========================================
   SEO METADATA
========================================= */

export const metadata = {
  title: {
    absolute: PAGE_TITLE,
  },

  description: PAGE_DESCRIPTION,

  alternates: {
    canonical: PAGE_PATH,
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
    type: "website",
    locale: "en_IN",
    siteName: "MasterMind Academy",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    ...(SITE_URL ? { url: PAGE_URL } : {}),
    ...(SITE_URL
      ? {
          images: [
            {
              url: `${SITE_URL}${OG_IMAGE_PATH}`,
              width: 1200,
              height: 630,
              alt: "About MasterMind Academy",
            },
          ],
        }
      : {}),
  },

  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    ...(SITE_URL
      ? {
          images: [
            `${SITE_URL}${OG_IMAGE_PATH}`,
          ],
        }
      : {}),
  },
};

/* =========================================
   SCHEMA.ORG STRUCTURED DATA
========================================= */

function getStructuredData() {
  if (!SITE_URL) return null;

  const organizationId =
    `${SITE_URL}/#organization`;

  return {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": organizationId,
        name: "MasterMind Academy",
        url: SITE_URL,
        description:
          "MasterMind Academy offers exam preparation and coaching resources for Kerala PSC, SSC and RRB examinations.",
      },

      {
        "@type": "AboutPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "en-IN",
        about: {
          "@id": organizationId,
        },
        mainEntity: {
          "@id": organizationId,
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
            name: "About Us",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

/* =========================================
   ABOUT US PAGE
========================================= */

export default function AboutUsPage() {
  const structuredData = getStructuredData();

  return (
    <main id="main-content">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              structuredData
            ).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <AboutHero />

      <AboutStorySection />

      <WhyChooseMasterMind />

      <AboutFAQ />
    </main>
  );
}
