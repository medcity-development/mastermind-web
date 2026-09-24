"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpenCheck,
  Loader2,
} from "lucide-react";



import {
  getScertTabFolders,
  getScertTabTests,
} from "./scertTabActions";

import ScertClassCard from "./ScertClassCard";
import ScertTabLoading from "./ScertTabLoading";
import ScertTabEmpty from "./ScertTabEmpty";
import ScertTestList from "@/app/(public)/government-exams-coaching/[governmentExamsSlug]/scert-tests/classes/[classSlug]/components/ScertTestList";

export default function ScertTestsTab({
  cid = 1,
  uid = 0,
}) {
  const [
    folders,
    setFolders,
  ] = useState([]);

  const [
    selectedClass,
    setSelectedClass,
  ] = useState(null);

  const [
    tests,
    setTests,
  ] = useState([]);

  const [
    loadingFolders,
    setLoadingFolders,
  ] = useState(true);

  const [
    loadingTests,
    setLoadingTests,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     LOAD SCERT CLASSES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadFolders() {
      try {
        setLoadingFolders(true);
        setError("");

        const result =
          await getScertTabFolders({
            uid,
            cid,
          });

        if (cancelled) {
          return;
        }

        setFolders(
          Array.isArray(
            result?.data
          )
            ? result.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "SCERT folders:",
          error
        );

        setFolders([]);

        setError(
          "Unable to load SCERT classes."
        );
      } finally {
        if (!cancelled) {
          setLoadingFolders(
            false
          );
        }
      }
    }

    loadFolders();

    return () => {
      cancelled = true;
    };
  }, [
    cid,
    uid,
  ]);

  /* =========================================================
     SELECT CLASS
  ========================================================= */

  async function handleSelectClass(
    folder
  ) {
    if (!folder?.id) {
      return;
    }

    try {
      setSelectedClass(
        folder
      );

      setTests([]);

      setLoadingTests(true);

      setError("");

      const result =
        await getScertTabTests({
          uid,
          classId:
            folder.id,
        });

      setTests(
        Array.isArray(
          result?.data
        )
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "SCERT tests:",
        error
      );

      setTests([]);

      setError(
        "Unable to load SCERT tests."
      );
    } finally {
      setLoadingTests(
        false
      );
    }
  }

  /* =========================================================
     BACK TO CLASSES
  ========================================================= */

  function handleBack() {
    setSelectedClass(
      null
    );

    setTests([]);

    setError("");
  }

  /* =========================================================
     LOADING CLASSES
  ========================================================= */

  if (loadingFolders) {
    return (
      <ScertTabLoading />
    );
  }

  /* =========================================================
     CLASS LIST
  ========================================================= */

  if (!selectedClass) {
    return (
      <section
        className="
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_12px_35px_rgba(22,79,165,0.05)]
          sm:p-6
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              bg-[#edf7ff]
              text-[#075fc8]
            "
          >
            <BookOpenCheck
              size={20}
            />
          </div>

          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#017dc0]
              "
            >
              SCERT Practice
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-black
                text-[#102c5c]
              "
            >
              Choose SCERT Class
            </h2>

            <p
              className="
                mt-1
                text-[11px]
                text-slate-500
              "
            >
              Select a class to view
              available SCERT tests.
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error ? (
          <div
            className="
              mt-6
              rounded-[16px]
              border
              border-red-100
              bg-red-50
              px-4
              py-3
              text-[12px]
              font-medium
              text-red-600
            "
          >
            {error}
          </div>
        ) : null}

        {/* EMPTY */}

        {!folders.length ? (
          <ScertTabEmpty
            title="No SCERT Classes"
            message="No SCERT classes are currently available."
          />
        ) : (
          <div
            className="
              mt-6
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {folders.map(
              (folder) => (
                <ScertClassCard
                  key={
                    folder.id
                  }
                  item={
                    folder
                  }
                  onClick={
                    handleSelectClass
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    );
  }

  /* =========================================================
     SELECTED CLASS
  ========================================================= */

  const className =
    selectedClass?.class ||
    selectedClass?.class_name ||
    selectedClass?.name ||
    "SCERT Class";

  return (
    <section
      className="
        rounded-[24px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        shadow-[0_12px_35px_rgba(22,79,165,0.05)]
        sm:p-6
      "
    >
      {/* BACK */}

      <button
        type="button"
        onClick={
          handleBack
        }
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-[#dce8f7]
          bg-[#f7fbff]
          px-4
          py-2
          text-[11px]
          font-bold
          text-[#075fc8]
          transition-all
          hover:border-[#bcd8f1]
          hover:bg-[#edf7ff]
        "
      >
        <ArrowLeft
          size={14}
        />

        All SCERT Classes
      </button>

      {/* SELECTED CLASS HEADER */}

      <div
        className="
          mt-5
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-[14px]
            bg-[#edf7ff]
            text-[#075fc8]
          "
        >
          <BookOpenCheck
            size={20}
          />
        </div>

        <div>
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
          >
            SCERT Practice Tests
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#102c5c]
            "
          >
            {className}
          </h2>
        </div>
      </div>

      {/* LOADING TESTS */}

      {loadingTests ? (
        <div
          className="
            mt-8
            flex
            min-h-[180px]
            items-center
            justify-center
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              text-sm
              font-bold
              text-[#075fc8]
            "
          >
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading tests...
          </div>
        </div>
      ) : null}

      {/* ERROR */}

      {!loadingTests &&
      error ? (
        <div
          className="
            mt-6
            rounded-[18px]
            border
            border-red-100
            bg-red-50
            px-5
            py-8
            text-center
            text-[12px]
            font-medium
            text-red-600
          "
        >
          {error}
        </div>
      ) : null}

      {/* TEST LIST */}

      {!loadingTests &&
      !error ? (
        <ScertTestList
          tests={tests}
          classId={
            selectedClass.id
          }
        />
      ) : null}
    </section>
  );
}