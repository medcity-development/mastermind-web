import {
    Download,
    ExternalLink,
    FileText,
  } from "lucide-react";
  
  export default function StudyMaterialCard({
    item,
  }) {
    if (!item) {
      return null;
    }
  
    const title =
      item?.title ||
      "Study Material";
  
    const pdfUrl =
      item?.pdfUrl ||
      "";
  
    return (
      <article
        className="
          group
          relative
          flex
          min-h-[270px]
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          border-blue-100
          bg-gradient-to-br
          from-white
          via-white
          to-blue-50/50
          p-5
          shadow-[0_10px_30px_rgba(7,95,200,0.05)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-blue-200
          hover:shadow-[0_18px_42px_rgba(7,95,200,0.10)]
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-40
            w-40
            rounded-full
            bg-violet-100/60
            blur-3xl
          "
        />
  
        <div
          className="
            relative
            z-10
            flex
            h-full
            flex-col
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[15px]
                border
                border-blue-100
                bg-blue-50
                text-[#075fc8]
              "
            >
              <FileText
                size={21}
              />
            </div>
  
            <span
              className="
                rounded-full
                border
                border-violet-100
                bg-violet-50
                px-3
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.1em]
                text-violet-600
              "
            >
              PDF
            </span>
          </div>
  
          <p
            className="
              mt-6
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
          >
            Study Resource
          </p>
  
          <h3
            className="
              mt-2
              text-[18px]
              font-black
              leading-7
              text-[#071f55]
            "
          >
            {title}
          </h3>
  
          <p
            className="
              mt-3
              text-[12px]
              leading-6
              text-slate-500
            "
          >
            {item?.tagline ||
              "Open this PDF study resource for exam preparation and revision."}
          </p>
  
          {pdfUrl ? (
            <div
              className="
                mt-auto
                grid
                grid-cols-2
                gap-3
                pt-6
              "
            >
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-[13px]
                  border
                  border-blue-100
                  bg-blue-50
                  px-4
                  py-3
                  text-[11px]
                  font-bold
                  text-[#075fc8]
                  transition-all
                  hover:bg-blue-100
                "
              >
                <ExternalLink
                  size={14}
                />
  
                Open
              </a>
  
              <a
                href={pdfUrl}
                download
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-[13px]
                  bg-gradient-to-r
                  from-[#075fc8]
                  to-[#7c3aed]
                  px-4
                  py-3
                  text-[11px]
                  font-bold
                  text-white
                  shadow-[0_8px_20px_rgba(7,95,200,0.12)]
                "
              >
                <Download
                  size={14}
                />
  
                Download
              </a>
            </div>
          ) : (
            <div className="mt-auto pt-6">
              <div
                className="
                  rounded-[13px]
                  bg-slate-100
                  px-4
                  py-3
                  text-center
                  text-[11px]
                  font-bold
                  text-slate-400
                "
              >
                File unavailable
              </div>
            </div>
          )}
        </div>
      </article>
    );
  }