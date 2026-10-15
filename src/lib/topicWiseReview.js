function parseArray(value) {
  for (let i = 0; i < 3; i += 1) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string" || !value.trim()) return [];
    try { value = JSON.parse(value); }
    catch {
      return value.replace(/^\[|\]$/g, "").split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""));
    }
  }
  return [];
}

function first(...values) {
  return values.find((value) => value != null && String(value).trim() !== "") ?? "";
}

function key(value) {
  const text = String(value ?? "").trim();
  if (!text || /^(0|null|undefined)$/i.test(text)) return "";
  const match = text.match(/^([A-Z])(?:[.)\s]|$)/i);
  return match ? match[1].toUpperCase() : text;
}

export function reviewText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function optionsOf(question) {
  if (Array.isArray(question.options)) {
    return question.options.map((option, index) => ({
      key: key(typeof option === "object" && option !== null
        ? first(option.key, option.label, String.fromCharCode(65 + index))
        : String.fromCharCode(65 + index)),
      text: reviewText(typeof option === "object" && option !== null
        ? first(option.text, option.value, option.option, option.answer)
        : option),
    }));
  }
  return ["A", "B", "C", "D", "E"].map((letter, index) => {
    const lower = letter.toLowerCase();
    return {
      key: letter,
      text: reviewText(first(
        question[`option_${lower}`], question[`option${lower}`],
        question[`option_${letter}`], question[`option${letter}`],
        question[`option${index + 1}`], question[`option_${index + 1}`],
        question[`answer_${lower}`], question[letter], question[lower]
      )),
    };
  }).filter((option) => option.text);
}

function answerDisplay(answer, options, empty) {
  const answerKey = key(answer);
  if (!answerKey) return empty;
  const option = options.find((item) => item.key === answerKey);
  return option?.text ? `${answerKey}. ${option.text}` : answerKey;
}

export function buildTopicWiseReview(questions, attempt) {
  if (!Array.isArray(questions) || !questions.length) {
    throw new Error("The backend did not return the question paper.");
  }
  const user = parseArray(attempt.user_answers ?? attempt.user_answer_array);
  const correct = parseArray(attempt.answer_array ?? attempt.correct_answers);
  if (user.length !== questions.length) {
    throw new Error("Saved answers and loaded questions have different lengths. Review cannot be matched safely.");
  }
  const savedIds = parseArray(attempt.question_ids ?? attempt.questionIds);
  if (savedIds.length && (savedIds.length !== questions.length ||
      savedIds.some((id, index) => String(id) !== String(questions[index].id)))) {
    throw new Error("The saved question order differs from the loaded paper.");
  }
  return questions.map((question, index) => {
    const options = optionsOf(question);
    const selected = key(user[index]);
    const expected = key(correct.length === questions.length
      ? correct[index]
      : first(question.answerkey, question.answer_key, question.correct_answer,
          question.correctAnswer, question.right_answer, question.answer, question.ans));
    return {
      id: question.id ?? question.question_id ?? index,
      number: index + 1,
      text: reviewText(first(question.question, question.question_text,
        question.questionText, question.question_name, question.qname, question.qn)),
      attached: first(question.attached, question.question_image, question.image),
      options,
      selected,
      expected,
      userDisplay: answerDisplay(selected, options, "Not Answered"),
      correctDisplay: answerDisplay(expected, options, "Not Available"),
      status: !selected ? "unanswered" : !expected ? "unknown"
        : selected === expected ? "correct" : "wrong",
    };
  });
}
