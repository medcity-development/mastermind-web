
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LockKeyhole,
  Crown,
} from "lucide-react";
import PremiumTestPurchaseModal from "@/components/mock-tests/PremiumTestPurchaseModal";
import { continueToPremiumPackages } from "@/lib/premiumPackagesRedirect";

export default function PremiumExamButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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
        Premium Exam
      </div>

      <button
        type="button"
        onClick={() => setShowPurchaseModal(true)}
        className="
          flex w-full
          items-center justify-center gap-2
          rounded-xl bg-amber-500
          px-5 py-3.5
          text-sm font-black text-white transition hover:bg-amber-600
        "
      >
        <LockKeyhole size={16} />
        OK
      </button>
    </div>
    <PremiumTestPurchaseModal
      open={showPurchaseModal}
      onClose={() => setShowPurchaseModal(false)}
      onConfirm={handleConfirm}
    />
    </>
  );
}
