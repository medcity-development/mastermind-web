
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "919645070404"; 

export default function FloatingWhatsApp() {
  const message = encodeURIComponent(
    "Hello MasterMind Academy, I would like to know more about your Kerala PSC, SSC and RRB coaching courses."
  );

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MasterMind Academy on WhatsApp"
      title="Chat with us on WhatsApp"
      className="
        fixed
        bottom-6
        right-5
        z-50
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-[#25D366]
        text-white
        shadow-[0_8px_30px_rgba(37,211,102,0.35)]
        transition-all
        duration-300
        hover:scale-110
        hover:bg-[#1ebe5d]
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-4
        focus-visible:outline-green-600
        sm:bottom-8
        sm:right-8
      "
    >
      <FaWhatsapp
        size={30}
        aria-hidden="true"
      />
    </a>
  );
}
