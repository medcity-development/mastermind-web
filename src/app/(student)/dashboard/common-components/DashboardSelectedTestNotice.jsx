"use client";

import { useSearchParams } from "next/navigation";

export default function DashboardSelectedTestNotice() {
  const searchParams = useSearchParams();
  const title = searchParams.get("selectedTestTitle");
  const testId = searchParams.get("selectedTestId");

  if (!title && !testId) {
    return null;
  }

  return (
    <div
      role="status"
      className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
    >
      <p className="text-xs font-black uppercase tracking-wide text-amber-700">
        Your selected premium test
      </p>
      <p className="mt-1 font-bold">
        {title || `Test ${testId}`}
      </p>
    </div>
  );
}
