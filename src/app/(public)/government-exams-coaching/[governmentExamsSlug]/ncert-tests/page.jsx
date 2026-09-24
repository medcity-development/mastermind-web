import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import {
  getNcertTests,
} from "@/lib/ncertHelper";

import NcertWrapper from "./components/NcertWrapper";

// Replace this with your real NCERT content component
import NcertTestsContent from "./components/NcertTestsContent";

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

  const result =
    await getNcertTests({
      uid: 0,
      cid: config.cid,
    });

  const tests =
    Array.isArray(result)
      ? result
      : Array.isArray(
            result?.data
          )
        ? result.data
        : [];

  /* =====================================================
     NO CONTENT YET
  ===================================================== */

  if (
    tests.length === 0
  ) {
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

  /* =====================================================
     CONTENT AVAILABLE
  ===================================================== */

  return (
    <main
      className="
        min-h-screen
        bg-[#f5f9ff]
      "
    >
      <NcertTestsContent
        tests={tests}
        cid={config.cid}
        examName={config.name}
        governmentExamsSlug={
          governmentExamsSlug
        }
      />
    </main>
  );
}