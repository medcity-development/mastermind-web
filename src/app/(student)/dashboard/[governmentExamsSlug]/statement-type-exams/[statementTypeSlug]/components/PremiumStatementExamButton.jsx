import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";

export default function PremiumStatementExamButton({ governmentExamsSlug }) {
  return (
    <Link
      href={`/dashboard/${governmentExamsSlug}?showPackages=1`}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600"
    >
      <Crown size={17} />
      View Packages
      <ArrowRight size={17} />
    </Link>
  );
}
