import Image from "next/image";

const EnquiryForm = () => {
  return (
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
          <form>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                type="text"
                name="fullname"
                placeholder="Full Name"
              />

              <FormInput
                type="email"
                name="email"
                placeholder="Email ID"
              />

              <FormInput
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
              />

              <FormInput
                type="text"
                name="course"
                placeholder="Select Course"
              />

              <FormTextarea
                name="address"
                placeholder="Address"
              />

              <FormTextarea
                name="message"
                placeholder="Message"
              />
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
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
                "
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
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

const FormInput = ({ type, name, placeholder }) => {
  return (
    <div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
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

const FormTextarea = ({ name, placeholder }) => {
  return (
    <div>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={4}
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