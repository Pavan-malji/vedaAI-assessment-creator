import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment Creator",
  description: "Create and manage structured classroom assessments with ease using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="app-shell h-full bg-background text-foreground font-sans flex overflow-hidden">
        {/* Persistent left sidebar */}
        <Sidebar />
        
        {/* Main stage right side */}
        <div className="app-shell-main grow flex flex-col h-screen overflow-hidden">
          {/* Persistent header */}
          <Header />
          
          {/* Scrollable contents page */}
          <main className="app-shell-content grow overflow-y-auto px-6 md:px-8 pb-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
