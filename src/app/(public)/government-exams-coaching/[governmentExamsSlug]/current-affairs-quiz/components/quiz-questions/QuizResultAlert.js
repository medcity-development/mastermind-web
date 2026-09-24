import Swal from "sweetalert2";

export default function showQuizResultAlert({
  quizName,
  answeredCount,
  totalQuestions,
  correctCount,
  wrongCount,
  score,
  progress,
}) {
  Swal.fire({
    title:
      score >= 80
        ? "Excellent Work! 🎉"
        : score >= 60
          ? "Well Done! 👏"
          : "Quiz Completed! 🌟",

    html: `
      <div style="
        margin-top:18px;
        text-align:left;
      ">
        <div style="
          display:grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap:12px;
        ">
          ${createResultBox({
            label:
              "Answered",
            value:
              `${answeredCount}/${totalQuestions}`,
            background:
              "#eff6ff",
            border:
              "#dbeafe",
            labelColor:
              "#2563eb",
            valueColor:
              "#164fa5",
          })}

          ${createResultBox({
            label:
              "Correct",
            value:
              correctCount,
            background:
              "#ecfdf5",
            border:
              "#bbf7d0",
            labelColor:
              "#059669",
            valueColor:
              "#047857",
          })}

          ${createResultBox({
            label:
              "Wrong",
            value:
              wrongCount,
            background:
              "#fff1f2",
            border:
              "#fecdd3",
            labelColor:
              "#e11d48",
            valueColor:
              "#be123c",
          })}

          ${createResultBox({
            label:
              "Score",
            value:
              `${score}%`,
            background:
              "#f5f3ff",
            border:
              "#ddd6fe",
            labelColor:
              "#7c3aed",
            valueColor:
              "#6d28d9",
          })}
        </div>

        <div style="
          margin-top:14px;
          border:1px solid #fbcfe8;
          background:
            linear-gradient(
              90deg,
              #fff1f6,
              #faf5ff
            );
          border-radius:16px;
          padding:14px;
          text-align:center;
        ">
          <div style="
            font-size:10px;
            font-weight:800;
            letter-spacing:.08em;
            text-transform:uppercase;
            color:#be185d;
          ">
            Completion Progress
          </div>

          <div style="
            margin-top:5px;
            font-size:20px;
            font-weight:900;
            color:#9d174d;
          ">
            ${progress}%
          </div>

          ${
            quizName
              ? `
                <div style="
                  margin-top:6px;
                  font-size:11px;
                  font-weight:700;
                  color:#9f5577;
                ">
                  ${quizName}
                </div>
              `
              : ""
          }
        </div>
      </div>
    `,

    icon:
      score >= 60
        ? "success"
        : "info",

    confirmButtonText:
      "Close",

    confirmButtonColor:
      "#f13873",

    width: 500,

    allowOutsideClick:
      false,

    allowEscapeKey:
      false,

    customClass: {
      popup:
        "quiz-result-popup",
    },
  });
}

function createResultBox({
  label,
  value,
  background,
  border,
  labelColor,
  valueColor,
}) {
  return `
    <div style="
      border:1px solid ${border};
      background:${background};
      border-radius:16px;
      padding:16px;
    ">
      <div style="
        font-size:10px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:${labelColor};
      ">
        ${label}
      </div>

      <div style="
        margin-top:5px;
        font-size:24px;
        font-weight:900;
        color:${valueColor};
      ">
        ${value}
      </div>
    </div>
  `;
}