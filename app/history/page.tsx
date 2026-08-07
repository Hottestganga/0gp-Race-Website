import Link from "next/link";

const history = [
  { room: "0GP-1184", winner: "Reedy", score: "83.4M GP", duration: "4h", players: 8 },
  { room: "0GP-8742", winner: "Ganga", score: "51.8M GP", duration: "2h", players: 5 },
  { room: "0GP-3391", winner: "Iron Mike", score: "144.2M GP", duration: "8h", players: 12 },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black">0GP <span className="text-yellow-500">RACE</span></Link>
          <span className="text-sm font-black text-zinc-500">RACE HISTORY</span>
        </div>
      </nav>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">Archive</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">RACE HISTORY</h1>
        <p className="mt-6 max-w-2xl text-zinc-400">This page is ready for persistent backend data once completed races are stored.</p>

        <div className="mt-12 space-y-4">
          {history.map((r) => (
            <div key={r.room} className="grid gap-5 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
              <div>
                <p className="font-mono text-sm text-yellow-500">{r.room}</p>
                <p className="mt-2 text-xl font-black">{r.winner} won</p>
              </div>
              <Info label="Winning score" value={r.score} />
              <Info label="Duration" value={r.duration} />
              <Info label="Players" value={String(r.players)} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase text-zinc-600">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}
