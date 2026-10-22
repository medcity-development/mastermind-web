"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Crown,
  IndianRupee,
  LoaderCircle,
  Percent,
  ReceiptText,
  ShoppingBag,
  X,
} from "lucide-react";

export default function PremiumPackagesModal({
  open,
  cid = 1,
  preferredPackage = {},
  onClose,
}) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);
  const autoOpenedPackageRef = useRef("");

  const openPackageDetails = useCallback(async (item) => {
    setSelectedPackage(item);
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await fetch(
        `/api/packages/details?cid=${encodeURIComponent(String(cid))}&pid=${encodeURIComponent(String(item.id))}`,
        { cache: "no-store" }
      );
      const result = await response.json();

      if (!response.ok || result?.status !== true) {
        throw new Error(
          result?.message || "Unable to load package details."
        );
      }

      setDetails(result.details);
      setSelectedPrice(result.details.priceOptions?.[0] || null);
    } catch (loadError) {
      setDetailsError(
        loadError?.message || "Unable to load package details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }, [cid]);

  const preferredMatch = useMemo(
    () => findPreferredPackage(packages, preferredPackage),
    [packages, preferredPackage]
  );
  const visiblePackages = preferredMatch ? [preferredMatch] : packages;

  useEffect(() => {
    if (!open) {
      autoOpenedPackageRef.current = "";
      return;
    }

    if (!preferredMatch || details || detailsLoading) {
      return;
    }

    const matchKey = `${preferredMatch.id}:${preferredPackage.id || ""}:${preferredPackage.name || ""}:${preferredPackage.courseId || ""}:${preferredPackage.courseName || ""}:${preferredPackage.testName || ""}`;
    if (autoOpenedPackageRef.current === matchKey) {
      return;
    }

    autoOpenedPackageRef.current = matchKey;
    openPackageDetails(preferredMatch);
  }, [
    details,
    detailsLoading,
    open,
    openPackageDetails,
    preferredMatch,
    preferredPackage,
  ]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const controller = new AbortController();

    async function loadPackages() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/packages?cid=${encodeURIComponent(String(cid))}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const result = await response.json();

        if (!response.ok || result?.status !== true) {
          throw new Error(
            result?.message || "Unable to load available plans."
          );
        }

        if (!controller.signal.aborted) {
          setPackages(
            Array.isArray(result.packages) ? result.packages : []
          );
        }
      } catch (loadError) {
        if (
          loadError?.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(
            loadError?.message || "Unable to load available plans."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPackages();
    return () => {
      controller.abort();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [cid, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-[#071f55]/65 px-3 py-5 backdrop-blur-sm sm:px-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-packages-title"
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-[#f5f9ff] shadow-2xl"
      >
        <header className="relative flex items-start justify-between gap-5 bg-gradient-to-r from-[#05176A] via-[#164fa5] to-[#017cc0] px-5 py-6 text-white sm:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider">
              <Crown size={13} />
              Premium plans
            </span>
            <h2
              id="premium-packages-title"
              className="mt-3 text-2xl font-black sm:text-3xl"
            >
              {details?.title || selectedPackage?.package || "Choose a plan"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              {details
                ? "Package details and available plan durations."
                : "Select a package to see its details and available plans."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close packages"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[calc(90vh-154px)] overflow-y-auto p-4 sm:p-7">
          {selectedPackage ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPackage(null);
                  setDetails(null);
                  setDetailsError("");
                  setSelectedPrice(null);
                }}
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                <ArrowLeft size={15} />
                All plans
              </button>
              {detailsLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-semibold text-slate-600">
                  <LoaderCircle size={20} className="animate-spin text-blue-700" />
                  Loading package details...
                </div>
              ) : detailsError ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700"
                >
                  {detailsError}
                </p>
              ) : details ? (
                <div className="space-y-4">
                  <div className="grid gap-4 rounded-2xl border border-blue-100 bg-white p-4 sm:grid-cols-[180px_1fr] sm:p-5">
                    <div className="relative flex min-h-36 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-sky-100">
                      {details.imageUrl ? (
                        <Image
                          src={details.imageUrl}
                          alt={details.title || "Premium package"}
                          fill
                          sizes="180px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <Crown size={40} className="text-blue-700" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      {details.tag ? (
                        <p className="text-xs font-bold text-blue-700">
                          {details.tag}
                        </p>
                      ) : null}
                      {details.premium ? (
                        <p className="mt-2 text-xs font-bold text-emerald-700">
                          This plan is active on your account
                          {details.packValid ? ` until ${details.packValid}` : ""}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {details.description || "Package details are not available."}
                      </p>
                      {details.courses?.length ? (
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <BookOpen size={15} className="text-blue-700" />
                          {details.courses.map((course) => course.title).join(", ")}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <section className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-5">
                    <h3 className="text-sm font-black text-[#071f55]">
                      Choose a validity plan
                    </h3>
                    {details.priceOptions?.length ? (
                      <>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {details.priceOptions.map((option, index) => (
                          <button
                            type="button"
                            key={option.id || `${option.validity}-${index}`}
                            aria-pressed={selectedPrice === option}
                            onClick={() => setSelectedPrice(option)}
                            className={`rounded-xl border p-4 text-left transition ${
                              selectedPrice === option
                                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                                : "border-blue-100 bg-[#f8fbff] hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <CalendarDays size={15} className="text-blue-700" />
                              {option.validity || `${option.days || ""} days`}
                            </div>
                            <p className="mt-3 text-2xl font-black text-[#071f55]">
                              ₹{option.current || option.final}
                            </p>
                            {option.original &&
                            Number(option.original) > Number(option.current || option.final) ? (
                              <p className="mt-1 text-xs text-slate-400 line-through">
                                ₹{option.original}
                              </p>
                            ) : null}
                            <p className="mt-2 text-[11px] font-semibold text-blue-700">
                              {selectedPrice === option ? "Selected" : "Select this plan"}
                            </p>
                          </button>
                        ))}
                      </div>
                      {selectedPrice ? (() => {
                        const amount = Number(selectedPrice.current || 0);
                        const originalAmount = Number(selectedPrice.original || 0);
                        const subtotal = Number(selectedPrice.subtotal || amount);
                        const gstRate = Number(selectedPrice.gst || 0);
                        const discountAmount = Math.max(0, originalAmount - amount);
                        const discountPercent = originalAmount > 0
                          ? Math.round((discountAmount / originalAmount) * 100)
                          : 0;
                        const gstAmount = (subtotal * gstRate) / 100;
                        const totalPayment = Number(selectedPrice.final || amount);
                        const formatAmount = (value) =>
                          new Intl.NumberFormat("en-IN", {
                            maximumFractionDigits: 2,
                          }).format(value);

                        return (
                          <div className="mt-4 rounded-xl border border-blue-100 bg-[#f8fbff] p-4 sm:p-5">
                            <h4 className="text-sm font-black text-[#071f55]">
                              Price details
                            </h4>
                            <div className="mt-3 divide-y divide-blue-100 text-xs">
                              <PriceRow
                                icon={<CalendarDays size={14} />}
                                label="Validity"
                                value={`${selectedPrice.validity || "-"}${selectedPrice.days ? ` (${selectedPrice.days} days)` : ""}`}
                              />
                              <PriceRow
                                icon={<IndianRupee size={14} />}
                                label="Original amount"
                                value={`₹${formatAmount(originalAmount || amount)}`}
                              />
                              <PriceRow
                                icon={<Percent size={14} />}
                                label={`Discount${discountPercent ? ` (${discountPercent}% off)` : ""}`}
                                value={`− ₹${formatAmount(discountAmount)}`}
                                valueClassName="text-emerald-700"
                              />
                              <PriceRow
                                icon={<ReceiptText size={14} />}
                                label="Subtotal"
                                value={`₹${formatAmount(subtotal)}`}
                              />
                              <PriceRow
                                icon={<Percent size={14} />}
                                label={`GST (${formatAmount(gstRate)}%)`}
                                value={`₹${formatAmount(gstAmount)}`}
                              />
                              <PriceRow
                                icon={<IndianRupee size={14} />}
                                label="Total payment"
                                value={`₹${formatAmount(totalPayment)}`}
                                emphasized
                              />
                            </div>
                            <button
                              type="button"
                              disabled
                              title="Payment setup will be connected later."
                              className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#164fa5] to-[#017cc0] px-5 text-xs font-black text-white opacity-60"
                            >
                              <ShoppingBag size={15} />
                              Proceed to payment
                            </button>
                            <p className="mt-2 text-center text-[11px] text-slate-500">
                              Online payment will be available soon.
                            </p>
                          </div>
                        );
                      })() : null}
                      </>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        No active pricing options are available.
                      </p>
                    )}
                  </section>

                  {details.features?.length ? (
                    <section className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-5">
                      <h3 className="text-sm font-black text-[#071f55]">
                        What&apos;s included
                      </h3>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {details.features.map((feature, index) => (
                          <li
                            key={`${feature}-${index}`}
                            className="flex items-start gap-2 text-xs leading-5 text-slate-600"
                          >
                            <CheckCircle2
                              size={15}
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : loading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-semibold text-slate-600">
              <LoaderCircle size={20} className="animate-spin text-blue-700" />
              Loading available plans...
            </div>
          ) : error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          ) : visiblePackages.length === 0 ? (
            <p className="rounded-2xl border border-blue-100 bg-white p-6 text-center text-sm text-slate-600">
              No plans are currently available for this exam.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePackages.map((item) => (
                <article
                  key={item.id}
                  className="flex min-h-56 flex-col rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                >
                  <div className="relative h-24 overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-sky-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.package || "Premium plan"}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-blue-700">
                        <Crown size={34} strokeWidth={1.8} />
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shadow-sm">
                      <Crown size={16} />
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-black text-[#071f55]">
                    {item.package}
                  </h3>
                  {item.tag ? (
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
                      {item.tag}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openPackageDetails(item)}
                    className="mt-auto flex w-full items-center justify-between gap-2 pt-5 text-left text-xs font-black text-blue-700 hover:text-blue-900"
                  >
                    <span>View details</span>
                    <ArrowRight size={15} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function normalizeMatch(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findPreferredPackage(packages, preferredPackage) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return null;
  }

  const preferredId = String(preferredPackage?.id ?? "").trim();
  if (preferredId) {
    const byId = packages.find(
      (item) => String(item.id) === preferredId
    );
    if (byId) return byId;
  }

  const preferredName = normalizeMatch(preferredPackage?.name);
  if (preferredName) {
    const byName = packages.find(
      (item) => normalizeMatch(item.package) === preferredName
    );
    if (byName) return byName;
  }

  const preferredCourseId = String(
    preferredPackage?.courseId ?? ""
  ).trim();
  if (preferredCourseId) {
    const byCourseId = packages.find(
      (item) => String(item.courseId ?? "").trim() === preferredCourseId
    );
    if (byCourseId) return byCourseId;
  }

  const courseName = normalizeMatch(preferredPackage?.courseName);
  if (courseName && !/^\d+$/.test(courseName)) {
    const byCourseName = packages.find((item) => {
      const packageValues = [item.package, item.tag, item.course]
        .map(normalizeMatch)
        .filter((value) => value && !/^\d+$/.test(value));

      return packageValues.some(
        (value) =>
          value === courseName ||
          value.includes(courseName) ||
          courseName.includes(value)
      );
    });

    if (byCourseName) return byCourseName;
  }

  const testName = normalizeMatch(preferredPackage?.testName);
  if (!testName) {
    return null;
  }

  return packages.find((item) => {
    const packageName = normalizeMatch(item.package);
    return packageName && (
      testName === packageName ||
      testName.includes(packageName) ||
      packageName.includes(testName)
    );
  }) || null;
}

function PriceRow({
  icon,
  label,
  value,
  valueClassName = "text-slate-700",
  emphasized = false,
}) {
  return (
    <div className={`flex items-center justify-between gap-3 py-3 ${emphasized ? "text-sm font-black" : ""}`}>
      <span className="flex items-center gap-2 text-slate-600">
        <span className="text-blue-700">{icon}</span>
        {label}
      </span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
