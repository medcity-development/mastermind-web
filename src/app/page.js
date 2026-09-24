// src/app/page.js

import EnquiryForm from "@/components/enquiry-form/EnquiryForm";
import HomeFAQ from "@/components/faq/HomeFAQ";
import Hero from "@/components/hero/Hero";
import IntroSection from "@/components/intro-section/IntroSection";
import MobileAppWrapper from "@/components/mobile-app/MobileAppWrapper";
import PopularCourses from "@/components/popular-courses-section/PopularCourses";
import Testimonials from "@/components/testimonials/Testimonials";
import Topbar from "@/components/TopMarquee.jsx/Topbar";
import WhyChooseUs from "@/components/why-choose-us/WhyChooseUs";

export const metadata = {
  title: "Kerala PSC, SSC & RRB Coaching",

  description:
    "Prepare for Kerala PSC, SSC and RRB competitive exams with mock tests, previous year questions, current affairs, video classes and study materials from MasterMind Academy.",

  keywords: [
    "MasterMind Academy",
    "Kerala PSC coaching",
    "Kerala PSC online coaching",
    "SSC coaching",
    "RRB coaching",
    "competitive exam coaching",
    "PSC mock tests",
    "previous year questions",
    "current affairs",
    "PSC study materials",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title:
      "MasterMind Academy | Kerala PSC, SSC & RRB Coaching",

    description:
      "Prepare for competitive exams with structured courses, mock tests, previous questions, current affairs and expert guidance.",

    url: "/",

    siteName:
      "MasterMind Academy",

    images: [
      {
        url:
          "/images/og-image.jpg",

        width: 1200,

        height: 630,

        alt:
          "MasterMind Academy competitive exam coaching",
      },
    ],

    locale: "en_IN",

    type: "website",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "MasterMind Academy | Competitive Exam Coaching",

    description:
      "Kerala PSC, SSC and RRB preparation with mock tests, PYQs, current affairs and study materials.",

    images: [
      "/images/og-image.jpg",
    ],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "EducationalOrganization",

    name:
      "MasterMind Academy",

    url:
      "https://mastermindacademy.in",

    logo:
      "https://mastermindacademy.in/images/logo-128.png",

    description:
      "MasterMind Academy provides coaching and learning resources for Kerala PSC, SSC, RRB and other competitive examinations.",

    areaServed: {
      "@type":
        "Country",

      name:
        "India",
    },

    knowsAbout: [
      "Kerala PSC",
      "SSC",
      "RRB",
      "Competitive Examinations",
      "Current Affairs",
      "Mock Tests",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <main>
        <Hero />

        <Topbar />

        <IntroSection />

        <PopularCourses />

        <WhyChooseUs />

        <MobileAppWrapper />

        <Testimonials />

        <EnquiryForm />

        <HomeFAQ />
      </main>
    </>
  );
}