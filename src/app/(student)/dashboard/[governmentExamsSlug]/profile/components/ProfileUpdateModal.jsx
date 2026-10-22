"use client";

import Image from "next/image";
import { useState } from "react";

import {
    Loader2,
    Save,
    X,
} from "lucide-react";

import Swal from "sweetalert2";
import maleAvatar from "@/app/(public)/profile-setup/images/avatar-male.png";
import femaleAvatar from "@/app/(public)/profile-setup/images/avatar-female.png";

export default function ProfileUpdateModal({
    open,
    ...props
}) {
    if (!open) {
        return null;
    }

    return <ProfileUpdateForm {...props} />;
}

function ProfileUpdateForm({
    profile,
    onClose,
    onUpdated,
}) {
    const [
        loading,
        setLoading,
    ] = useState(false);

    const [form, setForm] = useState(() => ({
                name:
                    profile?.name ||
                    "",

                email:
                    profile?.emailId ||
                    profile?.email ||
                    "",

                mobile:
                    profile?.mobile ||
                    "",

                dob:
                    profile?.dob ||
                    "",

                place:
                    profile?.place ||
                    "",

                promocode:
                    profile?.promocode ||
                    "",

                code:
                    profile?.code ||
                    "+91",

                avatar:
                    profile?.avatar ||
                    "",
            }));

    function handleChange(
        event
    ) {
        const {
            name,
            value,
        } =
            event.target;

        setForm(
            (previous) => ({
                ...previous,

                [name]:
                    value,
            })
        );
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        try {
            setLoading(true);

            const response =
                await fetch(
                    "/api/student/profile",
                    {
                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                form
                            ),
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                result?.status !==
                true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to update profile."
                );
            }

            const updatedProfile =
            {
                ...profile,

                name:
                    form.name,

                emailId:
                    form.email,

                email:
                    form.email,

                mobile:
                    form.mobile,

                dob:
                    form.dob,

                place:
                    form.place,

                promocode:
                    form.promocode,

                code:
                    form.code,

                avatar:
                    form.avatar,
            };

            await Swal.fire({
                icon:
                    "success",

                title:
                    "Profile Updated",

                text:
                    result?.message ||
                    "Your profile has been updated successfully.",

                timer:
                    1300,

                showConfirmButton:
                    false,
            });

            onUpdated?.(
                updatedProfile
            );
        } catch (error) {
            await Swal.fire({
                icon:
                    "error",

                title:
                    "Update Failed",

                text:
                    error?.message ||
                    "Unable to update profile.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-slate-950/60
        px-4
        py-6
        backdrop-blur-[4px]
      "
            onClick={
                loading
                    ? undefined
                    : onClose
            }
        >
            <div
                className="
          relative
          max-h-[90vh]
          w-full
          max-w-[650px]
          overflow-y-auto
          rounded-[26px]
          bg-white
          p-6
          shadow-2xl

          sm:p-8
        "
                onClick={(
                    event
                ) =>
                    event.stopPropagation()
                }
            >
                <button
                    type="button"
                    disabled={
                        loading
                    }
                    onClick={
                        onClose
                    }
                    className="
            absolute
            right-5
            top-5
            flex
            h-9
            w-9
            cursor-pointer
            items-center
            justify-center
            rounded-full
            bg-slate-100
            text-slate-500
          "
                >
                    <X size={17} />
                </button>

                <div>
                    <p
                        className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
                    >
                        Student Account
                    </p>

                    <h2
                        className="
              mt-1
              text-[25px]
              font-extrabold
              text-[#071b59]
            "
                    >
                        Update Profile
                    </h2>

                    <p
                        className="
              mt-1
              text-[12px]
              text-slate-500
            "
                    >
                        Update your personal
                        information below.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="
            mt-7
            grid
            gap-4

            sm:grid-cols-2
          "
                >
          <div className="sm:col-span-2">
              <p className="mb-2 text-[11px] font-semibold text-slate-700">
                  Choose your avatar
              </p>
              <div className="grid grid-cols-2 gap-3">
                  {[
                      { value: "male", label: "Male", image: maleAvatar },
                      { value: "female", label: "Female", image: femaleAvatar },
                  ].map((avatar) => (
                      <button
                          key={avatar.value}
                          type="button"
                          aria-pressed={form.avatar === avatar.value}
                          onClick={() =>
                              setForm((previous) => ({
                                  ...previous,
                                  avatar: avatar.value,
                              }))
                          }
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                              form.avatar === avatar.value
                                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                  : "border-slate-200 hover:border-blue-300"
                          }`}
                      >
                          <Image
                              src={avatar.image}
                              alt={`${avatar.label} avatar`}
                              width={42}
                              height={42}
                              className="h-[42px] w-[42px] rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-700">
                              {avatar.label}
                          </span>
                      </button>
                  ))}
              </div>
          </div>

          <ProfileInput
                        label="Full Name"
                        name="name"
                        value={
                            form.name
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />

                    <ProfileInput
                        label="Email"
                        name="email"
                        type="email"
                        value={
                            form.email
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />

                    <ProfileInput
                        label="Mobile"
                        name="mobile"
                        value={
                            form.mobile
                        }
                        onChange={
                            handleChange
                        }
                    />

                    <ProfileInput
                        label="Date of Birth"
                        name="dob"
                        value={
                            form.dob
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="20.05.1996"
                    />

                    <ProfileInput
                        label="Place"
                        name="place"
                        value={
                            form.place
                        }
                        onChange={
                            handleChange
                        }
                    />

                    <ProfileInput
                        label="Promo Code"
                        name="promocode"
                        value={
                            form.promocode
                        }
                        onChange={
                            handleChange
                        }
                    />

                    <div
                        className="
              mt-2
              sm:col-span-2
            "
                    >
                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="
                flex
                h-[52px]
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#017dc0]
                to-[#164fa5]
                text-[13px]
                font-bold
                text-white
                shadow-lg
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />

                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save
                                        size={17}
                                    />

                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProfileInput({
    label,
    ...props
}) {
    return (
        <label>
            <span
                className="
          mb-2
          block
          text-[11px]
          font-bold
          text-[#0b1f44]
        "
            >
                {label}
            </span>

            <input
                {...props}
                className="
          h-[50px]
          w-full
          rounded-[13px]
          border
          border-slate-200
          bg-[#f8faff]
          px-4
          text-[13px]
          font-medium
          text-slate-800
          outline-none
          transition

          focus:border-[#017dc0]
          focus:bg-white
          focus:ring-4
          focus:ring-blue-50
        "
            />
        </label>
    );
}