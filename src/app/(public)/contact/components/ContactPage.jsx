import ContactHero from "./ContactHero";
import ContactInfoCards from "./ContactInfoCards";
import ContactForm from "./ContactForm";
import ContactLocation from "./ContactLocation";
import ContactSupportCard from "./ContactSupportCard";
import ContactTrustBar from "./ContactTrustBar";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff]">
      <section
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-8
          xl:px-10 mt-24
        "
      >
        <ContactHero />

        <ContactInfoCards />

        <div
          className="
            mt-5
            grid
            gap-5
            lg:grid-cols-[0.9fr_1.1fr]
          "
        >
          <ContactForm />

          <div className="space-y-4">
            <ContactLocation />
            <ContactSupportCard />
          </div>
        </div>
      </section>

      <ContactTrustBar />
    </main>
  );
}