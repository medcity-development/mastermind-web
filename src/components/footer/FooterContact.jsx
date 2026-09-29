// src/components/footer/FooterContact.jsx

import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const CONTACT = {
  phone:
    "+91 98765 43210",

  email:
    "info@mastermindacademy.in",

  location:
    "Kerala, India",
};

export default function FooterContact() {
  const phoneHref =
    `tel:${CONTACT.phone.replace(
      /\s+/g,
      ""
    )}`;

  return (
    <div>
      {/* TITLE */}

      <div>
        <h3
          className="
            text-[13px]
            font-bold
            text-white
          "
        >
          Contact Us
        </h3>

        <div
          className="
            mt-2
            h-[3px]
            w-7
            rounded-full
            bg-[#00b5e8]
          "
        />
      </div>

      <div
        className="
          mt-5
          space-y-4
        "
      >
        {/* PHONE */}

        <a
          href={phoneHref}
          className="
            group
            flex
            items-center
            gap-3
          "
        >
          <ContactIcon>
            <Phone
              className="
                h-4
                w-4
              "
            />
          </ContactIcon>

          <div>
            <p
              className="
                text-[9px]
                font-semibold
                text-[#00b5e8]
              "
            >
              Call Us
            </p>

            <p
              className="
                mt-0.5
                text-[11px]
                font-medium
                text-white/75
                transition
                group-hover:text-white
              "
            >
              {CONTACT.phone}
            </p>
          </div>
        </a>

        {/* EMAIL */}

        <a
          href={`mailto:${CONTACT.email}`}
          className="
            group
            flex
            items-center
            gap-3
          "
        >
          <ContactIcon>
            <Mail
              className="
                h-4
                w-4
              "
            />
          </ContactIcon>

          <div>
            <p
              className="
                text-[9px]
                font-semibold
                text-[#00b5e8]
              "
            >
              Email Us
            </p>

            <p
              className="
                mt-0.5
                break-all
                text-[11px]
                font-medium
                text-white/75
                transition
                group-hover:text-white
              "
            >
              {CONTACT.email}
            </p>
          </div>
        </a>

        {/* LOCATION */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <ContactIcon>
            <MapPin
              className="
                h-4
                w-4
              "
            />
          </ContactIcon>

          <div>
            <p
              className="
                text-[9px]
                font-semibold
                text-[#00b5e8]
              "
            >
              Location
            </p>

            <p
              className="
                mt-0.5
                text-[11px]
                font-medium
                text-white/75
              "
            >
              {CONTACT.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactIcon({
  children,
}) {
  return (
    <span
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-[10px]
        border
        border-[#00b5e8]/20
        bg-[#075fc8]/10
        text-[#00b5e8]
        shadow-[0_8px_20px_rgba(0,181,232,0.06)]
      "
    >
      {children}
    </span>
  );
}