// app/layout.js

import { Poppins } from "next/font/google";

import "./globals.css";
import "aos/dist/aos.css";


import AOSProvider from "@/components/AOSProvider";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://mastermindacademy.in"),

  title: {
    default: "MasterMind Academy",
    template: "%s | MasterMind Academy",
  },

  description:
    "MasterMind Academy is a competitive exam preparation platform for Kerala PSC, SSC, RRB and other government exams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <AOSProvider>
          <Navbar />

          {children}
          <Footer />
        </AOSProvider>
      </body>
    </html>
  );
}