import Link from "next/link";

const players = [
  ["Reedy", 12, 7, "428.2M"],
  ["Ganga", 10, 6, "391.6M"],
  ["Iron Mike", 9, 4, "344.9M"],
  ["Josh", 8, 3, "287.1M"],
  ["Hass", 7, 2, "244.8M"],
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <PageNav />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">Community Rankings</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">LEADERBOARD</h1>
        <p className="mt-6 max-w-2xl text-zinc-400">Demo data until persistent race history is connected to the hosted backend.</p>

        <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
          <div className="grid grid-cols-[55px_1fr_90px_90px_120px] border-b border-white/10 px-5 py-4 text-xs font-black uppercase tracking-wider text-zinc-600">
            <span>#</span><span>Player</span><span>Races</span><span>Wins</span><span>Total GP</span>
          </div>
          {players.map((p, i) => (
            <div key={p[0]} className={`grid grid-cols-[55px_1fr_90px_90px_120px] items-center px-5 py-5 ${i < players.length - 1 ? "border-b border-white/5" : ""}`}>
              <span className={i === 0 ? "font-black text-yellow-500" : "font-black text-zinc-600"}>#{i+1}</span>
              <span className="font-black">{p[0]}</span>
              <span className="text-zinc-400">{p[1]}</span>
              <span className="text-zinc-400">{p[2]}</span>
              <span className="font-mono font-black text-yellow-400">{p[3]}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function PageNav() {
  return (
    <nav className="border-b border-white/10 bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-black">0GP <span className="text-yellow-500">RACE</span></Link>
        <Link href="/live" className="text-sm font-black text-zinc-500 hover:text-yellow-500">LIVE RACES</Link>
      </div>
    </nav>
  );
}
