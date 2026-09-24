import AboutFAQ from "./components/AboutFAQ";
import AboutHero from "./components/AboutHero";
import AboutStorySection from "./components/AboutStorySection";
import WhyChooseMasterMind from "./components/WhyChooseMasterMind";

export const metadata = {
  title: "About MasterMind Academy | Kerala PSC, SSC & RRB Coaching",
  description:
    "Learn about MasterMind Academy, a trusted Kerala PSC, SSC and RRB coaching centre offering expert faculty, structured learning, quality study materials, mock tests and personalised guidance.",
  alternates: {
    canonical: "/about-us",
  },
};

export default function AboutUsPage() {
  return (
    <main>
      <AboutHero />
      <AboutStorySection />
      <WhyChooseMasterMind />
      <AboutFAQ />
    </main>
  );
}