import AiVideoCard from "./AiVideoCard";

export default function AiVideosList({
  videos = [],
}) {
  if (!videos.length) {
    return (
      <div
        className="
          rounded-[24px]
          border
          border-slate-200
          bg-white
          px-6
          py-14
          text-center
        "
      >
        <h3
          className="
            text-lg
            font-black
            text-[#071f55]
          "
        >
          No videos available
        </h3>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          New learning videos will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-6
        sm:grid-cols-2
        lg:grid-cols-3
        2xl:grid-cols-4
      "
    >
      {videos.map((item) => (
        <AiVideoCard
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}