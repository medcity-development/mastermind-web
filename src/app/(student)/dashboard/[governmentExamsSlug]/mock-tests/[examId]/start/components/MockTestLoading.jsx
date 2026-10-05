import {
    Loader2,
} from "lucide-react";

export default function MockTestLoading() {
    return (
        <div
            className="
        flex
        min-h-[420px]
        items-center
        justify-center
        rounded-[24px]
        border
        border-slate-200
        bg-white
      "
        >
            <div
                className="
          text-center
        "
            >
                <Loader2
                    size={30}
                    className="
            mx-auto
            animate-spin
            text-[#164fa5]
          "
                />

                <p
                    className="
            mt-3
            text-sm
            font-bold
            text-slate-500
          "
                >
                    Loading exam...
                </p>
            </div>
        </div>
    );
}