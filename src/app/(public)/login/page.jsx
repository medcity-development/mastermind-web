
import LoginPage from "./components/LoginPage";

import {
  getPostLoginRedirectPath,
} from "@/lib/auth/postLoginRedirect";

/* =========================================
   SEO CONFIGURATION
========================================= */

const SITE_NAME = "MasterMind Academy";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || ""
).replace(/\/$/, "");

const PAGE_PATH = "/login";

const PAGE_URL = SITE_URL
  ? `${SITE_URL}${PAGE_PATH}`
  : PAGE_PATH;

const PAGE_TITLE =
  "Student Login | MasterMind Academy";

const PAGE_DESCRIPTION =
  "Log in to your MasterMind Academy student account to access Kerala PSC, SSC and RRB courses, mock tests, study materials, current affairs and exam preparation resources.";

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

  /* ---------------------------------------
     LOGIN PAGE INDEXING CONTROL
  --------------------------------------- */

  robots: {
    index: false,
    follow: true,

    googleBot: {
      index: false,
      follow: true,
      "max-image-preview": "large",
    },
  },

  /* ---------------------------------------
     OPEN GRAPH
  --------------------------------------- */

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,

    ...(SITE_URL
      ? {
          url: PAGE_URL,
        }
      : {}),
  },

  /* ---------------------------------------
     TWITTER / X
  --------------------------------------- */

  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

/* =========================================
   LOGIN PAGE
========================================= */

export default async function Page({
  searchParams,
}) {
  const query = await searchParams;

  const redirectTo =
    getPostLoginRedirectPath(
      query?.redirect
    );

  return (
    <LoginPage
      redirectTo={redirectTo}
    />
  );
}
