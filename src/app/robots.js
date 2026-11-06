
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || ""
).replace(/\/$/, "");

export default function robots() {
  const rules = {
    userAgent: "*",
    allow: "/",
    disallow: [
      "/api/",
      "/dashboard/",
      "/login",
      "/profile/",
      "/settings/",
      "/checkout/",
      "/payment/",
    ],
  };

  return {
    rules,
    ...(SITE_URL
      ? {
          sitemap: `${SITE_URL}/sitemap.xml`,
          host: SITE_URL,
        }
      : {}),
  };
}
