import { ROADMAP } from "@/data/roadmap";
import Link from "next/link";

export const metadata = { title: "Portfolio — skilllog" };

export default function PortfolioPage() {
  return (
    <main className="nb-page nb-stack-lg">
      <header className="nb-stack pt-6 pb-2">
        <h1 className="nb-title">Portfolio Projects</h1>
        <p className="nb-subtitle">
          Build one per phase. Deployed, demoable projects beat any certificate.
        </p>
      </header>

      <ol className="grid gap-4 sm:grid-cols-2">
        {ROADMAP.portfolio.map((project, i) => (
          <li key={project.id} className="nb-card nb-p-5 flex gap-4 items-start">
            <span className="nb-badge nb-badge-course !text-base !px-2 !py-1">{i + 1}</span>
            <p className="font-semibold leading-snug">{project.title}</p>
          </li>
        ))}
      </ol>

      <div className="nb-callout">
        <strong>Deliverable bar:</strong> {ROADMAP.deliverableBar}
      </div>

      <Link href="/" className="nb-btn nb-btn-primary w-fit">
        ← Back to roadmap
      </Link>
    </main>
  );
}
