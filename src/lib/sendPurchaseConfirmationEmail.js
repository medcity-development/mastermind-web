
import "server-only";

import { Resend } from "resend";

const BRAND_NAME = "MasterMind Academy";

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );
}

function formatMoney(paise) {
  const amount = Number(paise);

  if (
    !Number.isSafeInteger(amount) ||
    amount < 0
  ) {
    throw new Error("Invalid payment amount.");
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);
}

function formatPurchaseDate(value) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new Error("Invalid purchase date.");
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function makeRow(label, value) {
  return `
    <tr>
      <td style="
        padding:14px 10px;
        border-bottom:1px solid #e2e8f0;
        color:#64748b;
        font-size:13px;
        vertical-align:top;
      ">
        ${escapeHtml(label)}
      </td>

      <td style="
        padding:14px 10px;
        border-bottom:1px solid #e2e8f0;
        color:#0f172a;
        font-size:13px;
        font-weight:600;
        text-align:right;
        overflow-wrap:anywhere;
      ">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

export async function sendPurchaseConfirmationEmail({
  email,
  name,
  packageName,
  orderId,
  paymentId,
  amountPaise,
  validityDays,
  purchasedAt,
}) {
  const recipient = String(email ?? "").trim();

  const sender = String(
    process.env.PURCHASE_EMAIL_FROM ?? ""
  ).trim();

  const apiKey = String(
    process.env.RESEND_API_KEY ?? ""
  ).trim();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)
  ) {
    throw new Error(
      "A valid student email is required."
    );
  }

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is missing."
    );
  }

  if (!sender) {
    throw new Error(
      "PURCHASE_EMAIL_FROM is missing."
    );
  }

  if (
    !String(orderId ?? "").trim() ||
    !String(paymentId ?? "").trim()
  ) {
    throw new Error(
      "Order ID and payment ID are required."
    );
  }

  const days = Number(validityDays);

  if (
    !Number.isSafeInteger(days) ||
    days <= 0
  ) {
    throw new Error(
      "Invalid package validity."
    );
  }

  const studentName =
    String(name ?? "").trim() || "Student";

  const planName =
    String(packageName ?? "").trim() ||
    "Premium Package";

  const purchaseDate =
    formatPurchaseDate(purchasedAt);

  const formattedAmount =
    formatMoney(amountPaise);

  const details = [
    ["Package", planName],
    ["Order ID", orderId],
    ["Payment ID", paymentId],
    ["Amount paid", formattedAmount],
    ["Validity", `${days} days`],
    ["Purchase date", purchaseDate],
  ];

  const rows = details
    .map(([label, value]) =>
      makeRow(label, value)
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        <title>Purchase Confirmation</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f1f5f9;
        font-family:Arial,Helvetica,sans-serif;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          padding:28px 12px;
        ">
          <div style="
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            border:1px solid #e2e8f0;
          ">
            <div style="
              background:#05176a;
              padding:32px 26px;
              color:#ffffff;
            ">
              <p style="
                margin:0 0 12px;
                font-size:12px;
                letter-spacing:1.5px;
                font-weight:700;
                color:#bfdbfe;
              ">
                PURCHASE CONFIRMATION
              </p>

              <h1 style="
                margin:0;
                font-size:27px;
                line-height:1.3;
              ">
                ${BRAND_NAME}
              </h1>

              <p style="
                margin:12px 0 0;
                color:#dbeafe;
                font-size:15px;
              ">
                Your premium package is activated
              </p>
            </div>

            <div style="padding:30px 24px;">
              <h2 style="
                margin:0 0 14px;
                color:#0f172a;
                font-size:22px;
              ">
                Thank you,
                ${escapeHtml(studentName)}!
              </h2>

              <p style="
                margin:0 0 22px;
                color:#475569;
                line-height:1.8;
                font-size:14px;
              ">
                We have received your payment.
                Your premium learning package has
                been activated successfully.
              </p>

              <div style="
                padding:18px;
                background:#eff6ff;
                border:1px solid #bfdbfe;
                border-radius:12px;
                margin-bottom:24px;
              ">
                <p style="
                  margin:0 0 7px;
                  font-size:12px;
                  color:#475569;
                ">
                  Total amount paid
                </p>

                <p style="
                  margin:0;
                  font-size:28px;
                  font-weight:800;
                  color:#05176a;
                ">
                  ${escapeHtml(formattedAmount)}
                </p>
              </div>

              <h3 style="
                margin:0 0 14px;
                color:#0f172a;
                font-size:17px;
              ">
                Purchase details
              </h3>

              <table
                role="presentation"
                style="
                  width:100%;
                  border-collapse:collapse;
                "
              >
                ${rows}
              </table>

              <p style="
                margin:26px 0 0;
                color:#475569;
                font-size:14px;
                line-height:1.8;
              ">
                Sign in to your student dashboard
                to access your purchased courses,
                mock tests, and study materials.
              </p>

              <p style="
                margin:26px 0 0;
                color:#0f172a;
                font-size:14px;
                line-height:1.7;
              ">
                Happy learning!<br />
                <strong>
                  Team MasterMind Academy
                </strong>
              </p>
            </div>

            <div style="
              padding:18px 24px;
              background:#f8fafc;
              border-top:1px solid #e2e8f0;
              text-align:center;
            ">
              <p style="
                margin:0;
                color:#94a3b8;
                font-size:12px;
              ">
                This is an automated purchase
                confirmation email.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = [
    BRAND_NAME,
    "",
    `Thank you, ${studentName}!`,
    "Your premium package has been activated.",
    "",
    ...details.map(
      ([label, value]) => `${label}: ${value}`
    ),
    "",
    "Sign in to your student dashboard to access your package.",
    "",
    "Team MasterMind Academy",
  ].join("\n");

  const resend = new Resend(apiKey);

  const { data, error } =
    await resend.emails.send(
      {
        from: sender,
        to: [recipient],
        subject:
          "Payment Successful | MasterMind Academy",
        html,
        text,
      },
      {
        idempotencyKey:
          `purchase-confirmation/${paymentId}`,
      }
    );

  if (error) {
    console.error(
      "Resend purchase email error:",
      {
        paymentId,
        message: error.message,
        name: error.name,
      }
    );

    throw new Error(
      error.message ||
        "Unable to send purchase confirmation."
    );
  }

  if (!data?.id) {
    throw new Error(
      "Email provider did not confirm acceptance."
    );
  }

  console.info(
    "Purchase email accepted by Resend:",
    {
      paymentId,
      emailId: data.id,
    }
  );

  return {
    status: true,
    emailId: data.id,
  };
}
