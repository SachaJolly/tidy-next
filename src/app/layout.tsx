import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

import "./primitives.css";
import "./themes.css";
import "./globals.css";
import "./layout.module.scss";

import Navbar from "@/app/components/navbar/navbar";
import Footer from "@/app/components/footer/footer";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-interface",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headers",
  subsets: ["latin"],
  weight: ["700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <div className="application-ui">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
