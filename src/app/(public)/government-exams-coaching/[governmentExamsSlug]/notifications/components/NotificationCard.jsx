import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  FileText,
} from "lucide-react";

/* =========================================================
   BUILD PDF URL
========================================================= */

function buildPdfUrl(
  filePath,
  pdf
) {
  if (!filePath || !pdf) {
    return "";
  }

  const cleanPath =
    String(filePath).replace(
      /\/+$/,
      ""
    );

  const cleanPdf =
    String(pdf).replace(
      /^\/+/,
      ""
    );

  return `${cleanPath}/${cleanPdf}`;
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* =========================================================
   CARD
========================================================= */

export default function NotificationCard({
  item,
  filePath,
  examName,
}) {
  const title =
    item?.post_name ||
    `${examName} Notification`;

  const pdfUrl =
    buildPdfUrl(
      filePath,
      item?.link
    );

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        shadow-[0_8px_26px_rgba(11,33,108,0.05)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#087bea]/20
        hover:shadow-[0_16px_38px_rgba(22,79,165,0.10)]
      "
    >
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[3px]
          bg-gradient-to-r
          from-[#087bea]
          via-[#00b5e8]
          to-[#7c3aed]
        "
      />

      <div
        className="
          flex
          items-start
          gap-4
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-[15px]
            bg-[#edf7ff]
            text-[#087bea]
          "
        >
          <FileText size={21} />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-[#df1768]
            "
          >
            {examName} Notification
          </p>

          <h2
            className="
              mt-1.5
              text-[16px]
              font-black
              leading-6
              text-[#102c5c]
            "
          >
            {title}
          </h2>
        </div>
      </div>

      {/* DATES */}

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
        "
      >
        <DateBox
          icon={CalendarDays}
          label="Gazette Date"
          value={formatDate(
            item?.gazette_date
          )}
        />

        <DateBox
          icon={Clock3}
          label="Last Date"
          value={formatDate(
            item?.last_date
          )}
        />
      </div>

      {/* FOOTER */}

      <div
        className="
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
        <span
          className="
            rounded-full
            bg-[#f1f7ff]
            px-3
            py-1.5
            text-[9px]
            font-bold
            text-[#164fa5]
          "
        >
          Official PDF
        </span>

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
              bg-[#087bea]
              px-4
              py-2.5
              text-[10px]
              font-bold
              text-white
              transition
              hover:bg-[#164fa5]
            "
          >
            View Notification

            <ArrowUpRight
              size={13}
            />
          </a>
        ) : (
          <span
            className="
              text-[10px]
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

function DateBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[14px]
        bg-[#f7faff]
        p-3
      "
    >
      <div
        className="
          flex
          items-center
          gap-1.5
          text-[9px]
          font-semibold
          text-slate-400
        "
      >
        <Icon size={12} />
        {label}
      </div>

      <p
        className="
          mt-1.5
          text-[11px]
          font-bold
          text-[#102c5c]
        "
      >
        {value}
      </p>
    </div>
  );
}