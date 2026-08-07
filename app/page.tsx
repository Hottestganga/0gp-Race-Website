import Link from "next/link";

const demoPlayers = [
  { rank: 1, name: "Reedy", score: "42.8M GP", recent: "+4.2M" },
  { rank: 2, name: "Ganga", score: "38.4M GP", recent: "+820K" },
  { rank: 3, name: "Iron Mike", score: "31.8M GP", recent: "+2.1M" },
  { rank: 4, name: "Josh", score: "18.2M GP", recent: "+340K" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none fixed left-1/2 top-[-260px] h-[720px] w-[920px] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[170px]" />

      <Nav />

      <section className="relative z-10 mx-auto grid min-h-[88vh] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-yellow-500/25 bg-yellow-500/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
            RuneLite competition plugin
          </div>

          <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.06em] sm:text-8xl xl:text-9xl">
            START
            <br />
            FROM
            <br />
            <span className="gold-text">NOTHING.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
            Race your friends from 0 GP and see who can build the most
            legitimate wealth before the clock runs out.
          </p>

          <p className="mt-4 max-w-xl leading-7 text-zinc-500">
            Automatic wealth tracking, bank import protection, race statistics,
            custom starting allowances and multiplayer competition — inside RuneLite.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/live"
              className="rounded-xl bg-yellow-500 px-7 py-4 text-center font-black text-black transition hover:-translate-y-1 hover:bg-yellow-400"
            >
              WATCH LIVE RACES
            </Link>

            <Link
              href="/docs"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-7 py-4 text-center font-black transition hover:border-yellow-500 hover:text-yellow-400"
            >
              HOW IT WORKS
            </Link>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">
              Installation
            </p>
            <p className="mt-2 text-zinc-300">
              Install from the official RuneLite Plugin Hub by searching for
              <span className="font-black text-yellow-400"> 0GP Race</span>.
            </p>
            <p className="mt-2 text-xs text-zinc-600">Plugin Hub review currently in progress.</p>
          </div>
        </div>

        <DemoRace />
      </section>

      <section className="relative z-10 border-t border-white/10 px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
            How it works
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Three steps. One winner.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <Step number="01" title="Create the race" text="Choose a duration and optional starting allowance, then share the room code." />
            <Step number="02" title="Play OSRS" text="Earn wealth normally while 0GP Race tracks and validates race-owned value." />
            <Step number="03" title="Take the crown" text="When the timer expires, the racer with the highest legitimate GP total wins." />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-zinc-950/40 px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Built for fair competition
            </p>
            <h2 className="mt-4 text-4xl font-black sm:text-6xl">
              The game tracks the loot.
              <br />
              We track the race.
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Feature icon="GP" title="Automatic Wealth Tracking" text="Legitimate race-earned value automatically contributes to your score." />
            <Feature icon="BANK" title="Bank Import Protection" text="Pre-race items are debited while they are being used in the competition." />
            <Feature icon="LIVE" title="Multiplayer Rooms" text="Create rooms, invite friends and follow live standings." />
            <Feature icon="30S" title="Misclick Protection" text="A 30-second grace period prevents accidental bank withdrawals ruining long races." />
            <Feature icon="LOG" title="Race Activity" text="A transaction history records how race value and score changes occurred." />
            <Feature icon="CLAN" title="Built for Events" text="Made for clan competitions, Discord groups and community tournaments." />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 px-6 py-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 h-3 w-3 animate-pulse rounded-full bg-yellow-500 shadow-[0_0_30px_rgba(234,179,8,.8)]" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
            Spectator mode
          </p>
          <h2 className="mt-4 text-5xl font-black sm:text-7xl">
            WATCH THE RACE <span className="text-yellow-500">LIVE.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
            Live room pages will show competitors, positions, remaining time and race scores as they update.
          </p>
          <Link
            href="/live"
            className="mt-9 inline-block rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-7 py-4 font-black text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
          >
            VIEW LIVE RACES
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav className="relative z-20 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-black">
          0GP <span className="text-yellow-500">RACE</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-bold text-zinc-400 md:flex">
          <Link href="/live" className="hover:text-yellow-500">Live Races</Link>
          <Link href="/leaderboard" className="hover:text-yellow-500">Leaderboard</Link>
          <Link href="/history" className="hover:text-yellow-500">Race History</Link>
          <Link href="/docs" className="hover:text-yellow-500">Docs</Link>
        </div>
        <div className="rounded-full border border-yellow-500/35 bg-yellow-500/10 px-4 py-2 text-xs font-black text-yellow-400">
          RuneLite Plugin
        </div>
      </div>
    </nav>
  );
}

function DemoRace() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[40px] bg-yellow-500/10 blur-3xl" />
      <div className="gold-shadow relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-zinc-950/95 backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">Live Race Preview</p>
            <h2 className="mt-1 text-2xl font-black">ROOM 0GP-8241</h2>
          </div>
          <div className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-black text-green-400">● LIVE</div>
        </div>

        <div className="grid grid-cols-2 border-b border-white/10">
          <MiniStat label="Time Remaining" value="01:42:18" />
          <MiniStat label="Starting Allowance" value="0 GP" gold />
        </div>

        <div className="p-6">
          <div className="mb-4 flex justify-between text-xs font-black uppercase tracking-[0.2em] text-zinc-600">
            <span>Leaderboard</span><span>4 Racers</span>
          </div>
          <div className="space-y-3">
            {demoPlayers.map((player) => (
              <div
                key={player.rank}
                className={`grid grid-cols-[45px_1fr_auto] items-center rounded-xl border p-4 ${
                  player.rank === 1 ? "border-yellow-500/40 bg-yellow-500/[0.05]" : "border-white/5 bg-black/40"
                }`}
              >
                <div className={player.rank === 1 ? "text-xl font-black text-yellow-500" : "text-xl font-black text-zinc-600"}>#{player.rank}</div>
                <div>
                  <div className="font-black">{player.name}</div>
                  <div className="mt-1 text-xs text-green-500">{player.recent} recent</div>
                </div>
                <div className="font-mono font-black text-yellow-400">{player.score}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/5 bg-black/60 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-zinc-600">Example race event</p>
            <div className="mt-3 flex justify-between gap-5">
              <div><p className="font-black">Reedy obtained</p><p className="text-sm text-zinc-500">Dragon warhammer</p></div>
              <p className="font-mono font-black text-green-400">+39.2M</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="border-r border-white/10 p-5 last:border-r-0">
      <p className="text-xs uppercase tracking-wider text-zinc-600">{label}</p>
      <p className={`mt-1 text-2xl font-black ${gold ? "text-yellow-500" : ""}`}>{value}</p>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-zinc-950 p-8 transition duration-300 hover:-translate-y-2 hover:border-yellow-500/50">
      <div className="text-5xl font-black text-yellow-500/20 transition group-hover:text-yellow-500">{number}</div>
      <h3 className="mt-8 text-2xl font-black">{title}</h3>
      <p className="mt-4 leading-7 text-zinc-500">{text}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-black/60 p-7 transition duration-300 hover:border-yellow-500/50 hover:bg-yellow-500/[0.03]">
      <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 text-xs font-black text-yellow-500">{icon}</div>
      <h3 className="mt-6 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-zinc-500">{text}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-zinc-600 sm:flex-row">
        <div><span className="font-black text-white">0GP <span className="text-yellow-500">RACE</span></span><span className="ml-3">Developed by Ganga</span></div>
        <div>Community project for Old School RuneScape.</div>
      </div>
    </footer>
  );
}
