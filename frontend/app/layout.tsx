import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" />
      </head>
      <body className="h-full bg-background text-foreground font-sans flex overflow-hidden">
        {/* Persistent left sidebar */}
        <Sidebar />
        
        {/* Main stage right side */}
        <div className="flex-grow flex flex-col h-screen overflow-hidden">
          {/* Persistent header */}
          <Header />
          
          {/* Scrollable contents page */}
          <main className="flex-grow overflow-y-auto px-6 md:px-8 pb-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
