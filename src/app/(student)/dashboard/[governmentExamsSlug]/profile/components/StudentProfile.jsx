"use client";

import Image from "next/image";
import {
    useCallback,
    useState,
    useSyncExternalStore,
} from "react";

import {
    CalendarDays,
    Edit3,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import maleAvatar from "@/app/(public)/profile-setup/images/avatar-male.png";
import femaleAvatar from "@/app/(public)/profile-setup/images/avatar-female.png";
import ProfileUpdateModal from "./ProfileUpdateModal";

export default function StudentProfile({
    initialProfile,
    uid,
    config,
}) {
    const [
        profile,
        setProfile,
    ] = useState(
        initialProfile || {}
    );

    const [
        showModal,
        setShowModal,
    ] = useState(false);
    const subscribeToSavedAvatar = useCallback((callback) => {
        window.addEventListener("storage", callback);
        return () => window.removeEventListener("storage", callback);
    }, []);

    const getSavedAvatarSnapshot = useCallback(() => {
        try {
            const saved = JSON.parse(
                window.localStorage.getItem("student-profile-avatar") || "null"
            );
            return saved?.uid === String(uid)
                ? String(saved.avatar || "")
                : "";
        } catch (error) {
            console.error("Unable to read saved profile avatar:", error);
            return "";
        }
    }, [uid]);

    const storedAvatar = useSyncExternalStore(
        subscribeToSavedAvatar,
        getSavedAvatarSnapshot,
        () => ""
    );

    const name =
        profile?.name ||
        "Student";

    const email =
        profile?.emailId ||
        profile?.email ||
        "";

    const mobile =
        profile?.mobile ||
        "";

    const place =
        profile?.place ||
        "";

    const dob =
        profile?.dob ||
        "";

    const initial =
        name
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "S";

    const profileAvatar = getAvatarValue(profile);
    const avatarImage = getAvatarImage(profileAvatar)
        ? getAvatarImage(profileAvatar)
        : getAvatarImage(storedAvatar);

    return (
        <>
            <div
                className="
          space-y-6
        "
            >
                {/* HEADER */}

                <section
                    className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-br
            from-[#071b59]
            via-[#164fa5]
            to-[#017dc0]
            px-6
            py-8
            text-white
            shadow-[0_22px_60px_rgba(22,79,165,0.20)]

            sm:px-8
            lg:px-10
          "
                >
                    <div
                        aria-hidden="true"
                        className="
              absolute
              -right-20
              -top-24
              h-72
              w-72
              rounded-full
              bg-white/10
              blur-3xl
            "
                    />

                    <div
                        className="
              relative
              z-10
              flex
              flex-col
              gap-6

              md:flex-row
              md:items-center
              md:justify-between
            "
                    >
                        <div
                            className="
                flex
                items-center
                gap-5
              "
                        >
                            <div
                                className="
                  flex
                  h-20
                  w-20
                  shrink-0
                  items-center
                  justify-center
                  rounded-[22px]
                  border
                  border-white/20
                  bg-white/15
                  text-[30px]
                  font-black
                  backdrop-blur
                "
                            >
                                {avatarImage ? (
                                    <Image
                                        src={avatarImage}
                                        alt={`${name} avatar`}
                                        width={80}
                                        height={80}
                                        className="h-full w-full rounded-[22px] object-cover"
                                    />
                                ) : (
                                    initial
                                )}
                            </div>

                            <div>
                                <p
                                    className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-white/65
                  "
                                >
                                    Student Profile
                                </p>

                                <h1
                                    className="
                    mt-1
                    text-[28px]
                    font-black
                    tracking-tight

                    sm:text-[34px]
                  "
                                >
                                    {name}
                                </h1>

                                <p
                                    className="
                    mt-1
                    text-sm
                    text-white/70
                  "
                                >
                                    {config?.name}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowModal(
                                    true
                                )
                            }
                            className="
                inline-flex
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-white
                px-5
                py-3
                text-[13px]
                font-bold
                text-[#164fa5]
                shadow-lg
                transition
                hover:-translate-y-0.5
              "
                        >
                            <Edit3
                                size={16}
                            />

                            Update Profile
                        </button>
                    </div>
                </section>

                {/* DETAILS */}

                <section
                    className="
            rounded-[26px]
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_12px_40px_rgba(15,23,42,0.05)]

            sm:p-8
          "
                >
                    <div
                        className="
              mb-6
              flex
              items-center
              gap-3
            "
                    >
                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-[#164fa5]
              "
                        >
                            <UserRound
                                size={19}
                            />
                        </div>

                        <div>
                            <h2
                                className="
                  text-[18px]
                  font-extrabold
                  text-[#0b1f44]
                "
                            >
                                Personal Information
                            </h2>

                            <p
                                className="
                  text-[11px]
                  text-slate-400
                "
                            >
                                Your registered account
                                information
                            </p>
                        </div>
                    </div>

                    <div
                        className="
              grid
              gap-4

              md:grid-cols-2
              xl:grid-cols-3
            "
                    >
                        <ProfileItem
                            icon={UserRound}
                            label="Full Name"
                            value={name}
                        />

                        <ProfileItem
                            icon={Mail}
                            label="Email"
                            value={email}
                        />

                        <ProfileItem
                            icon={Phone}
                            label="Mobile"
                            value={
                                mobile
                                    ? `${profile?.code || "+91"} ${mobile}`
                                    : ""
                            }
                        />

                        <ProfileItem
                            icon={CalendarDays}
                            label="Date of Birth"
                            value={dob}
                        />

                        <ProfileItem
                            icon={MapPin}
                            label="Place"
                            value={place}
                        />

                        <ProfileItem
                            icon={ShieldCheck}
                            label="Account Status"
                            value={
                                profile?.stage ===
                                    "completed"
                                    ? "Profile Completed"
                                    : profile?.stage ||
                                    "Active"
                            }
                        />
                    </div>
                </section>
            </div>

            <ProfileUpdateModal
                open={showModal}
                profile={{
                    ...profile,
                    avatar: getAvatarImage(profileAvatar)
                        ? profileAvatar
                        : storedAvatar,
                }}
                onClose={() =>
                    setShowModal(
                        false
                    )
                }
                onUpdated={(
                    updatedProfile
                ) => {
                    setProfile(
                        updatedProfile
                    );
                    try {
                        window.localStorage.setItem(
                            "student-profile-avatar",
                            JSON.stringify({
                                uid: String(uid),
                                avatar: updatedProfile.avatar,
                            })
                        );
                    } catch (error) {
                        console.error("Unable to save profile avatar locally:", error);
                    }

                    setShowModal(
                        false
                    );
                }}
            />
        </>
    );
}

function getAvatarValue(profile) {
    return (
        profile?.avatar ??
        profile?.gender ??
        profile?.sex ??
        profile?.avatar_type ??
        profile?.avatarType ??
        ""
    );
}

function getAvatarImage(value) {
    const normalized = String(value ?? "").trim().toLowerCase();

    if (/female|woman|girl/.test(normalized)) {
        return femaleAvatar;
    }
    if (/male|man|boy/.test(normalized)) {
        return maleAvatar;
    }

    return null;
}

function ProfileItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div
            className="
        rounded-[18px]
        border
        border-slate-100
        bg-[#f8faff]
        p-4
      "
        >
            <div
                className="
          flex
          items-center
          gap-2
          text-slate-400
        "
            >
                <Icon size={15} />

                <span
                    className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.08em]
          "
                >
                    {label}
                </span>
            </div>

            <p
                className="
          mt-2
          break-words
          text-[14px]
          font-bold
          text-[#0b1f44]
        "
            >
                {value || "Not provided"}
            </p>
        </div>
    );
}