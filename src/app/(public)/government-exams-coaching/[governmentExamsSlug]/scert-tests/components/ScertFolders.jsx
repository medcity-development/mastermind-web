import ScertFolderCard from "./ScertFolderCard";

export default function ScertFolders({
  folders = [],
}) {
  return (
    <section className="mt-9">
      <div>
        <p
          className="
            text-xs
            font-black
            uppercase
            tracking-[0.18em]
            text-[#017dc0]
          "
        >
          SCERT Classes
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-black
            text-[#071f55]
            sm:text-3xl
          "
        >
          Choose your Class
        </h2>

        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Select your SCERT class
          to view all available
          practice tests.
        </p>
      </div>

      {folders.length > 0 ? (
        <div
          className="
            mt-7
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {folders.map(
            (folder) => (
              <ScertFolderCard
                key={
                  folder.id
                }
                folder={
                  folder
                }
              />
            )
          )}
        </div>
      ) : (
        <div
          className="
            mt-7
            rounded-[22px]
            border
            border-dashed
            border-[#cbdbea]
            bg-white
            px-6
            py-12
            text-center
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            No SCERT classes
            are currently
            available.
          </p>
        </div>
      )}
    </section>
  );
}