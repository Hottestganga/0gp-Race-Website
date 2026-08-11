import Link from "next/link";
import { FantasyShell, SiteNav, SectionTitle } from "../components/FantasyShell";

const races = [
  { room: "0GP-1184", winner: "Reedy", score: "83.4M GP", duration: "4h", players: 8, crown: "🥇" },
  { room: "0GP-8742", winner: "Ganga", score: "51.8M GP", duration: "2h", players: 5, crown: "🥈" },
  { room: "0GP-3391", winner: "Iron Mike", score: "144.2M GP", duration: "8h", players: 12, crown: "🏆" },
];

export default function HistoryPage() {
  return (
    <FantasyShell>
      <SiteNav active="history" />
      <section className="site-center-wide px-4 py-14 sm:px-7 lg:py-20">
        <SectionTitle
          eyebrow="Hall of Battles"
          title="Race History"
          text="A visual archive for completed 0GP races. The current cards are demo records until permanent backend history is connected."
        />

        <div className="mt-12 grid gap-5">
          {races.map((r, i) => (
            <article key={r.room} className="game-panel overflow-hidden rounded-2xl">
              <div className="grid gap-5 p-6 md:grid-cols-[90px_1fr_auto] md:items-center md:p-7">
                <div className="grid h-20 w-20 place-items-center rounded-full border border-yellow-500/25 bg-yellow-500/[.07] text-4xl">
                  {r.crown}
                </div>
                <div>
                  <div className="font-mono text-xs font-black tracking-widest text-yellow-400">{r.room}</div>
                  <h2 className="mt-2 text-2xl font-black">{r.winner} claimed the crown</h2>
                  <p className="mt-2 text-sm text-zinc-600">Race #{races.length-i} • completed event record</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Info label="WINNING SCORE" value={r.score} gold />
                  <Info label="DURATION" value={r.duration} />
                  <Info label="RACERS" value={String(r.players)} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="game-panel mt-8 rounded-2xl p-6 text-sm leading-7 text-zinc-500">
          Permanent race history will become fully live once completed race records are stored by the hosted backend.
        </div>
      </section>
    </FantasyShell>
  );
}

function Info({ label, value, gold=false }: { label:string; value:string; gold?:boolean }) {
  return <div className="min-w-[100px] border-l border-yellow-500/15 pl-4"><div className="text-[8px] font-black tracking-[.18em] text-zinc-700">{label}</div><div className={`mt-2 font-black ${gold?"text-yellow-300":"text-zinc-200"}`}>{value}</div></div>;
}
