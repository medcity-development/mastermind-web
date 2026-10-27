

"use client";



import {

  useCallback,

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

import { useRouter } from "next/navigation";



import {

  ArrowLeft,

  BookOpen,

  CalendarDays,

  CheckCircle2,

  Crown,

  LoaderCircle,

  LockKeyhole,

  ReceiptText,

  RefreshCw,

  ShieldCheck,

  ShoppingBag,

  X,

} from "lucide-react";



const LOCKED_STATES = new Set([

  "checking",

  "creating",

  "processing",

  "checkout_created",

  "verifying",

  "captured_pending",

  "activated",

  "unknown",

]);



function money(value) {

  return new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 2,

  }).format(Number(value) || 0);

}



function packageId(item) {

  return item?.id ?? item?.pid ?? item?.package_id;

}



function packageName(item) {

  return (

    item?.title ||

    item?.package_name ||

    item?.package ||

    item?.name ||

    "Premium Package"

  );

}



function priceTotal(price) {

  return Number(

    price?.final ??

    price?.total ??

    price?.current ??

    price?.subtotal ??

    0

  );

}



function packageImage(item, iconPath = "") {

  if (item?.imageUrl) return String(item.imageUrl);

  const icon = String(item?.icon || "").trim();



  if (!icon) return "";



  if (/^https?:\/\//i.test(icon)) {

    return icon;

  }



  const base = String(iconPath).trim();



  if (!base) return "";



  return `${base.replace(/\/+$/, "")}/${icon.replace(/^\/+/, "")}`;

}



async function requestJson(url, options = {}) {

  const response = await fetch(url, {

    cache: "no-store",

    ...options,

  });



  const result = await response.json().catch(() => {

    throw new Error("Invalid server response.");

  });



  return { response, result };

}



async function loadRazorpay() {

  if (window.Razorpay) return;



  await new Promise((resolve, reject) => {

    const src =

      "https\://checkout.razorpay.com/v1/checkout.js";



    let script = document.querySelector(

      `script[src="${src}"]`

    );



    if (!script) {

      script = document.createElement("script");

      script.src = src;

      script.async = true;

      document.body.appendChild(script);

    }



    if (window.Razorpay) {

      resolve();

      return;

    }



    script.addEventListener("load", resolve, {

      once: true,

    });



    script.addEventListener(

      "error",

      () => reject(

        new Error("Unable to load Razorpay.")

      ),

      { once: true }

    );

  });

}



function statusMessage(state) {

  switch (state) {

    case "checking":

      return "Checking previous payment status.";



    case "processing":

    case "creating":

      return "Preparing payment. Please wait.";



    case "verifying":

      return "Verifying your payment.";



    case "checkout_created":

      return "An earlier checkout is pending. Its payment status must be confirmed before another checkout.";



    case "captured_pending":

      return "Payment received. Package activation is pending. Do not pay again.";



    case "unknown":

      return "Payment status could not be confirmed. Do not pay again until it is resolved.";



    default:

      return "";

  }

}



export default function PremiumPackagesModal({

  open,

  cid = 1,

  preferredPackage = {},

  governmentExamsSlug,

  onClose,

}) {

  const [packages, setPackages] = useState([]);

  const [iconPath, setIconPath] = useState("");

  const [packagesLoading, setPackagesLoading] =

    useState(false);

  const [packagesError, setPackagesError] =

    useState("");



  const [selectedPackage, setSelectedPackage] =

    useState(null);

  const [details, setDetails] = useState(null);

  const [detailsLoading, setDetailsLoading] =

    useState(false);

  const [detailsError, setDetailsError] =

    useState("");



  const [selectedPrice, setSelectedPrice] =

    useState(null);



  const [promocode, setPromocode] = useState("");

  const [appliedPromo, setAppliedPromo] =

    useState(null);

  const [promoLoading, setPromoLoading] =

    useState(false);

  const [promoError, setPromoError] = useState("");



  const [paymentState, setPaymentState] =

    useState("checking");

  const [paymentLoading, setPaymentLoading] =

    useState(false);

  const [paymentError, setPaymentError] =

    useState("");

  const [validUntil, setValidUntil] =

    useState(null);



  const selectedIdRef = useRef(null);

  const autoOpenedRef = useRef(null);
  const detailsVersionRef = useRef(0);

  const promoVersionRef = useRef(0);

  const statusVersionRef = useRef(0);

  const paymentInProgressRef = useRef(false);



  const selectedId = packageId(selectedPackage);



  const router = useRouter();

  const purchased = paymentState === "activated";



  const locked =

    paymentLoading ||

    promoLoading ||

    LOCKED_STATES.has(paymentState);



  const resetPromo = useCallback(() => {

    promoVersionRef.current += 1;

    setPromocode("");

    setAppliedPromo(null);

    setPromoError("");

    setPromoLoading(false);

  }, []);



  const backToPackages = () => {

    if (paymentInProgressRef.current) return;



    statusVersionRef.current += 1;

    selectedIdRef.current = null;



    setSelectedPackage(null);

    setDetails(null);

    setSelectedPrice(null);

    setPaymentState("checking");

    setPaymentError("");

    setValidUntil(null);

    resetPromo();

  };



  const continueLearning = () => {

    onClose?.();



    if (governmentExamsSlug) {

      router.push(

        `/dashboard/${governmentExamsSlug}`

      );

    }

  };



  useEffect(() => {

    if (!open) return;



    const controller = new AbortController();



    async function loadPackages() {

      setPackagesLoading(true);

      setPackagesError("");



      try {

        const { response, result } =

          await requestJson(

            `/api/packages?cid=${encodeURIComponent(cid)}`,

            { signal: controller.signal }

          );



        if (

          !response.ok ||

          result?.status !== true

        ) {

          throw new Error(

            result?.message ||

            "Unable to load packages."

          );

        }



        if (!controller.signal.aborted) {

          setPackages(

            Array.isArray(result.packages)

              ? result.packages

              : []

          );



          setIconPath(

            result?.icon_path ||

            result?.iconPath ||

            ""

          );

        }

      } catch (error) {

        if (!controller.signal.aborted) {

          setPackagesError(error.message);

        }

      } finally {

        if (!controller.signal.aborted) {

          setPackagesLoading(false);

        }

      }

    }



    loadPackages();



    return () => controller.abort();

  }, [open, cid]);



  useEffect(() => {

    if (!open) return;



    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";



    return () => {

      document.body.style.overflow = previous;

    };

  }, [open]);



  const checkPaymentStatus = useCallback(

    async (pid) => {

      const id = String(pid);

      const version = ++statusVersionRef.current;



      const isCurrent = () =>

        selectedIdRef.current === id &&

        statusVersionRef.current === version;



      setPaymentState("checking");

      setPaymentError("");



      try {

        const { response, result } =

          await requestJson(

            `/api/payments/razorpay/status?cid=${encodeURIComponent(cid)}&pid=${encodeURIComponent(pid)}`

          );



        if (!isCurrent()) return;



        if (

          !response.ok ||

          result?.status !== true

        ) {

          setPaymentState("unknown");

          setPaymentError(

            result?.message ||

            "Unable to verify previous payment."

          );

          return;

        }



        const state = String(

          result?.state || "unknown"

        );



        if (state === "activated") {

          setPaymentState("activated");

          setValidUntil(

            result?.validUntil ||

            result?.expiryDate ||

            null

          );

          setPaymentError("");

          return;

        }



        if (

          state === "none" &&

          result?.locked === false

        ) {

          setPaymentState("none");

          setPaymentError("");

          return;

        }



        setPaymentState(

          LOCKED_STATES.has(state)

            ? state

            : "unknown"

        );



        setPaymentError(

          result?.message ||

          statusMessage(state)

        );

      } catch (error) {

        if (!isCurrent()) return;



        setPaymentState("unknown");

        setPaymentError(

          "Payment status is unavailable. Do not pay again until it is confirmed."

        );

      }

    },

    [cid]

  );



  const openPackageDetails = useCallback(

    async (item) => {

      const pid = packageId(item);



      if (!/^[1-9]\d*$/.test(String(pid))) {

        return;

      }



      if (paymentInProgressRef.current) return;
      const detailsVersion = ++detailsVersionRef.current;
      selectedIdRef.current = String(pid);



      setSelectedPackage(item);

      setDetails(null);

      setSelectedPrice(null);

      setDetailsLoading(true);

      setDetailsError("");

      setPaymentState("checking");

      setPaymentError("");

      setValidUntil(null);



      resetPromo();



      const detailsPromise = requestJson(

        `/api/packages/details?cid=${encodeURIComponent(cid)}&pid=${encodeURIComponent(pid)}`

      );



      const statusPromise = checkPaymentStatus(pid);



      try {

        const { response, result } =

          await detailsPromise;



        if (

          selectedIdRef.current !== String(pid) ||
          detailsVersionRef.current !== detailsVersion

        ) {

          return;

        }



        if (

          !response.ok ||

          result?.status !== true

        ) {

          throw new Error(

            result?.message ||

            "Unable to load package details."

          );

        }



        const packageDetails = result?.details;



        if (!packageDetails) {

          throw new Error(

            "Package details are unavailable."

          );

        }



        setDetails(packageDetails);



        setSelectedPrice(

          Array.isArray(

            packageDetails.priceOptions

          )

            ? packageDetails.priceOptions[0] || null

            : null

        );

      } catch (error) {

        if (

          selectedIdRef.current === String(pid) &&
          detailsVersionRef.current === detailsVersion

        ) {

          setDetailsError(error.message);

        }

      } finally {

        if (

          selectedIdRef.current === String(pid) &&
          detailsVersionRef.current === detailsVersion

        ) {

          setDetailsLoading(false);

        }

      }



      await statusPromise;

    },

    [cid, checkPaymentStatus, resetPromo]

  );



  const preferredMatch = useMemo(() => {

    const id = String(

      preferredPackage?.id ?? ""

    ).trim();



    const name = String(

      preferredPackage?.name ?? ""

    ).trim().toLowerCase();



    return (

      packages.find(

        (item) =>

          id &&

          String(packageId(item)) === id

      ) ||

      packages.find(

        (item) =>

          name &&

          packageName(item).toLowerCase() === name

      ) ||

      null

    );

  }, [packages, preferredPackage]);



  useEffect(() => {

    if (!open || !preferredMatch) return;



    const id = String(packageId(preferredMatch));



    if (autoOpenedRef.current === id) return;



    autoOpenedRef.current = id;

    openPackageDetails(preferredMatch);

  }, [open, preferredMatch, openPackageDetails]);



  useEffect(() => {

    if (!open) {

      autoOpenedRef.current = null;

    }

  }, [open]);



  const pricing = useMemo(() => {

    if (!selectedPrice) return null;



    const subtotal = Number(

      selectedPrice?.subtotal ??

      selectedPrice?.current ??

      0

    );



    const gstRate = Number(

      selectedPrice?.gst ?? 0

    );



    if (

      appliedPromo &&

      String(appliedPromo.priceId) ===

        String(selectedPrice.id)

    ) {

      return {

        subtotal,

        discount: Number(

          appliedPromo.discountAmount || 0

        ),

        gstRate: Number(

          appliedPromo.gstRate ?? gstRate

        ),

        gstAmount: Number(

          appliedPromo.gstAmount || 0

        ),

        total: Number(appliedPromo.total),

      };

    }



    return {

      subtotal,

      discount: 0,

      gstRate,

      gstAmount:

        Math.round(subtotal * gstRate) / 100,

      total: priceTotal(selectedPrice),

    };

  }, [selectedPrice, appliedPromo]);



  const applyPromocode = async (event) => {

    event.preventDefault();



    if (

      locked ||

      !selectedPackage ||

      !selectedPrice

    ) {

      return;

    }



    const code = promocode.trim();



    if (!code) {

      setPromoError("Enter a promocode.");

      return;

    }



    const version = ++promoVersionRef.current;

    const pid = String(selectedId);

    const priceId = String(selectedPrice.id);



    setPromoLoading(true);

    setPromoError("");

    setAppliedPromo(null);



    try {

      const { response, result } =

        await requestJson(

          "/api/payments/razorpay/promocode",

          {

            method: "POST",

            headers: {

              "Content-Type": "application/json",

            },

            body: JSON.stringify({

              cid,

              pid: selectedId,

              priceId: selectedPrice.id,

              promocode: code,

            }),

          }

        );



      if (

        !response.ok ||

        result?.status !== true

      ) {

        throw new Error(

          result?.message ||

          "This promocode is not valid."

        );

      }



      if (

        version === promoVersionRef.current &&

        selectedIdRef.current === pid

      ) {

        setAppliedPromo({

          ...result,

          priceId,

        });

      }

    } catch (error) {

      if (

        version === promoVersionRef.current

      ) {

        setPromoError(error.message);

      }

    } finally {

      if (

        version === promoVersionRef.current

      ) {

        setPromoLoading(false);

      }

    }

  };



  const proceedToPayment = async () => {

    if (

      locked ||

      !selectedPackage ||

      !selectedPrice ||

      paymentInProgressRef.current ||

      (promocode.trim() && !appliedPromo)

    ) {

      return;

    }



    paymentInProgressRef.current = true;

    setPaymentLoading(true);

    setPaymentState("processing");

    setPaymentError("");



    try {

      const status = await requestJson(

        `/api/payments/razorpay/status?cid=${encodeURIComponent(cid)}&pid=${encodeURIComponent(selectedId)}`

      );



      if (

        !status.response.ok ||

        status.result?.status !== true

      ) {

        setPaymentState("unknown");

        throw new Error(

          "Unable to confirm previous payment status."

        );

      }



      if (

        status.result?.state === "activated"

      ) {

        setPaymentState("activated");
        paymentInProgressRef.current = false;
        setPaymentLoading(false);

        return;

      }



      if (

        status.result?.state !== "none" ||

        status.result?.locked !== false

      ) {

        setPaymentState(

          status.result?.state || "unknown"

        );

        throw new Error(

          "A previous payment may be pending. Do not pay again."

        );

      }



      const { response, result } =

        await requestJson(

          "/api/payments/razorpay/order",

          {

            method: "POST",

            headers: {

              "Content-Type": "application/json",

            },

            body: JSON.stringify({

              cid,

              pid: selectedId,

              priceId: selectedPrice.id,

              promocode:

                appliedPromo?.promocode || "",

            }),

          }

        );



      if (

        !response.ok ||

        result?.status !== true

      ) {

        setPaymentState("unknown");

        throw new Error(

          result?.message ||

          "Unable to create payment order."

        );

      }



      setPaymentState("checkout_created");



      await loadRazorpay();



      const checkout = new window.Razorpay({

        key: result.keyId,

        order_id: result.order.id,

        amount: result.order.amount,

        currency: result.order.currency,



        name: "MasterMind Academy",

        description:

          packageName(selectedPackage),



        prefill: {

          name: result.student?.name || "",

          email: result.student?.email || "",

        },



        theme: {

          color: "#164fa5",

        },



        handler: async (payment) => {

          setPaymentState("verifying");

          setPaymentLoading(true);



          try {

            const verification =

              await requestJson(

                "/api/payments/razorpay/verify",

                {

                  method: "POST",

                  headers: {

                    "Content-Type":

                      "application/json",

                  },

                  body: JSON.stringify({

                    razorpay_order_id:

                      payment.razorpay_order_id,

                    razorpay_payment_id:

                      payment.razorpay_payment_id,

                    razorpay_signature:

                      payment.razorpay_signature,

                    cid,

                    pid: selectedId,

                    priceId: selectedPrice.id,

                  }),

                }

              );



            const data = verification.result;



            if (

              !verification.response.ok ||

              data?.status !== true ||

              data?.packageActivated !== true

            ) {

              setPaymentState(

                data?.paymentReceived

                  ? "captured_pending"

                  : "unknown"

              );



              throw new Error(

                data?.message ||

                "Payment activation could not be confirmed. Do not pay again."

              );

            }



            setPaymentState("activated");

            router.refresh();

            setValidUntil(

              data?.validUntil || null

            );

            setPaymentError("");



            window.dispatchEvent(

              new Event(

                "mastermind:package-activated"

              )

            );

          } catch (error) {

            setPaymentError(error.message);

          } finally {

            setPaymentLoading(false);

            paymentInProgressRef.current = false;

          }

        },



        modal: {

          ondismiss: () => {

            setPaymentLoading(false);

            paymentInProgressRef.current = false;



            setPaymentState((current) =>

              current === "activated" ||

              current === "captured_pending"

                ? current

                : "checkout_created"

            );

          },

        },

      });



      checkout.open();
      setPaymentLoading(false);
    } catch (error) {
      setPaymentError(error.message);
      setPaymentLoading(false);
      paymentInProgressRef.current = false;
      setPaymentState((state) => state === "processing" ? "unknown" : state);
    }

  };



  if (!open) return null;



  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#f4f7fc] shadow-2xl">



        {/* HEADER */}

        <div className="shrink-0 bg-gradient-to-r from-[#071a61] via-[#174fa7] to-[#0089c8] px-5 py-6 text-white sm:px-8">

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-start gap-3">

              {selectedPackage && (

                <button

                  type="button"

                  onClick={backToPackages}

                  disabled={paymentLoading}

                  className="mt-1 rounded-lg bg-white/10 p-2 hover:bg-white/20"

                  aria-label="Back to packages"

                >

                  <ArrowLeft size={18} />

                </button>

              )}



              <div>

                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">

                  <Crown size={14} />

                  PREMIUM PLANS

                </span>



                <h2 className="text-xl font-extrabold sm:text-3xl">

                  {selectedPackage

                    ? packageName(selectedPackage)

                    : "Upgrade Your Learning"}

                </h2>



                <p className="mt-2 text-sm text-blue-100">

                  {purchased

                    ? "Your premium package is active."

                    : selectedPackage

                      ? "Package details and available plan durations."

                      : "Choose the premium package that suits your preparation."}

                </p>

              </div>

            </div>



            <button

              type="button"

              onClick={onClose}

              className="rounded-full bg-white/15 p-2.5 hover:bg-white/25"

              aria-label="Close modal"

            >

              <X size={19} />

            </button>

          </div>

        </div>



        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">



          {!selectedPackage ? (

            <>

              {packagesLoading && (

                <div className="flex justify-center py-16">

                  <LoaderCircle className="animate-spin text-blue-600" />

                </div>

              )}



              {packagesError && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                  {packagesError}

                </div>

              )}



              {!packagesLoading &&

                !packagesError &&

                packages.length === 0 && (

                  <p className="py-12 text-center text-slate-500">

                    No premium packages available.

                  </p>

                )}



              <div className="grid gap-4 md:grid-cols-2">

                {packages.map((item) => {

                  const image = packageImage(

                    item,

                    iconPath

                  );



                  return (

                    <button

                      key={packageId(item)}

                      type="button"

                      onClick={() =>

                        openPackageDetails(item)

                      }

                      className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-lg"

                    >

                      <div className="flex items-center gap-4">

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50">

                          {image ? (

                            <img

                              src={image}

                              alt={packageName(item)}

                              className="h-full w-full object-cover"

                            />

                          ) : (

                            <BookOpen

                              size={26}

                              className="text-blue-700"

                            />

                          )}

                        </div>



                        <div className="min-w-0">

                          <h3 className="font-bold text-slate-900">

                            {packageName(item)}

                          </h3>



                          <p className="mt-1 text-xs text-slate-500">

                            Premium learning package

                          </p>

                        </div>

                      </div>



                      <div className="mt-5 flex items-center justify-between text-sm font-semibold text-blue-700">

                        <span>View package details</span>

                        <ShoppingBag size={18} />

                      </div>

                    </button>

                  );

                })}

              </div>

            </>

          ) : (

            <div className="space-y-4">



              {detailsLoading && (

                <div className="flex justify-center py-12">

                  <LoaderCircle className="animate-spin text-blue-600" />

                </div>

              )}



              {detailsError && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                  {detailsError}

                </div>

              )}



              {/* ALREADY PURCHASED */}

              {purchased ? (

                <section className="rounded-3xl border border-emerald-200 bg-white px-5 py-10 text-center shadow-sm sm:px-10">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">

                    <CheckCircle2

                      size={44}

                      className="text-emerald-600"

                    />

                  </div>



                  <div className="mt-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700">

                    Active Premium Package

                  </div>



                  <h3 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">

                    You have already purchased this package!

                  </h3>



                  <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600">

                    Your subscription to{" "}

                    <strong>

                      {packageName(selectedPackage)}

                    </strong>{" "}

                    is active. You can continue learning

                    without making another payment.

                  </p>



                  {validUntil && (

                    <p className="mt-4 text-sm font-semibold text-emerald-700">

                      Valid until: {validUntil}

                    </p>

                  )}



                  <button

                    type="button"

                    onClick={continueLearning}

                    className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#164fa5] to-[#0089c8] px-7 py-3.5 font-bold text-white hover:brightness-110"

                  >

                    <BookOpen size={18} />

                    Continue Learning

                  </button>



                  <p className="mt-5 text-xs text-slate-500">

                    No additional payment is required

                    for this active package.

                  </p>

                </section>

              ) : (

                <>

                  {details && !detailsLoading && (

                    <>

                      {/* DURATION */}

                      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">

                        <div className="mb-4 flex items-center gap-2">

                          <CalendarDays

                            size={19}

                            className="text-blue-700"

                          />

                          <h3 className="font-bold text-slate-900">

                            Select Plan Duration

                          </h3>

                        </div>



                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                          {(details.priceOptions || []).map(

                            (price) => {

                              const active =

                                String(selectedPrice?.id) ===

                                String(price.id);



                              return (

                                <button

                                  key={price.id}

                                  type="button"

                                  disabled={locked}

                                  onClick={() => {

                                    setSelectedPrice(price);

                                    resetPromo();

                                  }}

                                  className={`rounded-xl border-2 p-4 text-left transition ${

                                    active

                                      ? "border-blue-600 bg-blue-50"

                                      : "border-slate-200 hover:border-blue-300"

                                  } disabled:opacity-60`}

                                >

                                  <div className="flex items-center justify-between gap-2">

                                    <span className="font-bold text-slate-800">

                                      {price.validity ||

                                        `${price.days} Days`}

                                    </span>



                                    {active && (

                                      <CheckCircle2

                                        size={18}

                                        className="text-blue-600"

                                      />

                                    )}

                                  </div>



                                  <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                    <span className="text-xl font-extrabold text-[#071a61]">
                                      {money(priceTotal(price))}
                                    </span>
                                    {Number.isFinite(Number(price.original)) &&
                                      Number(price.original) > priceTotal(price) && (
                                        <span className="text-sm font-medium text-slate-500">
                                          <span className="sr-only">Original price: </span>
                                          <s className="line-through">{money(price.original)}</s>
                                        </span>
                                      )}
                                  </div>



                                  <p className="mt-1 text-xs text-slate-500">

                                    {price.days} days access

                                  </p>

                                </button>

                              );

                            }

                          )}

                        </div>

                      </section>



                      {/* PAYMENT SUMMARY */}

                      {selectedPrice && pricing && (

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">

                          <div className="mb-5 flex items-center gap-2">

                            <ReceiptText

                              size={19}

                              className="text-blue-700"

                            />



                            <h3 className="font-bold text-slate-900">

                              Payment Summary

                            </h3>

                          </div>



                          <div className="space-y-3 rounded-xl border border-blue-100 bg-slate-50 p-4">

                            <div className="flex justify-between gap-3 text-sm text-slate-600">

                              <span>Subtotal</span>

                              <span>

                                {money(pricing.subtotal)}

                              </span>

                            </div>



                            <div className="flex justify-between gap-3 text-sm text-slate-600">

                              <span>Promocode discount</span>

                              <span className="text-emerald-600">

                                - {money(pricing.discount)}

                              </span>

                            </div>



                            <div className="flex justify-between gap-3 text-sm text-slate-600">

                              <span>

                                GST ({pricing.gstRate}%)

                              </span>

                              <span>

                                {money(pricing.gstAmount)}

                              </span>

                            </div>



                            <div className="border-t border-slate-200 pt-3">

                              <div className="flex justify-between gap-3 font-extrabold text-[#071a61]">

                                <span>Total Payment</span>

                                <span>

                                  {money(pricing.total)}

                                </span>

                              </div>

                            </div>

                          </div>



                          {/* PROMOCODE */}

                          <form

                            onSubmit={applyPromocode}

                            className="mt-5"

                          >

                            <label className="mb-2 block text-xs font-bold text-slate-700">

                              Have a promocode?

                            </label>



                            <div className="flex gap-2">

                              <input

                                type="text"

                                value={promocode}

                                onChange={(event) => {

                                  promoVersionRef.current += 1;

                                  setPromocode(

                                    event.target.value

                                  );

                                  setAppliedPromo(null);

                                  setPromoError("");

                                  setPromoLoading(false);

                                }}

                                disabled={

                                  paymentLoading ||

                                  LOCKED_STATES.has(

                                    paymentState

                                  )

                                }

                                placeholder="Enter promocode"

                                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"

                              />



                              <button

                                type="submit"

                                disabled={

                                  locked ||

                                  !promocode.trim()

                                }

                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"

                              >

                                {promoLoading

                                  ? "Checking..."

                                  : "Apply"}

                              </button>

                            </div>



                            {promoError && (

                              <p className="mt-2 text-sm text-red-600">

                                {promoError}

                              </p>

                            )}



                            {appliedPromo && (

                              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">

                                <CheckCircle2 size={16} />

                                Promocode applied successfully.

                              </p>

                            )}

                          </form>



                          {/* PAYMENT ERROR */}

                          {paymentError && (

                            <div

                              role="alert"

                              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"

                            >

                              {paymentError}

                            </div>

                          )}



                          {/* PAY BUTTON */}

                          <button

                            type="button"

                            onClick={proceedToPayment}

                            disabled={

                              locked ||

                              Boolean(

                                promocode.trim() &&

                                !appliedPromo

                              )

                            }

                            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold ${

                              locked

                                ? "cursor-not-allowed bg-slate-300 text-slate-600"

                                : "bg-gradient-to-r from-[#164fa5] to-[#0089c8] text-white"

                            } disabled:cursor-not-allowed disabled:opacity-60`}

                          >

                            {locked ? (

                              <LockKeyhole size={17} />

                            ) : (

                              <ShoppingBag size={17} />

                            )}



                            {paymentState === "captured_pending"

                              ? "Activation Pending"

                              : paymentState === "checking"

                                ? "Checking Payment Status..."

                                : locked

                                  ? "Payment Status Pending"

                                  : "Proceed to Payment"}

                          </button>



                          {locked && (

                            <p className="mt-3 text-center text-xs text-amber-700">

                              {statusMessage(paymentState)}

                            </p>

                          )}



                          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">

                            <ShieldCheck size={14} />

                            Secure payment powered by Razorpay

                          </p>

                        </section>

                      )}



                      {/* PACKAGE BENEFITS */}

                      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">

                        <h3 className="mb-4 font-bold text-[#071a61]">

                          What&apos;s Included

                        </h3>



                        <div className="grid gap-3 sm:grid-cols-2">

                          {[

                            "Complete syllabus coverage",

                            "Recorded video classes",

                            "Daily exams & current affairs",

                            "Mock tests",

                            "PDF notes",

                            "Practice tests & quizzes",

                          ].map((feature) => (

                            <div

                              key={feature}

                              className="flex items-center gap-2 text-sm text-slate-600"

                            >

                              <CheckCircle2

                                size={16}

                                className="shrink-0 text-emerald-600"

                              />

                              {feature}

                            </div>

                          ))}

                        </div>

                      </section>

                    </>

                  )}



                  {/* REFRESH STATUS */}

                  {selectedId &&

                    LOCKED_STATES.has(paymentState) &&

                    paymentState !== "activated" && (

                      <div className="text-center">

                        <button

                          type="button"

                          onClick={() =>

                            checkPaymentStatus(selectedId)

                          }

                          disabled={paymentLoading}

                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline disabled:opacity-50"

                        >

                          <RefreshCw size={15} />

                          Refresh Payment Status

                        </button>

                      </div>

                    )}

                </>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}
