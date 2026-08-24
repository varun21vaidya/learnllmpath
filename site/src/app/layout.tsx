import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://learnllmpath.com"),
  title: "Learn LLM Path: Free Roadmap to Master LLMs & Agentic AI",
  description:
    "Learn LLM Path is a free, step-by-step roadmap to master large language models and agentic AI: RAG, LangChain, MCP, evals and security. Start free today.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Learn LLM Path",
    title: "Learn LLM Path: Free Roadmap to Master LLMs & Agentic AI",
    description:
      "A free, step-by-step roadmap from LLM fundamentals to RAG, agents, MCP, evals and security. Quizzes, spaced review and a dated study plan included.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Learn LLM Path: free roadmap to master large language models and agentic AI, covering RAG, agents, MCP, evals and OWASP security",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn LLM Path: Free Roadmap to Master LLMs & Agentic AI",
    description:
      "A free, step-by-step roadmap from LLM fundamentals to RAG, agents, MCP, evals and security. Quizzes, spaced review and a dated study plan included.",
    images: ["/og-image.png"],
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t-3 border-ink py-4 text-center text-xs font-mono">
          Learn LLM Path · built from the LLM &amp; Agentic AI master roadmap
        </footer>
      </body>
    </html>
  );
}
