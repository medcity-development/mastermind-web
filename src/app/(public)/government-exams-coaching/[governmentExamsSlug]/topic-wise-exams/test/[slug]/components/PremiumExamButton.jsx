
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LockKeyhole, Crown } from "lucide-react";

import PremiumTestPurchaseModal from "@/components/mock-tests/PremiumTestPurchaseModal";
import { continueToPremiumPackages } from "@/lib/premiumPackagesRedirect";

export default function PremiumExamButton() {
  const router = useRouter();
  const pathname = usePathname();

  const [showPurchaseModal, setShowPurchaseModal] =
    useState(false);

  function handleOpenModal() {
    setShowPurchaseModal(true);
  }

  function handleCloseModal() {
    setShowPurchaseModal(false);
  }

  function handleConfirm() {
    setShowPurchaseModal(false);

    continueToPremiumPackages(router, pathname);
  }

  return (
    <>
      <div className="mt-auto space-y-3">
        <div
          className="
            flex items-center justify-center gap-2
            rounded-xl border border-amber-200
            bg-gradient-to-r from-amber-50 to-yellow-50
            px-4 py-3
            text-xs font-bold text-amber-800
          "
        >
          <Crown size={15} />
          <span>Premium Exam</span>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="
            flex w-full items-center justify-center gap-2
            rounded-xl border border-amber-200
            px-5 py-3.5
            text-sm font-bold text-amber-700
            transition-colors duration-200
            hover:bg-amber-600
            focus-visible:outline-none
            focus-visible:ring-2 hover:text-white
            focus-visible:ring-amber-500
            focus-visible:ring-offset-2
          "
        >
          <LockKeyhole size={16} />
          <span>Unlock Premium</span>
        </button>
      </div>

      <PremiumTestPurchaseModal
        open={showPurchaseModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />
    </>
  );
}
