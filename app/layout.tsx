import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AiButton from "@/components/AiButton";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeVerse",
  description: "AI-powered recipe discovery and cooking assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex relative">
        <AuthProvider>
          <Sidebar />
          <div className="w-full relative">
            <Navbar />
            <div className="">
              {children}
            </div>
          </div>

          <AiButton />
          <ToastContainer position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
