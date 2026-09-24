/** @type {import("next").NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "psc.technocitysolutions.com",
        pathname: "/public/images/**",
      },
      {
        protocol: "https",
        hostname: "psc.technocitysolutions.com",
        pathname: "/public/images/**",
      },
    ],
  },
};

export default nextConfig;