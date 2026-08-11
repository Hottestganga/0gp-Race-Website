import Link from "next/link";
import { FantasyShell, SiteNav } from "./components/FantasyShell";

const preview = [
  ["🥇", "Reedy", "42.8M", "+4.2M"],
  ["🥈", "Ganga", "38.4M", "+820K"],
  ["🥉", "Iron Mike", "31.8M", "+2.1M"],
  ["#4", "Josh", "18.2M", "+340K"],
];

export default function Home() {
  return (
    <FantasyShell>
      <SiteNav active="home" />

      <section className="site-center-wide grid gap-8 px-4 pb-12 pt-10 sm:px-7 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:pb-20 lg:pt-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 border border-yellow-500/25 bg-black/70 px-4 py-2 text-[10px] font-black uppercase tracking-[.26em] text-yellow-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
            Competitive Old-School GP Racing
          </div>

          <h1 className="pixel-title mt-8 text-6xl font-black leading-[.84] sm:text-8xl xl:text-[7.4rem]">
            ZERO GP.
            <br />
            <span className="gold-text">ONE CROWN.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300">
            Start with nothing. Loot, skill, trade and out-race your mates while
            RuneLite tracks the score and the website broadcasts the battle live.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/live"
              className="border border-yellow-200/30 bg-gradient-to-b from-yellow-200 to-yellow-500 px-7 py-4 text-sm font-black text-black shadow-[0_14px_45px_rgba(229,185,65,.18)] transition hover:-translate-y-1"
            >
              ⚔ WATCH LIVE RACES
            </Link>
            <Link
              href="/docs"
              className="border border-yellow-500/30 bg-black/70 px-7 py-4 text-sm font-black text-yellow-300 transition hover:border-yellow-300/60"
            >
              READ THE RACE RULES
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            <Quick label="SYNC" value="LIVE" green />
            <Quick label="RACE START" value="0 GP" />
            <Quick label="MODE" value="MULTI" />
          </div>
        </div>

        <div className="game-panel overflow-hidden rounded-[30px] p-3 sm:p-5">
          <div className="relative overflow-hidden rounded-[22px] border border-yellow-500/15 bg-black/75">
            <div className="flex items-center justify-between border-b border-yellow-500/15 px-5 py-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[.26em] text-yellow-400">
                  Live Arena
                </div>
                <div className="mt-1 font-mono text-sm font-black text-zinc-300">
                  ROOM 0GP-8241
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-lime-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
                Broadcasting
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_190px]">
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="TIME LEFT" value="01:42:18" />
                  <Metric label="ALLOWANCE" value="0 GP" />
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-white/[.07]">
                  {preview.map(([rank, name, score, gain], i) => (
                    <div
                      key={name}
                      className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-white/[.06] px-4 py-3 last:border-0 ${
                        i === 0 ? "bg-yellow-500/[.085]" : "bg-black/20"
                      }`}
                    >
                      <div className="text-xl font-black text-zinc-500">{rank}</div>
                      <div>
                        <div className="font-black">{name}</div>
                        <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-lime-400">
                          ● Racing
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-yellow-300">{score} GP</div>
                        <div className="mt-1 font-mono text-[10px] font-black text-lime-400">
                          {gain}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-yellow-500/15 bg-yellow-500/[.04] p-4">
                <div className="text-[9px] font-black uppercase tracking-[.22em] text-yellow-400">
                  Race Intel
                </div>
                <div className="mt-5 space-y-5">
                  <SideStat label="LEADER" value="Reedy" />
                  <SideStat label="SCORE" value="42.8M" />
                  <SideStat label="RACERS" value="4" />
                  <SideStat label="CONNECTION" value="LIVE" green />
                </div>
                <div className="gold-line mt-6" />
                <p className="mt-5 text-xs leading-6 text-zinc-500">
                  Every score shown here comes from the live room sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-yellow-500/10 bg-black/70">
        <div className="site-center-wide grid gap-4 px-4 py-8 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
          <Feature icon="⚡" title="Instant Sync" text="Race standings update while players are still in game." />
          <Feature icon="🏦" title="Import Protection" text="Outside wealth is separated from legitimate race progress." />
          <Feature icon="⏸" title="Save & Pause" text="Pause safely, save progress and resume on the correct account." />
          <Feature icon="🏆" title="Spectator Mode" text="Friends and clans can watch the race unfold from any browser." />
        </div>
      </section>

      <section className="site-center-wide px-4 py-20 sm:px-7">
        <div className="grid gap-5 lg:grid-cols-3">
          <Step n="01" title="CREATE THE ARENA" text="Choose the race duration and allowance in RuneLite. Share the generated room code." />
          <Step n="02" title="BUILD YOUR STACK" text="Make GP however you can within the rules: PvM, skilling, loot, trading and more." />
          <Step n="03" title="TAKE THE CROWN" text="The live dashboard follows every racer until the timer ends and the winner is declared." />
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[.06] bg-black/80">
        <div className="site-center-wide flex flex-col justify-between gap-3 px-4 py-7 text-[9px] uppercase tracking-[.18em] text-zinc-700 sm:flex-row sm:px-7">
          <span>0GP Race • RuneLite race platform</span>
          <span>Not affiliated with Jagex Ltd.</span>
        </div>
      </footer>
    </FantasyShell>
  );
}

function Quick({ label, value, green=false }: { label:string; value:string; green?:boolean }) {
  return <div className="border border-white/[.08] bg-black/60 p-3"><div className="text-[8px] font-black tracking-[.2em] text-zinc-700">{label}</div><div className={`mt-1 font-black ${green?"text-lime-400":"text-yellow-300"}`}>{value}</div></div>;
}
function Metric({ label, value }: { label:string; value:string }) {
  return <div className="rounded-xl border border-white/[.07] bg-black/45 p-4"><div className="text-[8px] font-black tracking-[.2em] text-zinc-700">{label}</div><div className="mt-2 font-mono text-xl font-black text-zinc-200">{value}</div></div>;
}
function SideStat({ label, value, green=false }: { label:string; value:string; green?:boolean }) {
  return <div><div className="text-[8px] font-black tracking-[.2em] text-zinc-700">{label}</div><div className={`mt-1 font-black ${green?"text-lime-400":"text-zinc-200"}`}>{value}</div></div>;
}
function Feature({ icon, title, text }: { icon:string; title:string; text:string }) {
  return <div className="game-panel p-5"><div className="text-2xl">{icon}</div><h3 className="mt-4 font-black text-yellow-200">{title}</h3><p className="mt-2 text-xs leading-6 text-zinc-500">{text}</p></div>;
}
function Step({ n, title, text }: { n:string; title:string; text:string }) {
  return <article className="game-panel min-h-64 p-7"><div className="font-mono text-sm font-black text-yellow-500/60">{n}</div><div className="gold-line mt-5" /><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-4 text-sm leading-7 text-zinc-500">{text}</p></article>;
}
