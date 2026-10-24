"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import EnquirySuccessModal from "@/components/enquiry-form/EnquirySuccessModal";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");

    const form = event.currentTarget;
    const enquiry = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enquiry),
      });
      const result = await response.json();

      if (!response.ok || result?.status !== true) {
        throw new Error(
          result?.message || "Unable to submit your enquiry. Please try again."
        );
      }

      form.reset();
      setIsSuccessModalOpen(true);
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Unable to submit your enquiry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section
        className="
        rounded-[20px]
        border
        border-[#dfeaf5]
        bg-white
        p-5
        shadow-[0_10px_30px_rgba(15,58,110,0.06)]
        sm:p-6
      "
        data-aos="fade-up"
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
            Fill in the details below and we&apos;ll get back to you shortly.
          </p>
        </div>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <div
            className="
            grid
            gap-3
            sm:grid-cols-2
          "
          >
            <Field
              icon={User}
              name="firstname"
              placeholder="Full Name"
            />

            <Field
              icon={Mail}
              name="email"
              type="email"
              placeholder="Email ID"
            />

            <Field
              icon={Phone}
              name="mobile"
              type="tel"
              placeholder="Mobile Number"
            />

            <Field
              icon={BookOpen}
              name="course"
              placeholder="Enter a Course Name"
            />

            <TextareaField
              icon={MessageSquare}
              name="address"
              placeholder="Address"
            />

            <TextareaField
              icon={MessageSquare}
              name="message"
              placeholder="Message"
            />
          </div>

          {submissionError && (
            <p
              className="text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {submissionError}
            </p>
          )}

          <button
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
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Send Message"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </section>

      {isSuccessModalOpen && (
        <EnquirySuccessModal
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </>
  );
}

function Field({
  icon: Icon,
  name,
  type = "text",
  placeholder,
}) {
  const maxLength = {
    firstname: 150,
    email: 254,
    mobile: 30,
    course: 150,
  }[name];

  return (
    <label
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
        aria-hidden="true"
        className="
          h-4
          w-4
          shrink-0
          text-[#7189ae]
        "
      />

      <input
        autoComplete={name === "firstname" ? "name" : name}
        className="
          min-w-0
          flex-1
          bg-transparent
          text-xs
          text-slate-700
          outline-none
          placeholder:text-[#8ea0bb]
        "
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}

function TextareaField({ icon: Icon, name, placeholder }) {
  return (
    <label
      className="
        flex
        min-h-[112px]
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
      <Icon
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-[#7189ae]"
      />
      <textarea
        className="
          min-h-[88px]
          w-full
          resize-none
          bg-transparent
          text-xs
          text-slate-700
          outline-none
          placeholder:text-[#8ea0bb]
        "
        maxLength={name === "address" ? 500 : 2000}
        name={name}
        placeholder={placeholder}
        required
      />
    </label>
  );
}