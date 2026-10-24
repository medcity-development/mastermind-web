"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, RefreshCw } from "lucide-react";

const ENQUIRIES_PER_PAGE = 10;

export default function EnquiriesAdmin() {
  const [enquiries, setEnquiries] = useState([]);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(enquiries.length / ENQUIRIES_PER_PAGE)
  );
  const displayedPage = Math.min(currentPage, totalPages);
  const firstVisibleEnquiry = (displayedPage - 1) * ENQUIRIES_PER_PAGE;
  const visibleEnquiries = enquiries.slice(
    firstVisibleEnquiry,
    firstVisibleEnquiry + ENQUIRIES_PER_PAGE
  );
  const pageNumbers = Array.from(
    new Set([1, displayedPage - 1, displayedPage, displayedPage + 1, totalPages])
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second);

  const loadEnquiries = useCallback(async () => {
    try {
      const response = await fetch("/api/enquiry/list", {
        cache: "no-store",
      });
      const result = await response.json();

      if (response.status === 401) {
        setIsAuthenticated(false);
        setEnquiries([]);
        return;
      }

      setIsAuthenticated(true);

      if (!response.ok || result?.status !== true) {
        throw new Error(result?.message || "Unable to load enquiries.");
      }

      setEnquiries(Array.isArray(result.details) ? result.details : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load enquiries. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsCheckingAccess(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const response = await fetch("/api/enquiry/list", {
          cache: "no-store",
        });
        const result = await response.json();

        if (!isMounted) {
          return;
        }

        if (response.status === 401) {
          setIsAuthenticated(false);
          setEnquiries([]);
          return;
        }

        setIsAuthenticated(true);

        if (!response.ok || result?.status !== true) {
          throw new Error(result?.message || "Unable to load enquiries.");
        }

        setEnquiries(Array.isArray(result.details) ? result.details : []);
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load enquiries. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsCheckingAccess(false);
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setError("");
    setCurrentPage(1);
    loadEnquiries();
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setIsSigningIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/enquiry/admin-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();

      if (!response.ok || result?.status !== true) {
        throw new Error(result?.message || "Unable to sign in.");
      }

      setPassword("");
      await loadEnquiries();
    } catch (requestError) {
      setLoginError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setError("");

    try {
      const response = await fetch("/api/enquiry/admin-session", {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || result?.status !== true) {
        throw new Error(result?.message || "Unable to sign out.");
      }

      setIsAuthenticated(false);
      setEnquiries([]);
      setCurrentPage(1);
      setLoginError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign out. Please try again."
      );
    }
  };

  if (isCheckingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-600" role="status">
          Checking admin access...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            MasterMind Academy
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the admin password to view submitted enquiries.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Admin password
              </span>
              <input
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            {loginError && (
              <p className="text-sm text-red-600" role="alert">
                {loginError}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSigningIn}
              type="submit"
            >
              {isSigningIn ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              MasterMind Academy
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Enquiry inbox
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {enquiries.length}{" "}
              {enquiries.length === 1 ? "enquiry" : "enquiries"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              disabled={isLoading}
              onClick={handleRefresh}
              type="button"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              onClick={handleSignOut}
              type="button"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <div
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="font-semibold underline"
              onClick={handleRefresh}
              type="button"
            >
              Try again
            </button>
          </div>
        )}

        {isLoading && enquiries.length === 0 ? (
          <p
            className="py-16 text-center text-sm text-slate-600"
            role="status"
          >
            Loading enquiries...
          </p>
        ) : enquiries.length === 0 && !error ? (
          <section className="mt-6 rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No enquiries yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              New submissions will appear here.
            </p>
          </section>
        ) : (
          <section
            aria-label="Submitted enquiries"
            className="mt-6 grid gap-5 lg:grid-cols-2"
          >
            {visibleEnquiries.map((enquiry, index) => (
              <article
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                key={enquiry?.id ?? `${enquiry?.email}-${firstVisibleEnquiry + index}`}
              >
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {enquiry?.firstname || "Unnamed enquiry"}
                    </h2>
                    {enquiry?.date && (
                      <p className="mt-1 text-xs text-slate-500">
                        {enquiry.date}
                      </p>
                    )}
                  </div>
                  {enquiry?.id != null && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      #{enquiry.id}
                    </span>
                  )}
                </header>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <EnquiryDetail label="Email">
                    {enquiry?.email ? (
                      <a
                        className="break-all text-blue-700 hover:underline"
                        href={`mailto:${enquiry.email}`}
                      >
                        {enquiry.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </EnquiryDetail>
                  <EnquiryDetail label="Mobile">
                    {enquiry?.mobile ? (
                      <a
                        className="text-blue-700 hover:underline"
                        href={`tel:${enquiry.mobile}`}
                      >
                        {enquiry.mobile}
                      </a>
                    ) : (
                      "—"
                    )}
                  </EnquiryDetail>
                  <EnquiryDetail label="Course">
                    {enquiry?.course || "—"}
                  </EnquiryDetail>
                  <EnquiryDetail label="Address">
                    {enquiry?.address || "—"}
                  </EnquiryDetail>
                </dl>

                <div className="mt-5 space-y-4">
                  <EnquiryText label="Message" value={enquiry?.message} />
                  {enquiry?.reply && (
                    <EnquiryText label="Reply" value={enquiry.reply} />
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {enquiries.length > 0 && (
          <nav
            aria-label="Enquiry pagination"
            className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"
          >
            <p className="text-sm text-slate-600" aria-live="polite">
              Showing {firstVisibleEnquiry + 1}–
              {Math.min(firstVisibleEnquiry + ENQUIRIES_PER_PAGE, enquiries.length)}{" "}
              of {enquiries.length} enquiries
            </p>

            <div className="flex items-center gap-1">
              <button
                aria-label="Previous page"
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={displayedPage === 1}
                onClick={() => setCurrentPage(displayedPage - 1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {pageNumbers.map((page, index) => (
                <span className="flex items-center gap-1" key={page}>
                  {index > 0 && page - pageNumbers[index - 1] > 1 && (
                    <span
                      aria-hidden="true"
                      className="px-1 text-sm text-slate-400"
                    >
                      ...
                    </span>
                  )}
                  <button
                    aria-current={page === displayedPage ? "page" : undefined}
                    aria-label={`Page ${page}`}
                    className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                      page === displayedPage
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => setCurrentPage(page)}
                    type="button"
                  >
                    {page}
                  </button>
                </span>
              ))}

              <button
                aria-label="Next page"
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={displayedPage === totalPages}
                onClick={() => setCurrentPage(displayedPage + 1)}
                type="button"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </nav>
        )}
      </div>
    </main>
  );
}

function EnquiryDetail({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{children}</dd>
    </div>
  );
}

function EnquiryText({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h3>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}
