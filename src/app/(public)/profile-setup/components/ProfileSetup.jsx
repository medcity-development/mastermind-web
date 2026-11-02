"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Swal from "sweetalert2";

import ProfileHeader from "./ProfileHeader";
import AvatarSelector from "./AvatarSelector";
import ProfileField from "./ProfileField";
import DistrictSelect from "./DistrictSelect";
import TermsCheckbox from "./TermsCheckbox";
import ProfileSubmitButton from "./ProfileSubmitButton";
import CourseChoiceModal from "./CourseChoiceModal";

function toInputDate(value) {
  const date = String(value ?? "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const match = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  return match
    ? `${match[3]}-${match[2]}-${match[1]}`
    : "";
}

function toBackendDate(value) {
  const match = String(value ?? "").match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  return match
    ? `${match[3]}-${match[2]}-${match[1]}`
    : "";
}

export default function ProfileSetup({
  authData,
  redirectTo = "",
}) {
  const router = useRouter();
  const submitting = useRef(false);

  useEffect(() => {
    const rootOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = rootOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);

  const [gender, setGender] = useState(
    authData?.avatar || ""
  );

  const [name, setName] = useState(
    authData?.name || ""
  );

  const [phone, setPhone] = useState(
    authData?.mobile || ""
  );

  const email = String(authData?.email || "")
    .trim()
    .toLowerCase();

  const [dob, setDob] = useState(
    toInputDate(authData?.dob)
  );

  const [district, setDistrict] = useState(
    authData?.place || ""
  );

  const [referenceCode, setReferenceCode] = useState(
    authData?.promocode || ""
  );

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showCourseModal, setShowCourseModal] =
    useState(false);

  const [saved, setSaved] = useState(false);

  async function showWarning(title, text) {
    await Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonColor: "#2468f2",
    });
  }

  async function validateForm() {
    if (!gender) {
      await showWarning(
        "Choose an avatar",
        "Please select an avatar to continue."
      );
      return false;
    }

    if (!name.trim()) {
      await showWarning(
        "Enter your name",
        "Please enter your full name."
      );
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      await showWarning(
        "Invalid phone number",
        "Please enter a valid 10-digit mobile number."
      );
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await showWarning(
        "Invalid email",
        "Your verified email is unavailable. Please login again."
      );
      return false;
    }

    if (!dob || !toBackendDate(dob)) {
      await showWarning(
        "Select date of birth",
        "Please select a valid date of birth."
      );
      return false;
    }

    const selectedDate = new Date(`${dob}T00:00:00`);
    const today = new Date();

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate > today
    ) {
      await showWarning(
        "Invalid date of birth",
        "Please select a valid past date."
      );
      return false;
    }

    if (!district.trim()) {
      await showWarning(
        "Select district",
        "Please select your district."
      );
      return false;
    }

    if (!accepted) {
      await showWarning(
        "Accept Terms",
        "Please accept the Terms and Conditions to continue."
      );
      return false;
    }

    if (!authData?.uid) {
      await Swal.fire({
        icon: "error",
        title: "Session expired",
        text: "Your verified user ID is unavailable. Please login again.",
        confirmButtonColor: "#ef4444",
      });
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current || saved) {
      return;
    }

    submitting.current = true;

    try {
      const isValid = await validateForm();

      if (!isValid) {
        return;
      }

      setLoading(true);

      const profileData = {
        name: name.trim(),
        email,
        mobile: phone.replace(/\D/g, ""),
        dob: toBackendDate(dob),
        place: district.trim(),
        promocode: referenceCode.trim(),
        code: "+91",
        avatar: gender,
      };

      const response = await fetch(
        "/api/auth/profile-setup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(profileData),
        }
      );

      const result = await response.json();

      if (!response.ok || result?.status !== true) {
        throw new Error(
          result?.message ||
            result?.msg ||
            "Unable to save profile."
        );
      }

      try {
        window.localStorage.setItem(
          "student-profile-avatar",
          JSON.stringify({
            uid: String(authData.uid),
            avatar: gender,
          })
        );
      } catch (storageError) {
        console.error("Unable to persist the selected avatar:", storageError);
      }

      setSaved(true);

      await Swal.fire({
        icon: "success",
        title: "Profile Completed",
        text:
          result?.message ||
          "Your profile has been saved successfully.",
        timer: 1200,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      if (redirectTo) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      setShowCourseModal(true);
    } catch (error) {
      console.error("PROFILE SETUP ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "Unable to save profile",
        text:
          error?.message ||
          "Please try again.",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className="relative"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-setup-title"
          className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full flex-col overflow-hidden rounded-[22px] border border-white/80 bg-white px-4 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:rounded-[28px] sm:px-7 sm:py-5 lg:max-h-none lg:px-9 lg:py-6"
        >
          {!showCourseModal && (
            <div className="-mx-4 -mt-3 flex shrink-0 justify-end bg-white px-3 pt-1 sm:-mx-7 sm:-mt-5 sm:px-5 lg:-mx-9 lg:-mt-6 lg:px-7">
              <button
                type="button"
                onClick={() =>
                  router.replace(
                    redirectTo
                      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                      : "/login"
                  )
                }
                aria-label="Close profile setup"
                title="Close profile setup"
                className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>
          )}

          <div className="shrink-0">
            <ProfileHeader />
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-3 flex min-h-0 flex-1 flex-col sm:mt-4 lg:flex-none"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-3 sm:pr-4 lg:flex-none lg:overflow-visible lg:pr-0">
              <div className="grid grid-cols-1 gap-x-5 gap-y-3 pb-3 sm:grid-cols-2 sm:gap-y-4 sm:pb-4 lg:gap-x-8">
                <div className="sm:col-span-2">
                  <AvatarSelector
                    gender={gender}
                    onChange={setGender}
                  />
                </div>

                <ProfileField
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your full name"
                  required
                />

                <ProfileField
                  label="Phone Number"
                  value={phone}
                  onChange={(value) =>
                    setPhone(
                      String(value)
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  placeholder="Enter 10 digit mobile number"
                  type="tel"
                  required
                />

                <div className="relative">
                  <ProfileField
                    label="Email Address"
                    value={email}
                    onChange={() => {}}
                    placeholder="Verified email address"
                    type="email"
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Email verified through OTP
                  </p>
                </div>

                <ProfileField
                  label="Date of Birth"
                  value={dob}
                  onChange={setDob}
                  type="date"
                  required
                />

                <DistrictSelect
                  value={district}
                  onChange={setDistrict}
                />

                <ProfileField
                  label="Reference Code (Optional)"
                  value={referenceCode}
                  onChange={setReferenceCode}
                  placeholder="Enter reference code"
                />
              </div>
            </div>

            <div className="grid shrink-0 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(200px,240px)] sm:items-center sm:pt-4">
              <TermsCheckbox
                checked={accepted}
                onChange={setAccepted}
              />

              <ProfileSubmitButton
                loading={loading}
              />
            </div>
          </form>
        </div>
      </div>

      <CourseChoiceModal
        open={showCourseModal}
        onClose={() => setShowCourseModal(false)}
      />
    </>
  );
}