import "./globals.css";

import {
  Poppins,
} from "next/font/google";

import AOSProvider from "@/components/AOSProvider";

const poppins = Poppins({
  subsets: [
    "latin",
  ],

  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
  ],

  variable:
    "--font-poppins",

  display:
    "swap",
});

export const metadata = {
  metadataBase:
    new URL(
      "https://mastermindacademy.in"
    ),

  title: {
    default:
      "MasterMind Academy",

    template:
      "%s | MasterMind Academy",
  },

  description:
    "MasterMind Academy - Kerala PSC, SSC and RRB competitive exam coaching.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html
      lang="en"
      className={
        poppins.variable
      }
    >
      <body
        className="
          font-sans
          antialiased
        "
      >
        <AOSProvider>
          {children}
        </AOSProvider>
      </body>
    </html>
  );
}