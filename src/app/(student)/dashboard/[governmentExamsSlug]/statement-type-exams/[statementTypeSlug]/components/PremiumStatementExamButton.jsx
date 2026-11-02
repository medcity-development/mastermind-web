import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";

export default function PremiumStatementExamButton({ governmentExamsSlug }) {
  return (
    <Link
      href={`/dashboard/${governmentExamsSlug}?showPackages=1`}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 px-5 py-3.5 text-[11px] font-bold hover:cursor-pointer text-amber-600 transition hover:bg-amber-500 hover:text-white"
    >
      <Crown size={17} />
      Get a plan
      <ArrowRight size={17} />
    </Link>
  );
}
