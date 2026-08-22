import { ROADMAP } from "@/data/roadmap";

export const metadata = { title: "Sequence — skilllog" };

export default function SequencePage() {
  return (
    <main className="nb-page nb-stack-lg">
      <header className="nb-stack pt-6 pb-2">
        <h1 className="nb-title">Suggested Sequence</h1>
        <p className="nb-subtitle">
          ~1–1.5 hrs on weekday evenings. Free short videos = evening warm-ups; Udemy
          project weeks = the deeper blocks.
        </p>
      </header>

      <div className="nb-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-3 border-ink bg-primary text-left">
              <th className="p-3 font-black">Weeks</th>
              <th className="p-3 font-black">Focus</th>
              <th className="p-3 font-black hidden sm:table-cell">Resources</th>
            </tr>
          </thead>
          <tbody>
            {ROADMAP.sequence.map((row, i) => (
              <tr key={i} className="border-b-2 border-dashed border-[#c9d2df] align-top">
                <td className="p-3 font-mono font-bold whitespace-nowrap">{row.weeks}</td>
                <td className="p-3 font-semibold">
                  {row.focus}{" "}
                  {row.isKey && <span className="nb-badge nb-badge-key ml-1">KEY</span>}
                </td>
                <td className="p-3 text-xs hidden sm:table-cell">{row.resources}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="nb-callout">
        <strong>Portfolio rule:</strong> {ROADMAP.deliverableBar}
      </div>
    </main>
  );
}
