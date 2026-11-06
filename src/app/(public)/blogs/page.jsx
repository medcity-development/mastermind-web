
import BlogPage from "./components/BlogPage";

/* =========================================
   SEO CONFIGURATION
========================================= */

const SITE_NAME = "Medcity";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || ""
).replace(/\/$/, "");

// Change this if your actual route is /blog.
const PAGE_PATH = "/blogs";

const PAGE_URL = SITE_URL
  ? `${SITE_URL}${PAGE_PATH}`
  : PAGE_PATH;

const PAGE_TITLE =
  "Kerala PSC Preparation Blog | Study Tips & Current Affairs";

const PAGE_DESCRIPTION =
  "Explore Kerala PSC preparation tips, current affairs, study plans, exam strategies, previous question guidance and competitive exam updates from Medcity.";

const OG_IMAGE_PATH = "/og-blog.jpg";

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
              alt: "Kerala PSC Preparation Blog - Medcity",
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
   BLOG STRUCTURED DATA
========================================= */

function getBlogSchema() {
  if (!SITE_URL) return null;

  const organizationId =
    `${SITE_URL}/#organization`;

  const websiteId =
    `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "Blog",
        "@id": `${PAGE_URL}#blog`,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: PAGE_URL,
        inLanguage: "en-IN",
        publisher: {
          "@id": organizationId,
        },
        isPartOf: {
          "@id": websiteId,
        },
      },

      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#webpage`,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: PAGE_URL,
        inLanguage: "en-IN",
        mainEntity: {
          "@id": `${PAGE_URL}#blog`,
        },
        isPartOf: {
          "@id": websiteId,
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
            name: "Blogs",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

/* =========================================
   BLOG PAGE
========================================= */

export default function BlogsPage() {
  const structuredData = getBlogSchema();

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

      <BlogPage />
    </>
  );
}
