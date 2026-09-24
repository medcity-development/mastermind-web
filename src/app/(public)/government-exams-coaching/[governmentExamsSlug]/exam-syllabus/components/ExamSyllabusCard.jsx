import {
  ArrowUpRight,
  Download,
  FileText,
} from "lucide-react";

/* =========================================================
   BUILD PDF URL
========================================================= */

function buildPdfUrl(
  filePath,
  pdf
) {
  if (
    !filePath ||
    !pdf
  ) {
    return "";
  }

  const cleanPath =
    String(
      filePath
    ).replace(
      /\/+$/,
      ""
    );

  const cleanPdf =
    String(
      pdf
    ).replace(
      /^\/+/,
      ""
    );

  return `${cleanPath}/${cleanPdf}`;
}

/* =========================================================
   CARD
========================================================= */

export default function ExamSyllabusCard({
  item,
  filePath,
  examName = "Exam",
}) {
  if (!item) {
    return null;
  }

  /* =========================================================
     CONTENT
  ========================================================= */

  const title =
    item?.title ||
    item?.name ||
    item?.exam_name ||
    `${examName} Syllabus`;

  const tagline =
    item?.tagline ||
    item?.description ||
    "";

  const pdfFile =
    item?.pdf_path ||
    item?.pdf ||
    item?.file ||
    item?.link ||
    "";

  const pdfUrl =
    buildPdfUrl(
      filePath,
      pdfFile
    );

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-[#dfe9f6]
        bg-gradient-to-br
        from-white
        via-white
        to-[#f7fbff]
        p-5
        shadow-[0_8px_24px_rgba(22,79,165,0.05)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#087bea]/20
        hover:shadow-[0_16px_36px_rgba(22,79,165,0.11)]
      "
    >
      {/* =====================================================
          DECORATION
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-[#7c3aed]/5
          blur-2xl
        "
      />

      {/* =====================================================
          TOP CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          flex
          items-start
          gap-4
        "
      >
        <span
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-[16px]
            bg-lightBlue/20
            text-violetBlue
            shadow-[0_8px_20px_rgba(37,99,235,0.18)]
          "
        >
          <FileText
            size={21}
          />
        </span>

        <div className="min-w-0">
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-[#e83e8c]
            "
          >
            {examName} Syllabus
          </p>

          <h3
            className="
              mt-1.5
              line-clamp-2
              text-[15px]
              font-black
              leading-6
              text-[#102c5c]
            "
          >
            {title}
          </h3>

          {tagline && (
            <p
              className="
                mt-1
                line-clamp-2
                text-[10px]
                leading-5
                text-slate-500
              "
            >
              {tagline}
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mt-5
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-slate-100
          pt-4
        "
      >
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-red-50
              px-3
              py-2
              text-[9px]
              font-bold
              text-red-500
              transition-all
              duration-300
              hover:bg-red-500
              hover:text-white
            "
          >
            <Download
              size={12}
            />

            PDF
          </a>
        ) : (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-slate-100
              px-3
              py-2
              text-[9px]
              font-bold
              text-slate-400
            "
          >
            <Download
              size={12}
            />

            PDF
          </span>
        )}

        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#edf7ff]
              px-3
              py-2
              text-[10px]
              font-bold
              text-[#087bea]
              transition-all
              duration-300
              hover:bg-[#087bea]
              hover:text-white
            "
          >
            View Syllabus

            <ArrowUpRight
              size={13}
            />
          </a>
        ) : (
          <span
            className="
              text-[10px]
              font-medium
              text-slate-400
            "
          >
            PDF unavailable
          </span>
        )}
      </div>
    </article>
  );
}