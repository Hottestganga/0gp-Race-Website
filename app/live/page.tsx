import Link from "next/link";

const races = [
  { room: "0GP-8241", name: "Saturday Clan Race", players: 8, leader: "Reedy", score: "42.8M GP", time: "01:42:18" },
  { room: "0GP-5519", name: "Ironman Sprint", players: 4, leader: "Ganga", score: "18.4M GP", time: "00:37:55" },
  { room: "0GP-9902", name: "Discord 4 Hour Race", players: 12, leader: "Josh", score: "71.2M GP", time: "02:11:09" },
];

export default function LiveRacesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <PageNav title="Live Races" />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">Spectator Mode</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">LIVE RACES</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Demo listings for now. Once the hosted API is connected, active rooms will appear here automatically.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {races.map((race) => (
            <Link key={race.room} href={`/race/${race.room}`} className="group rounded-3xl border border-white/10 bg-zinc-950 p-7 transition hover:-translate-y-1 hover:border-yellow-500/50">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-green-400">LIVE</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black">{race.name}</h2>
                  <p className="mt-1 font-mono text-sm text-yellow-500">{race.room}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black px-4 py-3 text-right">
                  <p className="text-xs uppercase text-zinc-600">Time Left</p>
                  <p className="mt-1 font-mono font-black">{race.time}</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <RaceStat label="Players" value={race.players.toString()} />
                <RaceStat label="Leader" value={race.leader} />
                <RaceStat label="Top Score" value={race.score} />
              </div>
              <div className="mt-7 text-sm font-black text-yellow-500">WATCH RACE →</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function PageNav({ title }: { title: string }) {
  return (
    <nav className="border-b border-white/10 bg-black/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-black">0GP <span className="text-yellow-500">RACE</span></Link>
        <span className="text-sm font-black text-zinc-500">{title}</span>
      </div>
    </nav>
  );
}

function RaceStat({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-2 font-black">{value}</p></div>;
}
