import {
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

export default function LoginButton({
  loading = false,
  label = "Continue",
  loadingLabel =
  "Please wait...",
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        group
        flex
        h-[56px] cursor-pointer
        w-full
        items-center
        justify-center
        rounded-[14px]
        bg-gradient-to-r
        from-[#0969f1]
        via-[#315ff4]
        to-[#7b35f2]
        px-5
        text-[14px]
        font-bold
        text-white
        shadow-[0_14px_30px_rgba(67,74,239,0.28)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_18px_36px_rgba(67,74,239,0.38)]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <span
        className="
          flex-1
          text-center
        "
      >
        {loading
          ? loadingLabel
          : label}
      </span>

      <span
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-white/15
          transition
          group-hover:translate-x-1
          group-hover:bg-white/20
        "
      >
        {loading ? (
          <LoaderCircle
            size={18}
            className="animate-spin"
          />
        ) : (
          <ArrowRight
            size={18}
          />
        )}
      </span>
    </button>
  );
}