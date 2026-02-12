
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });


export const metadata: Metadata = {
  title: "Smart Bookmarks",
  description: "Manage your links intelligently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans bg-[#0f0c29] text-gray-100 min-h-screen relative overflow-x-hidden`}>

        {/* Background Gradients */}
        <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
        
        {/* Decorative blobs */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
        <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
      </body>
    </html>
  );
}
