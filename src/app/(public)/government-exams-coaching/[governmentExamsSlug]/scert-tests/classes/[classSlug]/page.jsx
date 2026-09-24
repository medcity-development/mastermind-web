import Link from "next/link";

import {
  ArrowLeft,
  BookOpenCheck,
} from "lucide-react";

import {
  getScertFolders,
  getScertTestsByClassId,
} from "@/lib/scertHelper";

import ScertTestList from "./components/ScertTestList";

export const metadata = {
  title:
    "SCERT Practice Tests | MasterMind Academy",

  description:
    "Practice class-wise Kerala SCERT tests for Kerala PSC preparation.",
};

export default async function ScertClassPage({
  params,
}) {
  /* =========================================================
     GET DYNAMIC CLASS ID FROM URL

     Folder:
     classes/[classSlug]

     URL:
     /classes/1
     /classes/2
     /classes/3

     classSlug:
     "1"
     "2"
     "3"
  ========================================================= */

  const resolvedParams =
    await params;

  const classId =
    resolvedParams?.classSlug;

  /* =========================================================
     NO CLASS ID
  ========================================================= */

  if (!classId) {
    return (
      <main className="min-h-screen bg-[#f5f9ff]">
        <div
          className="
            mx-auto
            max-w-[900px]
            px-4
            py-12
          "
        >
          <div
            className="
              rounded-[24px]
              border
              border-slate-200
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >
            <h1
              className="
                text-2xl
                font-black
                text-[#071f55]
              "
            >
              Select a SCERT Class
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              "
            >
              Please select a SCERT
              class to view all
              available practice
              tests.
            </p>

            <Link
              href="/government-exams-coaching/kerala-psc/scert-tests"
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-[#071f55]
                via-[#075fc8]
                to-[#017dc0]
                px-6
                py-3
                text-sm
                font-bold
                text-white
                transition-all
                hover:-translate-y-0.5
                hover:shadow-lg
              "
            >
              <ArrowLeft
                size={17}
              />

              View Classes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     GET SCERT CLASS LIST

     getScertListbyOffset uses:
     cid = 1
  ========================================================= */

  const foldersResult =
    await getScertFolders({
      uid: 0,
      cid: 1,
      offset: 0,
    });

  const folders =
    Array.isArray(
      foldersResult?.data
    )
      ? foldersResult.data
      : [];

  /* =========================================================
     FIND SELECTED CLASS

     Example:

     URL:
     /classes/3

     classId = "3"

     Finds:
     {
       id: 3,
       class: "CLASS 7"
     }
  ========================================================= */

  const currentClass =
    folders.find(
      (folder) =>
        String(
          folder?.id
        ) ===
        String(
          classId
        )
    );

  /* =========================================================
     CLASS NOT FOUND
  ========================================================= */

  if (!currentClass) {
    return (
      <main className="min-h-screen bg-[#f5f9ff]">
        <div
          className="
            mx-auto
            max-w-[900px]
            px-4
            py-12
          "
        >
          <div
            className="
              rounded-[24px]
              border
              border-slate-200
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >
            <h1
              className="
                text-2xl
                font-black
                text-[#071f55]
              "
            >
              SCERT Class Not Found
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              "
            >
              The selected SCERT
              class is not currently
              available.
            </p>

            <Link
              href="/government-exams-coaching/kerala-psc/scert-tests"
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-[#071f55]
                via-[#075fc8]
                to-[#017dc0]
                px-6
                py-3
                text-sm
                font-bold
                text-white
              "
            >
              <ArrowLeft
                size={17}
              />

              View Classes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     GET TESTS FOR SELECTED CLASS

     IMPORTANT:

     currentClass.id becomes
     backend cid inside helper.

     CLASS 5 -> cid 1
     CLASS 6 -> cid 2
     CLASS 7 -> cid 3

     filter stays 0.
  ========================================================= */

  const testsResult =
    await getScertTestsByClassId({
      uid: 0,

      classId:
        currentClass.id,

      filter: 0,
    });

  const tests =
    Array.isArray(
      testsResult?.data
    )
      ? testsResult.data
      : [];

  /* =========================================================
     DEBUG

     Remove later if not needed.
  ========================================================= */

  console.log(
    "SELECTED SCERT CLASS:",
    {
      routeClassSlug:
        classId,

      classId:
        currentClass.id,

      backendCid:
        currentClass.id,

      className:
        currentClass.class,

      testsCount:
        tests.length,

      tests,
    }
  );

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f9ff]">
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          py-6
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >
        {/* =================================================
            BACK LINK
        ================================================= */}

        <Link
          href="/government-exams-coaching/kerala-psc/scert-tests"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-[#075fc8]
            transition-colors
            hover:text-[#071f55]
          "
        >
          <ArrowLeft
            size={17}
          />

          All SCERT Classes
        </Link>

        {/* =================================================
            CLASS HERO
        ================================================= */}

        <section
          className="
            relative
            mt-6
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#00a8df]
            px-6
            py-8
            text-white
            sm:px-8
            lg:px-10
            lg:py-10
          "
        >
          {/* GRID PATTERN */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.07]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:34px_34px]
            "
          />

          {/* GLOW */}

          <div
            aria-hidden="true"
            className="
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          {/* HERO CONTENT */}

          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-between
              gap-6
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-blue-100
                "
              >
                SCERT Practice Tests
              </p>

              <h1
                className="
                  mt-2
                  text-3xl
                  font-black
                  sm:text-4xl
                "
              >
                {currentClass.class}
              </h1>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-7
                  text-blue-100
                "
              >
                Practice all available
                SCERT tests for this
                class and improve your
                Kerala PSC preparation.
              </p>
            </div>

            <div
              className="
                hidden
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-white/15
                bg-white/10
                backdrop-blur-sm
                sm:flex
              "
            >
              <BookOpenCheck
                size={30}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            TEST LIST
        ================================================= */}

        <ScertTestList
          tests={tests}
          classId={
            currentClass.id
          }
        />
      </div>
    </main>
  );
}