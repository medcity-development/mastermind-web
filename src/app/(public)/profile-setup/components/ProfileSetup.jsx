"use client";

import { useRef, useState } from "react";
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
      {!showCourseModal && (
        <button
          type="button"
          onClick={() => router.replace("/")}
          aria-label="Close profile setup"
          title="Close profile setup"
          className="fixed right-4 top-4 z-[10001] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={20} />
        </button>
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-setup-title"
        className="relative max-h-[calc(100dvh-88px)] w-full overflow-y-auto overscroll-contain rounded-[20px] border border-white/80 bg-gradient-to-br from-white via-white to-[#f7f9ff] px-4 py-4 shadow-[0_24px_70px_rgba(1,10,40,0.3)] ring-1 ring-black/5 sm:px-6 sm:py-5 lg:px-7"
      >
        <ProfileHeader />

        <form
          onSubmit={handleSubmit}
          className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:mt-4 lg:gap-x-5 lg:gap-y-3"
        >
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

          <div className="flex items-center">
            <TermsCheckbox
              checked={accepted}
              onChange={setAccepted}
            />
          </div>

          <div className="flex items-end sm:justify-end">
            <ProfileSubmitButton
              loading={loading}
            />
          </div>
        </form>
      </div>

      <CourseChoiceModal
        open={showCourseModal}
        onClose={() => setShowCourseModal(false)}
      />
    </>
  );
}