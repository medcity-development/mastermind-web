"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  Loader2,
  Menu,
  Search,
} from "lucide-react";
import { createSlug } from "@/lib/pscSlug";

/* =========================================================
   DASHBOARD HEADER
========================================================= */

export default function DashboardHeader({
  user,
  config,
  dashboardOptions = [],
  onMenuClick,
}) {
  /* =======================================================
     USER
  ======================================================= */

  const name =
    String(
      user?.name ||
      user?.profile?.name ||
      "Student"
    ).trim() ||
    "Student";

  const initial =
    name
      .charAt(0)
      .toUpperCase() ||
    "S";

  const profileHref =
    config?.slug
      ? `/dashboard/${config.slug}/profile`
      : "#";

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState("");

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  useEffect(() => {
    const keyword = searchTerm.trim();

    if (keyword.length < 2) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const response = await fetch("/api/search-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword }),
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || (result?.status === false && result?.message)) {
          throw new Error(
            result?.message || "Unable to search right now."
          );
        }

        setSearchResults(
          Array.isArray(result?.details)
            ? result.details.filter(
                (item) =>
                  item &&
                  item.id != null &&
                  typeof item.name === "string" &&
                  item.name.trim()
              )
            : []
        );
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Dashboard search suggestions:", error);
          setSearchResults([]);
          setSearchError(
            error?.message || "Unable to search right now."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

  function getSuggestionHref(item) {
    if (!config?.slug || item?.id == null) {
      return null;
    }

    const root = `/dashboard/${encodeURIComponent(config.slug)}`;
    const id = encodeURIComponent(String(item.id));
    const title = encodeURIComponent(String(item.name || ""));
    const type = String(item.type || "").trim().toLowerCase();

    if (["pqp", "pyq"].includes(type)) {
      return `${root}/previous-questions/${id}`;
    }

    if (["mock", "mocktest", "mock-test"].includes(type)) {
      return `${root}/mock-tests/${id}?title=${title}`;
    }

    if (["twe", "topicwise", "topic-wise"].includes(type)) {
      return `${root}/topic-wise-exams/test/${createSlug(item.name)}`;
    }

    if (["scert", "scert-test"].includes(type)) {
      return `${root}/scert-tests`;
    }

    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header
      className="
        sticky
        top-0
        z-30

        border-b
        border-slate-200/60

        bg-white/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          h-[85px]
          items-center
          gap-4

          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
          "
        >
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={
              onMenuClick
            }
            aria-label="Open dashboard menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-[12px]

              border
              border-slate-200

              bg-white

              text-[#111827]

              shadow-[0_5px_15px_rgba(15,23,42,0.05)]

              transition-all
              duration-200

              hover:border-violet-200
              hover:bg-violet-50

              xl:hidden
            "
          >
            <Menu
              size={20}
              strokeWidth={2}
            />
          </button>

          {/* LOGO */}

          <Link
            href="#"
            className="
              group
              flex
              items-center
            "
          >
            <Image
              src="/assets/logo-128.png"
              alt="Master Mind"
              width={160}
              height={160}
              priority
              className="
                h-[64px]
                w-auto
                object-contain

                transition-transform
                duration-300

                group-hover:scale-[1.03]

                sm:h-[72px]
                lg:h-[76px]
              "
            />
          </Link>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className="
            relative
            ml-3
            hidden
            w-full
            max-w-[430px]

            md:block
          "
        >
          <Search
            size={16}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2

              text-slate-400
            "
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setSearchResults([]);
              setSearchError("");
              setSearchLoading(false);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearchOpen(false);
              }
            }}
            placeholder="Search courses, tests, topics..."
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={searchOpen && searchTerm.trim().length >= 2}
            aria-controls="dashboard-search-results"
            aria-label="Search courses, tests, and topics"
            className="
              h-[44px]
              w-full

              rounded-[14px]

              border
              border-slate-200

              bg-[#f8faff]

              pl-11
              pr-4

              text-[12px]
              font-medium
              text-slate-700

              outline-none

              transition-all
              duration-200

              placeholder:text-slate-400

              focus:border-violet-300
              focus:bg-white
              focus:shadow-[0_0_0_4px_rgba(139,92,246,0.07)]
            "
          />
          {searchOpen && searchTerm.trim().length >= 2 ? (
            <div
              id="dashboard-search-results"
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
            >
              {searchLoading ? (
                <p className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-slate-500">
                  <Loader2 size={15} className="animate-spin" />
                  Searching...
                </p>
              ) : searchError ? (
                <p role="alert" className="px-3 py-3 text-xs font-semibold text-rose-600">
                  {searchError}
                </p>
              ) : searchResults.length ? (
                searchResults.map((item, index) => {
                  const href = getSuggestionHref(item);
                  const label = String(item.name).trim();
                  const typeLabel = String(item.type || "exam")
                    .replace(/[-_]/g, " ")
                    .toUpperCase();

                  return href ? (
                    <Link
                      key={`${item.type || "result"}-${item.id}-${index}`}
                      href={href}
                      role="option"
                      aria-selected="false"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchTerm("");
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-violet-50 focus:bg-violet-50 focus:outline-none"
                    >
                      <span className="min-w-0 truncate text-xs font-bold text-slate-700">
                        {label}
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-extrabold tracking-wide text-slate-500">
                        {typeLabel}
                      </span>
                    </Link>
                  ) : (
                    <div
                      key={`${item.type || "result"}-${item.id}-${index}`}
                      role="option"
                      aria-selected="false"
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left"
                    >
                      <span className="min-w-0 truncate text-xs font-bold text-slate-500">
                        {label}
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-extrabold tracking-wide text-slate-400">
                        {typeLabel}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="px-3 py-3 text-xs font-semibold text-slate-500">
                  No results found.
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div
          className="
            ml-auto
            flex
            items-center
            gap-3
          "
        >
          <details className="group relative">
            <summary
              aria-label={`Switch dashboard, current dashboard ${config?.shortName || config?.name}`}
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-0 text-[#071b59] shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:h-10 sm:w-auto sm:justify-start sm:px-3 [&::-webkit-details-marker]:hidden"
            >
              <ArrowLeftRight size={16} />
              <span className="hidden text-[10px] font-extrabold sm:inline">
                {config?.shortName || config?.name}
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 transition group-open:rotate-180 sm:block" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-[230px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
              <p className="px-3 pb-1 pt-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Switch dashboard
              </p>
              {dashboardOptions.map((option) => {
                const active = option.slug === config?.slug;
                return (
                  <Link
                    key={option.slug}
                    href={`/dashboard/${encodeURIComponent(option.slug)}`}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[11px] font-bold transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-[#071b59]"}`}
                  >
                    <span>{option.name}</span>
                    {active ? <span className="text-[9px] font-extrabold uppercase tracking-wide">Current</span> : null}
                  </Link>
                );
              })}
            </div>
          </details>

          {/* NOTIFICATION */}

          <button
            type="button"
            aria-label="Notifications"
            className="
              relative

              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-full

              border
              border-slate-200

              bg-white

              text-[#111827]

              shadow-sm

              transition-all

              hover:border-violet-200
              hover:bg-violet-50
            "
          >
            <Bell
              size={18}
              strokeWidth={1.9}
            />

            <span
              className="
                absolute
                right-[8px]
                top-[7px]

                h-[7px]
                w-[7px]

                rounded-full

                border-2
                border-white

                bg-[#ff3f74]
              "
            />
          </button>

          {/* =================================================
              PROFILE LINK
          ================================================= */}

          <Link
            href={
              profileHref
            }
            className="
              group

              flex
              items-center
              gap-3

              rounded-[14px]

              px-1
              py-1

              transition

              hover:bg-slate-50
            "
          >
            {/* AVATAR */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-gradient-to-br
                from-[#7c3aed]
                via-[#4f46e5]
                to-[#2563eb]

                text-[12px]
                font-extrabold
                text-white

                shadow-[0_8px_20px_rgba(79,70,229,0.24)]

                transition-transform
                duration-200

                group-hover:scale-105
              "
            >
              {initial}
            </div>

            {/* USER NAME */}

            <div
              className="
                hidden
                min-w-0
                sm:block
              "
            >
              <p
                className="
                  max-w-[180px]
                  truncate

                  text-[11px]
                  font-bold
                  text-[#071b59]
                "
              >
                Hi, {name} 👋
              </p>

              <p
                className="
                  mt-0.5

                  text-[9px]
                  text-slate-400
                "
              >
                Welcome back!
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}