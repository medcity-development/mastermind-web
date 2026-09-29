// src/app/(public)/profile-setup/components/ProfileSetup.jsx

"use client";

import {
  useState,
} from "react";

import Swal from "sweetalert2";

import ProfileHeader from "./ProfileHeader";
import AvatarSelector from "./AvatarSelector";
import ProfileField from "./ProfileField";
import DistrictSelect from "./DistrictSelect";
import TermsCheckbox from "./TermsCheckbox";
import ProfileSubmitButton from "./ProfileSubmitButton";
import CourseChoiceModal from "./CourseChoiceModal";

export default function ProfileSetup({
  authData,
}) {
  /* =========================================================
     FORM STATE
  ========================================================= */

  const [
    gender,
    setGender,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState(
    authData?.mobile ||
      ""
  );

  const [
    email,
    setEmail,
  ] = useState(
    authData?.email ||
      ""
  );

  const [
    dob,
    setDob,
  ] = useState("");

  const [
    district,
    setDistrict,
  ] = useState("");

  const [
    referenceCode,
    setReferenceCode,
  ] = useState("");

  const [
    accepted,
    setAccepted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showCourseModal,
    setShowCourseModal,
  ] = useState(false);

  /* =========================================================
     VALIDATION
  ========================================================= */

  async function validateForm() {
    if (!gender) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Choose an avatar",

        text:
          "Please select an avatar to continue.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    if (!name.trim()) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Enter your name",

        text:
          "Please enter your full name.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    if (!phone.trim()) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Enter phone number",

        text:
          "Please enter your phone number.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    const cleanPhone =
      phone.replace(
        /\D/g,
        ""
      );

    if (
      cleanPhone.length !==
      10
    ) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Invalid phone number",

        text:
          "Please enter a valid 10 digit mobile number.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    if (!email.trim()) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Enter email",

        text:
          "Please enter your email address.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email.trim()
      )
    ) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Invalid email",

        text:
          "Please enter a valid email address.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    if (!dob) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Select date of birth",

        text:
          "Please select your date of birth.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    if (!district) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Select district",

        text:
          "Please select your district.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    if (!accepted) {
      await Swal.fire({
        icon:
          "warning",

        title:
          "Accept Terms",

        text:
          "Please accept the Terms and Conditions to continue.",

        confirmButtonColor:
          "#2468f2",
      });

      return false;
    }

    if (!authData?.uid) {
      await Swal.fire({
        icon:
          "error",

        title:
          "User information missing",

        text:
          "Your verified user ID is unavailable. Please login again.",

        confirmButtonColor:
          "#ef4444",
      });

      return false;
    }

    return true;
  }

  /* =========================================================
     SUBMIT PROFILE
  ========================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const isValid =
      await validateForm();

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      const profileData = {
        name:
          name.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        mobile:
          phone.replace(
            /\D/g,
            ""
          ),

        dob,

        place:
          district,

        promocode:
          referenceCode.trim(),

        code:
          "+91",

        uid:
          String(
            authData.uid
          ),

        avatar:
          gender,
      };

      console.log(
        "SET USER PROFILE PAYLOAD:",
        profileData
      );

      /* =====================================================
         PROFILE SETUP API
      ===================================================== */

      const response =
        await fetch(
          "/api/auth/profile-setup",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                profileData
              ),
          }
        );

      const result =
        await response.json();

      console.log(
        "SET USER PROFILE RESPONSE:",
        result
      );

      if (
        !response.ok ||
        result?.status !==
          true
      ) {
        throw new Error(
          result?.message ||
            result?.msg ||
            "Unable to save profile."
        );
      }

      /* =====================================================
         PROFILE SAVED
      ===================================================== */

      await Swal.fire({
        icon:
          "success",

        title:
          "Profile Completed",

        text:
          result?.message ||
          result?.msg ||
          "Your profile has been saved successfully.",

        timer:
          1200,

        showConfirmButton:
          false,

        timerProgressBar:
          true,
      });

      /* =====================================================
         NEW USER
         PROFILE COMPLETE
             ↓
         COURSE SELECTION MODAL
      ===================================================== */

      setShowCourseModal(
        true
      );
    } catch (error) {
      console.error(
        "PROFILE SETUP ERROR:",
        error
      );

      await Swal.fire({
        icon:
          "error",

        title:
          "Unable to save profile",

        text:
          error?.message ||
          "Please try again.",

        confirmButtonText:
          "Try Again",

        confirmButtonColor:
          "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <div
        className="
          w-full
          rounded-[30px]
          border
          border-white/10
          bg-white
          px-6
          py-7
          shadow-[0_30px_90px_rgba(0,0,0,0.30)]

          sm:px-8

          xl:px-10
        "
      >
        <ProfileHeader />

        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-6
            space-y-4
          "
        >
          {/* AVATAR */}

          <AvatarSelector
            gender={
              gender
            }
            onChange={
              setGender
            }
          />

          {/* NAME */}

          <ProfileField
            label="Full Name"
            value={name}
            onChange={
              setName
            }
            placeholder="Enter your full name"
            required
          />

          {/* PHONE */}

          <ProfileField
            label="Phone Number"
            value={phone}
            onChange={(
              value
            ) =>
              setPhone(
                value
                  .replace(
                    /\D/g,
                    ""
                  )
                  .slice(
                    0,
                    10
                  )
              )
            }
            placeholder="Enter 10 digit mobile number"
            type="tel"
            required
          />

          {/* EMAIL */}

          <ProfileField
            label="Email Address"
            value={email}
            onChange={
              setEmail
            }
            placeholder="Enter email address"
            type="email"
            required
          />

          {/* DOB */}

          <ProfileField
            label="Date of Birth"
            value={dob}
            onChange={
              setDob
            }
            type="date"
            required
          />

          {/* DISTRICT */}

          <DistrictSelect
            value={
              district
            }
            onChange={
              setDistrict
            }
          />

          {/* REFERENCE */}

          <ProfileField
            label="Reference Code (Optional)"
            value={
              referenceCode
            }
            onChange={
              setReferenceCode
            }
            placeholder="Enter reference code"
          />

          {/* TERMS */}

          <TermsCheckbox
            checked={
              accepted
            }
            onChange={
              setAccepted
            }
          />

          {/* SUBMIT */}

          <ProfileSubmitButton
            loading={
              loading
            }
          />
        </form>
      </div>

      <CourseChoiceModal
        open={
          showCourseModal
        }
        onClose={() =>
          setShowCourseModal(
            false
          )
        }
      />
    </>
  );
}