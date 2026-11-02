"use client";

import Image from "next/image";
import {
  getQuestionOptions,
} from "./utils/examUtils";

function optionText(question, letter) {
  const index = letter.charCodeAt(0) - 65;
  const fields = [
    `option${index + 1}`,
    `option_${index + 1}`,
    `option${letter}`,
    `option${letter.toLowerCase()}`,
    `option_${letter.toLowerCase()}`,
    `option_${letter}`,
    `choice${letter}`,
    `choice_${letter.toLowerCase()}`,
    letter,
    letter.toLowerCase(),
  ];

  for (const field of fields) {
    if (question?.[field] != null && String(question[field]).trim()) {
      return String(question[field]);
    }
  }

  for (const source of [
    question?.options,
    question?.choices,
    question?.option_list,
    question?.optionList,
  ]) {
    if (Array.isArray(source)) {
      const item = source[index];
      if (item != null) {
        return typeof item === "object"
          ? String(
              item.text ??
              item.value ??
              item.title ??
              item.option_text ??
              item.option_value ??
              ""
            )
          : String(item);
      }
    } else if (source && typeof source === "object") {
      const value = source[letter] ?? source[letter.toLowerCase()];
      if (value != null) return String(value);
    }
  }

  return "";
}

export default function QuestionCard({
  question,
  index,
  selectedAnswer,
  disabled = false,
  onSelect,
}) {
  const questionText =
    question?.question ??
    question?.question_text ??
    question?.questionText ??
    question?.title ??
    "";
  const options = getQuestionOptions(question);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-800">
            {String(questionText)}
          </div>
          {question?.image && (
            <Image
              src={question.image}
              alt={`Question ${index + 1}`}
              width={800}
              height={450}
              unoptimized
              className="mt-4 max-h-80 max-w-full rounded-xl object-contain"
            />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {options.map((letter) => {
          const selected = selectedAnswer === letter;

          return (
            <button
              key={letter}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(letter)}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                selected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {letter}
              </span>
              <span className="pt-1">{optionText(question, letter)}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
