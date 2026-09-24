export default function TopicVideoLoading() {
    return (
      <section
        className="
          mt-5
          flex
          min-h-[320px]
          items-center
          justify-center
          rounded-[26px]
          border
          border-[#dce8f7]
          bg-white
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-[#dce8f7]
              border-t-[#075fc8]
            "
          />
  
          <p
            className="
              mt-3
              text-[11px]
              font-semibold
              text-slate-500
            "
          >
            Loading video playlist...
          </p>
        </div>
      </section>
    );
  }