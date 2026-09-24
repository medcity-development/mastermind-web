import TestimonialCardWrapper from "./components/TestimonialCardWrapper";
import TestimonialFAQ from "./components/TestimonialFAQ";
import TestimonialsHero from "./components/TestimonialsHero";

export const metadata = {
  title: "Student Testimonials | MasterMind Academy",
  description:
    "Read real success stories from MasterMind Academy students preparing for Kerala PSC, SSC and RRB competitive examinations.",
  alternates: {
    canonical: "/testimonials",
  },
};

export default function TestimonialsPage() {
  return (
    <main>
      <TestimonialsHero />
      <TestimonialCardWrapper />
      <TestimonialFAQ />
    </main>
  );
}