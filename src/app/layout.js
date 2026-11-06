
import "./globals.css";

import { Poppins } from "next/font/google";

import AOSProvider from "@/components/AOSProvider";
import FloatingWhatsApp from "@/components/floating-whatsapp-ico/FloatingWhatsApp";

/* =========================================
   FONT CONFIGURATION
========================================= */

const poppins = Poppins({
  subsets: ["latin"],

  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
  ],

  variable: "--font-poppins",

  display: "swap",
});

/* =========================================
   WEBSITE CONFIGURATION
========================================= */

const SITE_URL = "https://mastermindacademy.in";

const SITE_NAME = "MasterMind Academy";

const SITE_TITLE =
  "MasterMind Academy | Kerala PSC, SSC & RRB Coaching";

const SITE_DESCRIPTION =
  "Prepare for Kerala PSC, SSC and RRB competitive exams with MasterMind Academy. Explore coaching programs, mock tests, previous question papers, current affairs and study materials.";

// Replace with an image that exists in /public.
const OG_IMAGE = "/og-image.jpg";

/* =========================================
   GLOBAL SEO METADATA
========================================= */

export const metadata = {
  metadataBase: new URL(SITE_URL),

  applicationName: SITE_NAME,

  title: {
    default: SITE_TITLE,
    template: "%s | MasterMind Academy",
  },

  description: SITE_DESCRIPTION,

  /* ---------------------------------------
     SEARCH ENGINE INDEXING
  --------------------------------------- */

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

  /* ---------------------------------------
     OPEN GRAPH
  --------------------------------------- */

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,

    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "MasterMind Academy - Kerala PSC, SSC and RRB Coaching",
      },
    ],
  },

  /* ---------------------------------------
     TWITTER / X
  --------------------------------------- */

  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },

  /* ---------------------------------------
     SEARCH ENGINE VERIFICATION
  --------------------------------------- */

  // Uncomment after obtaining a verification token.
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_TOKEN",
  // },
};

/* =========================================
   ORGANIZATION STRUCTURED DATA
========================================= */

const organizationSchema = {
  "@context": "https://schema.org",

  "@type": "EducationalOrganization",

  "@id": `${SITE_URL}/#organization`,

  name: SITE_NAME,

  url: SITE_URL,

  description: SITE_DESCRIPTION,
};

/* =========================================
   WEBSITE STRUCTURED DATA
========================================= */

const websiteSchema = {
  "@context": "https://schema.org",

  "@type": "WebSite",

  "@id": `${SITE_URL}/#website`,

  name: SITE_NAME,

  url: SITE_URL,

  inLanguage: "en-IN",

  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
};

/* =========================================
   ROOT LAYOUT
========================================= */

export default function RootLayout({
  children,
}) {
  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      organizationSchema,
      websiteSchema,
    ].map(
      ({
        "@context": context,
        ...schema
      }) => schema
    ),
  };

  return (
    <html
      lang="en"
      className={poppins.variable}
    >
      <body
        className="
          font-sans
          antialiased
        "
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              structuredData
            ).replace(/</g, "\\u003c"),
          }}
        />

        <AOSProvider>
          {children}
        </AOSProvider>

<FloatingWhatsApp />

      </body>
    </html>
  );
}
