import Image from "next/image";
import ContactHero from "./ContactHero";
import ContactInfoCards from "./ContactInfoCards";
import ContactForm from "./ContactForm";
import ContactLocation from "./ContactLocation";
import ContactSupportCard from "./ContactSupportCard";
import ContactTrustBar from "./ContactTrustBar";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
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
          xl:px-10
        "
      >
        <ContactHero />

        <ContactInfoCards />

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-2
            lg:items-stretch
          "
        >
          <ContactForm />

          <div
            className="
              relative
              min-h-[320px]
              overflow-hidden
              rounded-[20px]
              border
              border-[#dfeaf5]
              bg-gradient-to-br
              from-[#eaf6ff]
              via-[#f7fbff]
              to-[#e5f4ff]
              shadow-[0_10px_30px_rgba(15,58,110,0.06)]
              sm:min-h-[420px]
              lg:min-h-[520px]
            "
            data-aos="fade-up"
          >
            <Image
              alt="Student ready to learn"
              className="object-contain object-bottom p-3 sm:p-5 pb-0"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              src="/assets/image.png"
            />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <ContactLocation />
          <ContactSupportCard />
        </div>
      </section>

      <ContactTrustBar />
    </main>
  );
}