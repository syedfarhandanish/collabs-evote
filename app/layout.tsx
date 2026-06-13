import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collabs | E-Learning Initiative",
  description: "Secure, Transparent, and Decentralized Campus Voting System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative min-h-screen bg-slate-50 overflow-x-hidden selection:bg-indigo-500 selection:text-white`}>
        
        {/* GLOBAL ANIMATED BACKGROUND (Glassmorphism & Mesh Gradient) */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-300/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-purple-300/20 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
        </div>

        {/* The main app content */}
        <div className="relative z-10">
          {children}
        </div>
        
      </body>
    </html>
  );
}