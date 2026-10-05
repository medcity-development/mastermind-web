import {
    AlertCircle,
} from "lucide-react";

export default function MockTestError({
    message,
}) {
    return (
        <div
            className="
        rounded-[24px]
        border
        border-red-200
        bg-red-50
        px-6
        py-14
        text-center
      "
        >
            <AlertCircle
                size={28}
                className="
          mx-auto
          text-red-500
        "
            />

            <p
                className="
          mt-3
          text-sm
          font-bold
          text-red-600
        "
            >
                {message}
            </p>
        </div>
    );
}