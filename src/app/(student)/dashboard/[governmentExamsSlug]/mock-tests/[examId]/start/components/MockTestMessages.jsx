export default function MockTestMessages({
    success = "",
    error = "",
}) {
    return (
        <>
            {success ? (
                <div
                    className="
            border-t
            border-emerald-100
            bg-emerald-50
            px-5
            py-3
            text-sm
            font-bold
            text-emerald-700
            sm:px-7
          "
                >
                    {success}
                </div>
            ) : null}

            {error ? (
                <div
                    className="
            border-t
            border-red-100
            bg-red-50
            px-5
            py-3
            text-sm
            font-bold
            text-red-700
            sm:px-7
          "
                >
                    {error}
                </div>
            ) : null}
        </>
    );
}