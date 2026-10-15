
"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleMinus,
  XCircle,
  CircleHelp,
  ImageOff,
} from "lucide-react";

function formatAnswer(value) {
  const text = String(value ?? "").trim();
  if (!text) return "-";

  return text.replace(
    /^([A-E])\s*[.)]\s*(?:\1\s*[.)]\s*)+/i,
    "$1. "
  );
}

function imageUrl(value, base = "") {
  if (typeof value !== "string") return "";

  const src = value.trim();
  if (!src || /^(javascript|vbscript|data):/i.test(src)) {
    return "";
  }

  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("//")) return "";

  if (src.startsWith("/")) {
    if (/^https?:\/\//i.test(base)) {
      try {
        return new URL(src, base).href;
      } catch {
        return "";
      }
    }
    return src;
  }

  if (!/^https?:\/\//i.test(base)) return "";

  try {
    const baseUrl = base.endsWith("/")
      ? base
      : `${base}/`;

    return new URL(src, baseUrl).href;
  } catch {
    return "";
  }
}

function getImages(value, base) {
  const images = new Set();

  function add(item) {
    if (!item) return;

    if (Array.isArray(item)) {
      item.forEach(add);
      return;
    }

    if (typeof item === "object") {
      add(
        item.url ??
        item.src ??
        item.path ??
        item.filename
      );
      return;
    }

    const url = imageUrl(String(item), base);
    if (url) images.add(url);
  }

  add(value);
  return [...images];
}

function Diagram({ src, alt = "Question diagram" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="my-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        <ImageOff size={15} />
        Diagram could not be loaded.
      </div>
    );
  }

  return (
    <div className="my-3 w-fit max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="block h-auto max-h-[400px] max-w-full object-contain"
      />
    </div>
  );
}

function RichContent({ html, base = "" }) {
  const nodes = useMemo(() => {
    const source = String(html ?? "");

    if (!source) return [];

    if (typeof DOMParser === "undefined") {
      return null;
    }

    const doc = new DOMParser().parseFromString(
      source,
      "text/html"
    );

    function render(node, key) {
      if (node.nodeType === 3) {
        return node.textContent;
      }

      if (node.nodeType !== 1) return null;

      const tag = node.tagName.toLowerCase();

      if (
        [
          "script",
          "style",
          "iframe",
          "object",
          "embed",
          "form",
          "input",
          "button",
          "svg",
          "math",
        ].includes(tag)
      ) {
        return null;
      }

      if (tag === "img") {
        const src = imageUrl(
          node.getAttribute("src") ||
          node.getAttribute("data-src"),
          base
        );

        return src ? (
          <Diagram
            key={key}
            src={src}
            alt={
              node.getAttribute("alt") ||
              "Question diagram"
            }
          />
        ) : null;
      }

      if (tag === "br") return <br key={key} />;

      const children = Array.from(node.childNodes).map(
        (child, i) => render(child, `${key}-${i}`)
      );

      switch (tag) {
        case "b":
        case "strong":
          return <strong key={key}>{children}</strong>;
        case "i":
        case "em":
          return <em key={key}>{children}</em>;
        case "sup":
          return <sup key={key}>{children}</sup>;
        case "sub":
          return <sub key={key}>{children}</sub>;
        case "p":
        case "div":
          return (
            <div key={key} className="mb-2 last:mb-0">
              {children}
            </div>
          );
        case "ul":
          return (
            <ul key={key} className="my-2 list-disc pl-5">
              {children}
            </ul>
          );
        case "ol":
          return (
            <ol key={key} className="my-2 list-decimal pl-5">
              {children}
            </ol>
          );
        case "li":
          return <li key={key}>{children}</li>;
        default:
          return <span key={key}>{children}</span>;
      }
    }

    return Array.from(doc.body.childNodes).map(
      (node, i) => render(node, i)
    );
  }, [html, base]);

  if (nodes === null) {
    return (
      <p className="whitespace-pre-wrap">
        {String(html ?? "")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")}
      </p>
    );
  }

  return <div>{nodes}</div>;
}

function AnswerCard({
  label,
  value,
  html,
  image,
  imagePath,
  type = "default",
}) {
  const styles = {
    correct: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
    wrong: "border-red-200 bg-red-50/70 text-red-900",
    default: "border-slate-200 bg-[#f8fbff] text-slate-700",
  };

  const images = getImages(image, imagePath);

  const htmlContainsImage = /<img\b/i.test(
    String(html ?? "")
  );

  return (
    <div
      className={`min-h-[90px] rounded-xl border p-4 ${styles[type] ?? styles.default
        }`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest opacity-75">
        {label}
      </p>

      <p className="mt-3 whitespace-pre-wrap break-words text-[13px] font-bold leading-6">
        {value || "-"}
      </p>

      {htmlContainsImage && (
        <div className="mt-2">
          <RichContent
            html={html.replace(
              /<(?!\/?img\b)[^>]*>/gi,
              ""
            ).replace(/[^<]*(?=<img\b)/gi, "")}
            base={imagePath}
          />
        </div>
      )}

      {images.map((src) => (
        <Diagram
          key={src}
          src={src}
          alt={`${label} diagram`}
        />
      ))}
    </div>
  );
}

function QuestionStatus({ status }) {
  const config = {
    correct: [
      "Correct",
      CheckCircle2,
      "bg-emerald-50 text-emerald-700",
    ],
    wrong: [
      "Wrong",
      XCircle,
      "bg-red-50 text-red-600",
    ],
    skipped: [
      "Skipped",
      CircleMinus,
      "bg-slate-100 text-slate-500",
    ],
    pending: [
      "Not Evaluated",
      CircleHelp,
      "bg-amber-50 text-amber-700",
    ],
  };

  const [label, Icon, color] =
    config[status] ?? config.pending;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${color}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

export default function QuestionResultCard({ row }) {
  if (!row) return null;

  const number =
    row.number ??
    (Number.isInteger(row.index)
      ? row.index + 1
      : "-");

  const status = !row.attempted
    ? "skipped"
    : !row.evaluated
      ? "pending"
      : row.isCorrect
        ? "correct"
        : "wrong";

  const base = row.imagePath || row.image_path || "";

  const questionImages = getImages(
    row.questionImage,
    base
  );

  const userAnswer = !row.attempted
    ? "Not Answered"
    : formatAnswer(
      row.userAnswerDisplay || row.userAnswerKey
    );

  const correctAnswer = formatAnswer(
    row.correctAnswerDisplay ||
    row.correctAnswerKey
  );

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#d8e5f4] bg-white shadow-[0_8px_25px_rgba(15,23,42,0.035)]">
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f6fc] text-xs font-black text-[#017dc0]">
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Question {number}
            </p>
            <QuestionStatus status={status} />
          </div>

          <div className="mt-3 break-words text-[13px] font-semibold leading-[1.75] text-[#071f55]">
            <RichContent
              html={
                row.questionHtml ||
                row.questionText ||
                "Question text unavailable."
              }
              base={base}
            />

            {questionImages.map((src) => (
              <Diagram key={src} src={src} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <AnswerCard
          label="Your Answer"
          value={userAnswer}
          html={row.attempted ? row.userAnswerHtml : ""}
          image={row.attempted ? row.userAnswerImage : ""}
          imagePath={base}
          type={
            status === "correct"
              ? "correct"
              : status === "wrong"
                ? "wrong"
                : "default"
          }
        />

        <AnswerCard
          label="Correct Answer"
          value={correctAnswer}
          html={row.correctAnswerHtml}
          image={row.correctAnswerImage}
          imagePath={base}
          type="correct"
        />
      </div>
    </article>
  );
}
