"use client";

import Image from "next/image";
import {
  BookOpenCheck,
  Clock3,
  GraduationCap,
  Play,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Clock3,
    title: "24 x 7 Access",
    description: "Learn anytime",
  },
  {
    icon: GraduationCap,
    title: "Expert Tutors",
    description: "Learn from experts",
  },
  {
    icon: BookOpenCheck,
    title: "Mock Tests",
    description: "Practice smarter",
  },
];

export default function MobileAppWrapper() {
  return (
    <section className="relative overflow-hidden bg-white py-8 sm:py-10 lg:py-14 scroll-mt-24" id="mobile-app">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-visible rounded-[26px] bg-gradient-to-br from-[#164fa5] via-[#082d84] to-[#164fa5] shadow-[0_22px_70px_rgba(5,28,86,0.18)]">
          {/* Decorative dots */}
          <DotPattern className="left-5 bottom-10 opacity-45 sm:left-8" />
          <DotPattern className="right-5 top-5 opacity-65 sm:right-8 sm:top-7" />

          <div className="grid min-h-[540px] grid-cols-1 items-center lg:grid-cols-[0.95fr_1.05fr_0.78fr] py-10">
            {/* LEFT: PHONE */}
            <div className="relative order-2 flex min-h-[420px] items-end justify-center px-4 pt-8 sm:min-h-[500px] lg:order-1 lg:min-h-[560px] lg:justify-start lg:px-0 lg:pt-0">
              <div className="relative z-20 w-[230px] sm:w-[280px] md:w-[315px] lg:absolute lg:-bottom-5 lg:left-[7%] lg:w-[330px] xl:left-[10%] xl:w-[365px]">
                <Image
                  src="/assets/mastermind-app.png"
                  alt="Master Mind Learning App"
                  width={650}
                  height={1000}
                  priority
                  className="h-auto w-full object-contain drop-shadow-[0_28px_38px_rgba(0,0,0,0.28)]"
                />
              </div>
            </div>

            {/* CENTER: COPY + FEATURES */}
            <div className="order-1 px-6 pt-10 text-center sm:px-10 sm:pt-12 lg:order-2 lg:px-6 lg:py-14 lg:text-left xl:px-10">
              <h2 className="text-[38px] font-extrabold leading-[1.03] tracking-[-0.035em] text-white sm:text-[48px] md:text-[56px] lg:text-[52px] xl:text-[62px]">
                Learn Anytime,
                <span className="block bg-gradient-to-r from-[#11c5ff] via-[#17d5e4] to-[#36e0c7] bg-clip-text text-transparent">
                  Anywhere!
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-7 text-white/90 sm:text-[18px] sm:leading-8 lg:mx-0 lg:max-w-[520px] xl:text-[20px]">
                Download the MasterMind App and take a step closer to your dream
                job.
              </p>

              <div className="mx-auto mt-8 grid max-w-[620px] grid-cols-1 gap-4 sm:grid-cols-3 lg:mx-0 lg:gap-0">
                {features.map(({ icon: Icon, title, description }, index) => (
                  <div
                    key={title}
                    className={`relative flex flex-col items-center px-4 py-2 text-center lg:items-start lg:px-0 lg:pr-6 lg:text-left xl:pr-8 ${
                      index !== features.length - 1
                        ? "lg:after:absolute lg:after:right-0 lg:after:top-1 lg:after:h-[122px] lg:after:w-px lg:after:bg-white/15"
                        : ""
                    } ${index !== 0 ? "lg:pl-6 xl:pl-8" : ""}`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#315dd9] to-[#173cae] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.16)]">
                      <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-4 text-[14px] font-semibold text-white sm:text-[15px]">
                      {title}
                    </h3>
                    <p className="mt-1 text-[12px] text-white/70 sm:text-[13px]">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: DOWNLOAD + EXISTING SMALL CARDS */}
            <div className="order-3 px-6 pb-10 pt-8 sm:px-10 lg:border-l lg:border-dashed lg:border-white/20 lg:px-8 lg:py-14 xl:px-10">
              <div className="mx-auto max-w-[330px] text-center lg:mx-0 lg:text-left">
                <p className="text-[25px] font-semibold leading-[1.25] text-white sm:text-[28px] lg:text-[26px] xl:text-[30px]">
                  Download the
                  <span className="block">App Now!</span>
                </p>

                {/* Replaces QR + App Store: uses the existing small cards */}
                <div className="mt-7 grid gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/95 p-4 text-left shadow-[0_15px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf1ff]">
                        <Trophy className="h-5 w-5 text-[#3154ee]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-500">
                          Mock Test Score
                        </p>
                        <div className="mt-0.5 flex items-center justify-between gap-3">
                          <p className="text-lg font-bold text-[#102783]">92%</p>
                          <span className="text-[10px] font-semibold text-[#3154ee]">
                            Excellent
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8ecff]">
                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#1683ff] to-[#7047ff]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/95 px-4 py-3.5 text-left shadow-[0_15px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3154ee] text-white">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#14245f]">
                        Live Classes
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Learn with experts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Play only */}
                <a
                  href="#"
                  aria-label="Get MasterMind on Google Play"
                  className="mx-auto mt-5 flex min-h-[68px] w-full max-w-[255px] items-center justify-center gap-3 rounded-[12px] border border-white/25 bg-black px-5 text-left text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-0.5 lg:mx-0"
                >
                  <GooglePlayIcon />
                  <span>
                    <span className="block text-[10px] uppercase leading-none tracking-[0.04em] text-white/80">
                      Get it on
                    </span>
                    <span className="mt-1 block text-[22px] font-medium leading-none tracking-[-0.02em]">
                      Google Play
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DotPattern({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 h-[96px] w-[96px] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(17,102,255,0.95) 0 5px, transparent 5.5px)",
        backgroundSize: "34px 34px",
      }}
    />
  );
}

function GooglePlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 40"
      className="h-9 w-8 shrink-0"
      fill="none"
    >
      <path d="M2.2 2.4 21.2 20 2.2 37.6c-.8-.7-1.2-1.8-1.2-3.2V5.6c0-1.4.4-2.5 1.2-3.2Z" fill="#00D7FE" />
      <path d="m21.2 20 5.8-5.4L5.7 2.2c-1.2-.7-2.5-.6-3.5.2L21.2 20Z" fill="#5BDD71" />
      <path d="m21.2 20 5.8 5.4L5.7 37.8c-1.2.7-2.5.6-3.5-.2L21.2 20Z" fill="#FFCF45" />
      <path d="M34.1 18.2 27 14.6 21.2 20l5.8 5.4 7.1-3.6c1.8-.9 1.8-2.7 0-3.6Z" fill="#FF5A60" />
    </svg>
  );
}