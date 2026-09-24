"use client";

import {
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

export default function ContactForm() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section
      className="
        rounded-[20px]
        border
        border-[#dfeaf5]
        bg-white
        p-5
        shadow-[0_10px_30px_rgba(15,58,110,0.06)]
        sm:p-6
      " data-aos="fade-up"
    >
      <div>
        <h2
          className="
            text-xl
            font-black
            text-[#082b7a]
          "
        >
          Send Us a Message
        </h2>

        <p
          className="
            mt-1
            text-xs
            text-[#7183a3]
          "
        >
          Fill in the details below and
          we&apos;ll get back to you shortly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-3"
      >
        <div
          className="
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          <Field
            icon={User}
            placeholder="Your Name *"
          />

          <Field
            icon={Mail}
            type="email"
            placeholder="Your Email *"
          />

          <Field
            icon={Phone}
            type="tel"
            placeholder="Phone Number *"
          />

          <Field
            icon={MessageSquare}
            placeholder="Subject *"
          />
        </div>

        <div
          className="
            flex
            min-h-[120px]
            items-start
            gap-2
            rounded-xl
            border
            border-[#dbe7f4]
            bg-white
            px-3
            py-3
            focus-within:border-[#087ee9]
          "
        >
          <MessageSquare
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              text-[#7189ae]
            "
          />

          <textarea
            required
            placeholder="Your Message *"
            className="
              min-h-[95px]
              w-full
              resize-none
              bg-transparent
              text-xs
              text-slate-700
              outline-none
              placeholder:text-[#8ea0bb]
            "
          />
        </div>

        <button
          type="submit"
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-gradient-to-r
            from-[#087ee9]
            to-[#075ee7]
            px-5
            py-3
            text-xs
            font-bold
            text-white
            shadow-[0_10px_24px_rgba(8,126,233,0.22)]
            transition
            hover:-translate-y-0.5
          "
        >
          Send Message
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}

function Field({
  icon: Icon,
  type = "text",
  placeholder,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-[#dbe7f4]
        bg-white
        px-3
        py-3
        focus-within:border-[#087ee9]
      "
    >
      <Icon
        className="
          h-4
          w-4
          shrink-0
          text-[#7189ae]
        "
      />

      <input
        type={type}
        required
        placeholder={placeholder}
        className="
          min-w-0
          flex-1
          bg-transparent
          text-xs
          text-slate-700
          outline-none
          placeholder:text-[#8ea0bb]
        "
      />
    </div>
  );
}