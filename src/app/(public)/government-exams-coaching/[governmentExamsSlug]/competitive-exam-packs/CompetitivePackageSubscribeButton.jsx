"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Crown, LockKeyhole, X } from "lucide-react";
import { continueToPremiumPackages } from "@/lib/premiumPackagesRedirect";

export default function CompetitivePackageSubscribeButton({
  examName,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const portalRoot =
    typeof document === "undefined" ? null : document.body;

  async function handleContinue() {
    if (loading) return;

    setLoading(true);
    setOpen(false);

    try {
      await continueToPremiumPackages(router, pathname);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#164fa5] to-[#0089c8] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
      >
        Subscribe
        <ArrowRight size={14} />
      </button>

      {open && portalRoot
        ? createPortal(
            <div
              className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#071936]/60 px-4 py-8 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setOpen(false);
                }
              }}
              role="presentation"
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="competitive-package-subscribe-title"
                className="relative w-full max-w-[430px] overflow-hidden rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(7,25,54,0.30)] sm:p-7"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close subscribe dialog"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <X size={17} />
                </button>

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <Crown size={27} />
                </div>

                <div className="mt-5 text-center">
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-amber-700">
                    {examName} Premium Plans
                  </span>
                  <h2
                    id="competitive-package-subscribe-title"
                    className="mt-3 text-[22px] font-black text-[#172554]"
                  >
                    View available packages
                  </h2>
                  <p className="mx-auto mt-3 max-w-[340px] text-[12px] leading-6 text-slate-500">
                    Sign in to view available {examName} packages and continue
                    to purchase.
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-[#dfe6ff] bg-gradient-to-r from-[#f7f9ff] to-[#fbf7ff] px-4 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3154ee] shadow-sm">
                    <LockKeyhole size={17} />
                  </span>
                  <p className="text-[11px] font-semibold leading-5 text-[#52617a]">
                    After login, you can select a plan, review its price and
                    complete checkout securely.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[46px] items-center justify-center rounded-[14px] border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-600 transition hover:bg-slate-50"
                  >
                    Maybe Later
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="flex min-h-[46px] items-center justify-center rounded-[14px] bg-gradient-to-r from-[#164fa5] via-[#017cc0] to-[#3154ee] px-4 text-[11px] font-black text-white shadow-[0_10px_25px_rgba(49,84,238,0.20)] transition-all hover:-translate-y-0.5"
                  >
                    Continue
                  </button>
                </div>
              </section>
            </div>,
            portalRoot
          )
        : null}
    </>
  );
}
