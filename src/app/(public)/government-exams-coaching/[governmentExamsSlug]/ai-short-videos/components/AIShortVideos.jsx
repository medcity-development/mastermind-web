import AiVideosIntro from "./AiVideosIntro";
import AiVideoGrid from "./AiVideoGrid";

export default function AiShortVideos() {
  return (
    <section
      className="
        mx-auto
        w-full
        max-w-7xl
        px-4
        py-8
        sm:px-6
        lg:px-8
      "
    >
      <AiVideosIntro />

      <AiVideoGrid />
    </section>
  );
}