import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { KeyboardNavigationProvider } from "@/components/KeyboardNavigationProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevMatch - 개발자 프로젝트 매칭 플랫폼",
  description: "기술 스택과 관심사가 맞는 팀원들과 함께할 프로젝트를 찾아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          <KeyboardNavigationProvider>
            <a href="#main-content" className="skip-nav">
              메인 콘텐츠로 이동
            </a>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="border-t py-6">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                  © 2023 DevMatch. All rights reserved.
                </div>
              </footer>
            </div>
            <Toaster />
          </KeyboardNavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
