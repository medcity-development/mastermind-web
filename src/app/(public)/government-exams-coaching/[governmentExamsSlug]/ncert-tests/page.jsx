import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import NcertWrapper from "./components/NcertWrapper";

export default async function NcertTestsPage({
  params,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  return (
    <main
      className="
        min-h-[calc(100vh-72px)]
        bg-[#f5f9ff]
      "
    >
      <NcertWrapper
        examName={
          config.name
        }
      />
    </main>
  );
}