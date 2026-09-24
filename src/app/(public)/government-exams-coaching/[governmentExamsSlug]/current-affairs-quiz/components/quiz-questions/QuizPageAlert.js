import Swal from "sweetalert2";

export default function showQuizPageAlert({
  unansweredCount,
}) {
  return Swal.fire({
    icon: "warning",

    title:
      "Complete This Page",

    text:
      unansweredCount === 1
        ? "You still have 1 unanswered question on this page."
        : `You still have ${unansweredCount} unanswered questions on this page.`,

    confirmButtonText:
      "Continue Quiz",

    confirmButtonColor:
      "#f13873",

    width: 430,

    allowOutsideClick:
      false,

    allowEscapeKey:
      true,

    customClass: {
      popup:
        "quiz-page-alert",
    },
  });
}