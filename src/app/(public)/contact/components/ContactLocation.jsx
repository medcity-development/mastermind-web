export default function ContactLocation() {
  return (
    <section
      aria-label="Our location map"
      className="
        overflow-hidden
        rounded-[20px]
        border
        border-[#dfeaf5]
        bg-white
        shadow-[0_10px_30px_rgba(15,58,110,0.06)]
      "
      data-aos="fade-up"
    >
      <iframe
        title="Map showing our location"
        src="https://maps.google.com/maps?q=8.4930387%2C76.9474501&z=17&hl=en&output=embed"
        loading="lazy"
        allowFullScreen
        className="block h-[320px] w-full sm:h-[380px] lg:h-[440px]"
      />
    </section>
  );
}
