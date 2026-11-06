
import ContactPage from "./components/ContactPage";

/* =========================================
   SEO CONFIGURATION
========================================= */

const SITE_NAME = "MasterMind Academy";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || ""
).replace(/\/$/, "");

// Update if your actual route is different.
const PAGE_PATH = "/contact-us";

const PAGE_URL = SITE_URL
  ? `${SITE_URL}${PAGE_PATH}`
  : PAGE_PATH;

const PAGE_TITLE =
  "Contact MasterMind Academy | Kerala PSC, SSC & RRB Coaching";

const PAGE_DESCRIPTION =
  "Contact MasterMind Academy for Kerala PSC, SSC and RRB coaching enquiries, admissions, mock tests, study materials and exam preparation support.";

// Use an image that exists in your public folder.
const OG_IMAGE_PATH = "/og-contact.jpg";

/* =========================================
   NEXT.JS SEO METADATA
========================================= */

export const metadata = {
  title: {
    absolute: PAGE_TITLE,
  },

  description: PAGE_DESCRIPTION,

  applicationName: SITE_NAME,

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
    siteName: SITE_NAME,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    ...(SITE_URL
      ? {
          url: PAGE_URL,
          images: [
            {
              url: `${SITE_URL}${OG_IMAGE_PATH}`,
              width: 1200,
              height: 630,
              alt: "Contact MasterMind Academy",
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
   CONTACT PAGE STRUCTURED DATA
========================================= */

function getContactPageSchema() {
  if (!SITE_URL) return null;

  const organizationId =
    `${SITE_URL}/#organization`;

  const websiteId =
    `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "en-IN",
        isPartOf: {
          "@id": websiteId,
        },
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
            name: "Contact Us",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

/* =========================================
   CONTACT PAGE
========================================= */

export default function Page() {
  const structuredData = getContactPageSchema();

  return (
    <>
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

      <ContactPage />
    </>
  );
}
