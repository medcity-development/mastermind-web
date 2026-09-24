export default function PyqLoading() {
    return (
      <section
        className="
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              h-11
              w-11
              animate-pulse
              rounded-[14px]
              bg-slate-100
            "
          />
  
          <div className="space-y-2">
            <div
              className="
                h-3
                w-24
                animate-pulse
                rounded
                bg-slate-100
              "
            />
  
            <div
              className="
                h-5
                w-44
                animate-pulse
                rounded
                bg-slate-100
              "
            />
          </div>
        </div>
  
        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {Array.from({
            length: 6,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  h-[240px]
                  animate-pulse
                  rounded-[22px]
                  border
                  border-slate-100
                  bg-slate-50
                "
              />
            )
          )}
        </div>
      </section>
    );
  }