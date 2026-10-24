"use client";

import Image from "next/image";
import { useState } from "react";
import EnquirySuccessModal from "./EnquirySuccessModal";

const EnquiryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const enquiry = Object.fromEntries(formData.entries());

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
    <section className="relative w-full overflow-hidden py-16" data-aos="fade-up">
      {/* Background image */}
      <Image
        src="/assets/mastermind-enquiry-bg.webp"
        alt=""
        fill
        priority={false}
        className="object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black/80" />

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FormHeader />

        <div className="mx-auto mt-8 max-w-5xl">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                type="text"
                name="firstname"
                placeholder="Full Name"
                required
              />

              <FormInput
                type="email"
                name="email"
                placeholder="Email ID"
                required
              />

              <FormInput
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                required
              />

              <FormInput
                type="text"
                name="course"
                placeholder="Enter a Course Name"
                required
              />

              <FormTextarea
                name="address"
                placeholder="Address"
                required
              />

              <FormTextarea
                name="message"
                placeholder="Message"
                required
              />
            </div>

            {submissionError && (
              <p
                className="mt-4 text-center text-sm text-red-200"
                role="alert"
                aria-live="polite"
              >
                {submissionError}
              </p>
            )}

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-40
                  rounded-lg
                  border
                  border-white
                  bg-white
                  px-6
                  py-3
                  text-[clamp(12px,1vw,16px)]
                  font-semibold
                  text-[rgb(var(--secondary))]
                  transition-all
                  duration-300
                  hover:bg-[rgb(var(--primary))]
                  hover:text-white
                  focus:outline-none
                  focus:ring-2
                  focus:ring-white/60
                  disabled:cursor-not-allowed
                  disabled:opacity-70 cursor-pointer
                "
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
    {isSuccessModalOpen && (
      <EnquirySuccessModal onClose={() => setIsSuccessModalOpen(false)} />
    )}
    </>
  );
};

const FormHeader = () => {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-[clamp(28px,4.3vw,46px)] font-bold text-white">
        Ready to start your learning journey?
      </h2>

      <p className="mt-4 text-[clamp(14px,1.2vw,18px)] leading-relaxed text-white/90">
        Join thousands of students who are already learning with us.
      </p>
    </div>
  );
};

const FormInput = ({ type, name, placeholder, required }) => {
  return (
    <div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="
          w-full
          rounded-lg
          border
          border-white/70
          bg-white/10
          px-4
          py-3
          text-white
          outline-none
          backdrop-blur-sm
          transition-all
          duration-300
          placeholder:text-white/80
          focus:border-white
          focus:bg-white/15
          focus:ring-2
          focus:ring-white/20
        "
      />
    </div>
  );
};

const FormTextarea = ({ name, placeholder, required }) => {
  return (
    <div>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={4}
        required={required}
        className="
          w-full
          resize-none
          rounded-lg
          border
          border-white/70
          bg-white/10
          px-4
          py-3
          text-white
          outline-none
          backdrop-blur-sm
          transition-all
          duration-300
          placeholder:text-white/80
          focus:border-white
          focus:bg-white/15
          focus:ring-2
          focus:ring-white/20
        "
      />
    </div>
  );
};

export default EnquiryForm;