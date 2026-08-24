import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://learnllmpath.com").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or auth-gated routes: API endpoints, user account pages,
        // sign-in, and quiz/review screens that redirect guests to /login.
        disallow: ["/api/", "/admin", "/dashboard", "/login", "/profile", "/quiz/", "/review"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
