"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Loader2,
  PackageOpen,
  RefreshCw,
  X,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not available";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getTransactionId(transaction) {
  const id = String(transaction?.id ?? "");
  return /^[1-9]\d*$/.test(id) ? id : "";
}

function getSuccessfulStatus(value) {
  return ["1", "true", "paid", "success", "successful"].includes(
    String(value ?? "").trim().toLowerCase()
  );
}

export default function PurchasedPackagesModal({
  onClose,
  onTransactionsLoaded,
}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const requestTransactions = useCallback(async () => {
    const response = await fetch("/api/student/transactions", {
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok || result?.status !== true) {
      throw new Error(result?.message || "Unable to load purchased packages.");
    }

    return Array.isArray(result.data) ? result.data : [];
  }, []);

  useEffect(() => {
    let active = true;

    requestTransactions()
      .then((items) => {
        if (!active) return;
        setTransactions(items);
        onTransactionsLoaded?.(items);
        setSelectedId("");
        setDetails(null);
        setDetailsError("");
      })
      .catch((loadError) => {
        if (!active) return;
        console.error("Purchased packages:", loadError);
        setError(loadError?.message || "Unable to load purchased packages.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onTransactionsLoaded, requestTransactions]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const items = await requestTransactions();
      setTransactions(items);
      onTransactionsLoaded?.(items);
      setSelectedId("");
      setDetails(null);
      setDetailsError("");
    } catch (loadError) {
      console.error("Purchased packages:", loadError);
      setError(loadError?.message || "Unable to load purchased packages.");
    } finally {
      setLoading(false);
    }
  }, [onTransactionsLoaded, requestTransactions]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function showDetails(transaction) {
    const id = getTransactionId(transaction);
    if (!id) {
      setDetailsError("This purchase does not have a valid transaction ID.");
      return;
    }

    setSelectedId(id);
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await fetch(
        `/api/student/transactions?tid=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      );
      const result = await response.json();

      if (!response.ok || result?.status !== true || !result.transaction) {
        throw new Error(result?.message || "Unable to load transaction details.");
      }

      setDetails(result.transaction);
    } catch (loadError) {
      console.error("Purchased package details:", loadError);
      setDetailsError(loadError?.message || "Unable to load transaction details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        aria-labelledby="purchased-packages-title"
        role="dialog"
        className="flex max-h-[min(760px,92vh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <PackageOpen size={21} />
            </span>
            <div>
              <h2 id="purchased-packages-title" className="text-base font-black text-slate-900">
                My purchases
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Your purchased packages and payment details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadTransactions}
              disabled={loading}
              aria-label="Refresh purchases"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close purchases"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div>
            <p className="mb-3 px-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Packages ({transactions.length})
            </p>

            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                Loading purchases...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={loadTransactions}
                  className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm"
                >
                  Try again
                </button>
              </div>
            ) : transactions.length ? (
              <ul className="space-y-3">
                {transactions.map((transaction, index) => {
                  const id = getTransactionId(transaction);
                  const isSelected = id && selectedId === id;
                  const successful = getSuccessfulStatus(transaction.status);
                  const detail = details || (isSelected ? transaction : null);

                  return (
                    <li key={id || `${transaction.pid || "purchase"}-${index}`}>
                      <div
                        className={`rounded-2xl border p-3.5 transition ${
                          isSelected
                            ? "border-emerald-200 bg-emerald-50/70"
                            : successful
                              ? "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => showDetails(transaction)}
                          disabled={!id}
                          aria-pressed={Boolean(isSelected)}
                          className="w-full text-left disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-extrabold text-slate-800">
                                {transaction.package || "Purchased package"}
                              </span>
                              <span className="mt-1 block text-[11px] font-medium text-slate-500">
                                {transaction.duration || "Duration unavailable"}
                              </span>
                            </span>
                            <span className="shrink-0 text-sm font-black text-slate-800">
                              {formatAmount(transaction.amount ?? transaction.price)}
                            </span>
                          </span>
                          <span className="mt-3 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                              <CalendarDays size={13} />
                              {formatDate(transaction.starting_date)}
                            </span>
                            <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${
                              successful ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {successful ? "Successful" : "Pending"}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedId("");
                              setDetails(null);
                              setDetailsError("");
                            } else {
                              showDetails(transaction);
                            }
                          }}
                          disabled={!id}
                          aria-expanded={Boolean(isSelected)}
                          className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSelected ? "Hide details" : "View details"}
                        </button>
                      </div>
                      {isSelected ? (
                        <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
                          {detailsLoading ? (
                            <div className="flex min-h-20 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                              <Loader2 size={17} className="animate-spin" />
                              Loading details...
                            </div>
                          ) : detailsError ? (
                            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                              {detailsError}
                            </p>
                          ) : detail ? (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                                    Purchase details
                                  </p>
                                  <h3 className="mt-1 text-base font-black leading-snug text-slate-900">
                                    {detail.package || transaction.package || "Purchased package"}
                                  </h3>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${
                                  getSuccessfulStatus(detail.status)
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}>
                                  {getSuccessfulStatus(detail.status) ? "Successful" : "Pending"}
                                </span>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                <div className="rounded-xl bg-white p-3">
                                  <p className="text-[10px] font-bold text-slate-400">Amount paid</p>
                                  <p className="mt-1 text-sm font-black text-slate-800">
                                    {formatAmount(detail.amount ?? detail.price ?? transaction.amount ?? transaction.price)}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-white p-3">
                                  <p className="text-[10px] font-bold text-slate-400">Duration</p>
                                  <p className="mt-1 text-sm font-black text-slate-800">
                                    {detail.duration || transaction.duration || "Not available"}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-white p-3">
                                  <p className="text-[10px] font-bold text-slate-400">Valid from</p>
                                  <p className="mt-1 text-xs font-extrabold text-slate-800">
                                    {formatDate(detail.starting_date || transaction.starting_date)}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-white p-3">
                                  <p className="text-[10px] font-bold text-slate-400">Expires on</p>
                                  <p className="mt-1 text-xs font-extrabold text-slate-800">
                                    {formatDate(detail.expiry_date || transaction.expiry_date)}
                                  </p>
                                </div>
                                {detail.gst != null ? (
                                  <div className="rounded-xl bg-white p-3">
                                    <p className="text-[10px] font-bold text-slate-400">GST</p>
                                    <p className="mt-1 text-xs font-extrabold text-slate-800">
                                      {formatAmount(detail.gst)}
                                    </p>
                                  </div>
                                ) : null}
                                {detail.subtotal != null ? (
                                  <div className="rounded-xl bg-white p-3">
                                    <p className="text-[10px] font-bold text-slate-400">Subtotal</p>
                                    <p className="mt-1 text-xs font-extrabold text-slate-800">
                                      {formatAmount(detail.subtotal)}
                                    </p>
                                  </div>
                                ) : null}
                              </div>

                              <div className="mt-3 space-y-2 rounded-xl border border-emerald-100 bg-white p-3">
                                <div className="flex justify-between gap-4 text-xs">
                                  <span className="font-semibold text-slate-500">Transaction ID</span>
                                  <span className="max-w-[60%] break-all text-right font-bold text-slate-700">
                                    {detail.transaction_id || "Not available"}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4 text-xs">
                                  <span className="font-semibold text-slate-500">Purchased on</span>
                                  <span className="text-right font-bold text-slate-700">
                                    {formatDate(detail.created_at)}
                                  </span>
                                </div>
                                {detail.activation ? (
                                  <div className="flex justify-between gap-4 text-xs">
                                    <span className="font-semibold text-slate-500">Activation</span>
                                    <span className="text-right font-bold text-slate-700">{detail.activation}</span>
                                  </div>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-5 text-center">
                <PackageOpen size={28} className="text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">No purchases yet</p>
                <p className="mt-1 text-xs text-slate-500">Your purchased packages will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
