import StudyMaterialCard from "./StudyMaterialCard";

export default function StudyMaterialsList({
  materials = [],
  error = "",
}) {
  return (
    <section className="mt-8">
      <div
        className="
          mb-5
          flex
          items-end
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
          >
            Learning Resources
          </p>

          <h2
            className="
              mt-1
              text-2xl
              font-black
              text-[#071f55]
            "
          >
            Download Study Materials
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Choose a PDF resource below
            to open or download.
          </p>
        </div>

        <span
          className="
            rounded-full
            border
            border-slate-200
            bg-white
            px-4
            py-2
            text-xs
            font-bold
            text-slate-500
          "
        >
          {materials.length}{" "}
          {materials.length === 1
            ? "File"
            : "Files"}
        </span>
      </div>

      {/* API ERROR */}

      {error ? (
        <div
          className="
            rounded-[24px]
            border
            border-red-100
            bg-red-50
            px-6
            py-10
            text-center
          "
        >
          <h3
            className="
              font-black
              text-red-700
            "
          >
            Unable to load study
            materials
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-red-500
            "
          >
            {error}
          </p>
        </div>
      ) : materials.length ===
        0 ? (
        /* EMPTY */

        <div
          className="
            rounded-[24px]
            border
            border-slate-200
            bg-white
            px-6
            py-10
            text-center
          "
        >
          <h3
            className="
              font-black
              text-[#071f55]
            "
          >
            No study materials
            available
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            PDF resources are currently
            unavailable.
          </p>
        </div>
      ) : (
        /* FILES */

        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {materials.map(
            (item) => (
              <StudyMaterialCard
                key={item.id}
                item={item}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}