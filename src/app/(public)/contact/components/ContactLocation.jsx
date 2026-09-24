import {
    ExternalLink,
    Mail,
    MapPin,
    Phone,
  } from "lucide-react";
  
  export default function ContactLocation() {
    return (
      <section
        className="
          rounded-[20px]
          border
          border-[#dfeaf5]
          bg-white
          p-5
          shadow-[0_10px_30px_rgba(15,58,110,0.06)]
        " data-aos="fade-up"
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <h2
              className="
                text-base
                font-black
                text-[#082b7a]
              "
            >
              Our Location
            </h2>
  
            <p
              className="
                mt-1
                text-[11px]
                text-[#7183a3]
              "
            >
              Visit our office or find us
              on the map.
            </p>
          </div>
  
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-bold
              text-[#087ee9]
            "
          >
            Get Directions
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
  
        <div
          className="
            mt-4
            grid
            gap-4
            md:grid-cols-[0.85fr_1.15fr]
          "
        >
          <div className="space-y-4">
            <InfoRow
              icon={MapPin}
              title="MasterMind PSC Coaching App"
              text="2nd Floor, Galaxy Tower, M.G. Road, Kochi – 682016 Kerala, India"
            />
  
            <InfoRow
              icon={Phone}
              title="+91 9846 123 456"
              text="Mon – Sat, 9:00 AM – 6:00 PM"
            />
  
            <InfoRow
              icon={Mail}
              title="hello@mastermindpsc.com"
              text="We usually reply within 24 hours"
            />
          </div>
  
          <div
            className="
              relative
              min-h-[200px]
              overflow-hidden
              rounded-[16px]
              border
              border-[#dce7f3]
              bg-gradient-to-br
              from-[#e9f4ff]
              via-[#f8fbff]
              to-[#e6f7ff]
            "
          >
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
              "
            >
              <div
                className="
                  flex
                  flex-col
                  items-center
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#087ee9]
                    text-white
                    shadow-lg
                  "
                >
                  <MapPin className="h-6 w-6" />
                </div>
  
                <p
                  className="
                    mt-2
                    text-xs
                    font-black
                    text-[#082b7a]
                  "
                >
                  MasterMind PSC
                </p>
  
                <p
                  className="
                    text-[10px]
                    text-[#7183a3]
                  "
                >
                  Kochi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  function InfoRow({
    icon: Icon,
    title,
    text,
  }) {
    return (
      <div className="flex gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#eaf5ff]
            text-[#087ee9]
          "
        >
          <Icon className="h-4 w-4" />
        </div>
  
        <div>
          <p
            className="
              text-xs
              font-bold
              text-[#173b7a]
            "
          >
            {title}
          </p>
  
          <p
            className="
              mt-0.5
              text-[10px]
              leading-4
              text-[#7183a3]
            "
          >
            {text}
          </p>
        </div>
      </div>
    );
  }