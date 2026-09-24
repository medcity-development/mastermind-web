import {
    getAiVideos,
  } from "@/lib/aiVideosHelper";
import AiVideosList from "./components/AiVideosList";
  

  
  export default async function AiVideosSection() {
    const result =
      await getAiVideos({
        uid: 0,
      });
  
    const videos =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];
  
    return (
      <section
        className="
          py-12
          sm:py-16
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1450px]
            px-4
            sm:px-6
            lg:px-8 mt-20
          "
        >
          {/* HEADER */}
  
          <div className="mb-7">
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-[#017dc0]
              "
            >
              Learn Smarter
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
              AI Learning Videos
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
              Watch short learning
              videos designed to make
              Kerala PSC preparation
              easier and more engaging.
            </p>
          </div>
  
          <AiVideosList
            videos={videos}
          />
        </div>
      </section>
    );
  }