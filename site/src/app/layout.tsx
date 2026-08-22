import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "skilllog — LLM & Agentic AI Roadmap Tracker",
  description:
    "Interactive roadmap and progress tracker for learning LLMs, RAG, agents, MCP, evals and security.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <footer className="border-t-3 border-ink py-4 text-center text-xs font-mono">
          skilllog · built from the LLM &amp; Agentic AI gap-aware master roadmap
        </footer>
      </body>
    </html>
  );
}
