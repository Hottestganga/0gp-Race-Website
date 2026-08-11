import { FantasyShell, SiteNav, SectionTitle } from "../components/FantasyShell";

const players = [
  ["Reedy", 12, 7, "428.2M"],
  ["Ganga", 10, 6, "391.6M"],
  ["Iron Mike", 9, 4, "344.9M"],
  ["Josh", 8, 3, "287.1M"],
  ["Hass", 7, 2, "244.8M"],
];

export default function LeaderboardPage() {
  return (
    <FantasyShell>
      <SiteNav active="leaderboard" />
      <section className="site-center-wide px-4 py-14 sm:px-7 lg:py-20">
        <SectionTitle
          eyebrow="Community Rankings"
          title="Hall of Fame"
          text="Demo rankings until persistent race history is connected to the hosted backend."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[players[1], players[0], players[2]].map((p, displayIndex) => {
            const rank = players.findIndex(x => x[0] === p[0]) + 1;
            return (
              <div key={String(p[0])} className={`game-panel rounded-2xl p-6 text-center ${rank===1?"md:-translate-y-5 border-yellow-300/40":""}`}>
                <div className="text-5xl">{rank===1?"👑":rank===2?"🥈":"🥉"}</div>
                <div className="mt-5 text-2xl font-black">{p[0]}</div>
                <div className="mt-3 font-mono text-3xl font-black text-yellow-300">{p[3]} GP</div>
                <div className="mt-4 text-xs text-zinc-600">{p[1]} races • {p[2]} wins</div>
              </div>
            )
          })}
        </div>

        <div className="game-panel mt-8 overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[70px_1fr_120px_120px_160px] border-b border-yellow-500/15 px-6 py-4 text-[9px] font-black tracking-[.2em] text-zinc-700 md:grid">
            <span>RANK</span><span>RACER</span><span>RACES</span><span>WINS</span><span>TOTAL GP</span>
          </div>
          {players.map((p, i) => (
            <div key={String(p[0])} className={`grid gap-3 border-b border-white/[.05] px-5 py-5 last:border-0 md:grid-cols-[70px_1fr_120px_120px_160px] md:items-center md:px-6 ${i===0?"bg-yellow-500/[.055]":""}`}>
              <div className="font-black text-yellow-400">{i<3?["🥇","🥈","🥉"][i]:`#${i+1}`}</div>
              <div className="text-lg font-black">{p[0]}</div>
              <div className="text-zinc-500"><span className="md:hidden text-zinc-700">Races: </span>{p[1]}</div>
              <div className="text-zinc-500"><span className="md:hidden text-zinc-700">Wins: </span>{p[2]}</div>
              <div className="font-mono font-black text-yellow-300">{p[3]} GP</div>
            </div>
          ))}
        </div>
      </section>
    </FantasyShell>
  );
}
