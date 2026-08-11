"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Player = {
  playerName: string;
  score: number;
  remainingMilliseconds: number;
  loggedIn: boolean;
  raceState: string;
};

type Room = {
  roomCode: string;
  raceName: string;
  durationMilliseconds: number;
  startingAllowance: number;
  players: Player[];
};

type ScoreChanges = Record<string, number>;
type RankMap = Record<string, number>;

type ActivityEvent = {
  id: string;
  player: string;
  amount: number;
  at: number;
};

type HistoryPoint = {
  at: number;
  scores: Record<string, number>;
};

const API_URL =
  process.env.NEXT_PUBLIC_0GP_API_URL ||
  process.env.NEXT_PUBLIC_OGP_API_URL ||
  "https://kaha-0gp-challenge.onrender.com";

const GOLD = "#e4b63f";
const GOLD_LIGHT = "#ffe08a";

function formatGP(value: number) {
  return (
    new Intl.NumberFormat("en-AU", {
      maximumFractionDigits: 0,
    }).format(Math.round(value || 0)) + " GP"
  );
}

function shortGP(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toString();
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const clock = [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");

  return days > 0 ? `${days}d ${clock}` : clock;
}

function timeAgo(at: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - at) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function medal(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
}

function stateLabel(player: Player) {
  if (!player.loggedIn) return "OFFLINE";
  if (player.raceState === "PAUSED") return "PAUSED";
  if (player.raceState === "RUNNING") return "RACING";
  return player.raceState || "ONLINE";
}

function stateColour(player: Player) {
  if (!player.loggedIn) return "bg-zinc-600";
  if (player.raceState === "PAUSED") return "bg-amber-400";
  if (player.raceState === "RUNNING") return "bg-lime-400";
  return "bg-sky-400";
}

export default function RacePage() {
  const params = useParams();
  const roomCode = String(params.roomCode || "").toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastServerUpdate, setLastServerUpdate] = useState(Date.now());
  const [clockNow, setClockNow] = useState(Date.now());
  const [scoreChanges, setScoreChanges] = useState<ScoreChanges>({});
  const [rankChanges, setRankChanges] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [copied, setCopied] = useState(false);

  const previousScores = useRef<Record<string, number>>({});
  const previousRanks = useRef<RankMap>({});

  async function loadRace() {
    try {
      const response = await fetch(
        `${API_URL}/api/room?roomCode=${encodeURIComponent(roomCode)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Race not found");
      }

      const nextRoom: Room = data.room;
      const changes: ScoreChanges = {};
      const events: ActivityEvent[] = [];
      const now = Date.now();

      const ordered = [...nextRoom.players].sort(
        (a, b) => b.score - a.score || a.playerName.localeCompare(b.playerName)
      );

      const nextRanks: RankMap = {};
      ordered.forEach((p, i) => {
        nextRanks[p.playerName] = i;
      });

      const rankDelta: Record<string, number> = {};

      for (const player of nextRoom.players) {
        const oldScore = previousScores.current[player.playerName];

        if (oldScore !== undefined && oldScore !== player.score) {
          const delta = player.score - oldScore;
          changes[player.playerName] = delta;
          events.push({
            id: `${player.playerName}-${now}-${player.score}`,
            player: player.playerName,
            amount: delta,
            at: now,
          });
        }

        const oldRank = previousRanks.current[player.playerName];
        const newRank = nextRanks[player.playerName];

        if (oldRank !== undefined && newRank !== undefined && oldRank !== newRank) {
          // positive = moved up
          rankDelta[player.playerName] = oldRank - newRank;
        }

        previousScores.current[player.playerName] = player.score;
      }

      previousRanks.current = nextRanks;

      if (events.length) {
        setActivity((current) => [...events, ...current].slice(0, 14));
      }

      setScoreChanges(changes);
      setRankChanges(rankDelta);
      setRoom(nextRoom);

      setHistory((current) => {
        const scores: Record<string, number> = {};
        for (const player of nextRoom.players) {
          scores[player.playerName] = player.score;
        }

        const next = [...current, { at: now, scores }];

        // Keep about 30 minutes if refreshing every 2 seconds.
        return next.slice(-900);
      });

      setLastServerUpdate(now);
      setClockNow(now);
      setConnected(true);
      setError("");
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : "Unable to load race");
    } finally {
      setLoading(false);
    }
  }

  // IMPORTANT: same 2-second API refresh as the existing site.
  useEffect(() => {
    loadRace();
    const interval = setInterval(loadRace, 2000);
    return () => clearInterval(interval);
  }, [roomCode]);

  // Local clock only affects display; Render remains authoritative.
  useEffect(() => {
    const timer = setInterval(() => setClockNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!Object.keys(scoreChanges).length && !Object.keys(rankChanges).length) return;

    const timer = setTimeout(() => {
      setScoreChanges({});
      setRankChanges({});
    }, 4500);

    return () => clearTimeout(timer);
  }, [scoreChanges, rankChanges]);

  function liveRemaining(player: Player) {
    // Paused/offline racers must NOT count down locally.
    if (!player.loggedIn || player.raceState !== "RUNNING") {
      return Math.max(0, player.remainingMilliseconds);
    }

    const elapsed = clockNow - lastServerUpdate;
    return Math.max(0, player.remainingMilliseconds - elapsed);
  }

  async function copyRoom() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Browser may block clipboard in some contexts.
    }
  }

  const sortedPlayers = useMemo(
    () =>
      room
        ? [...room.players].sort(
            (a, b) => b.score - a.score || a.playerName.localeCompare(b.playerName)
          )
        : [],
    [room]
  );

  const leader = sortedPlayers[0];
  const raceRemaining = leader ? liveRemaining(leader) : 0;
  const totalScore = sortedPlayers.reduce((sum, player) => sum + player.score, 0);
  const onlineCount = sortedPlayers.filter((player) => player.loggedIn).length;
  const positiveEvents = activity.filter((event) => event.amount > 0);
  const biggestGain = positiveEvents.length
    ? positiveEvents.reduce((best, event) =>
        event.amount > best.amount ? event : best
      )
    : null;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-yellow-500" />
          <p className="mt-5 font-black tracking-wide text-yellow-500">
            LOADING LIVE RACE...
          </p>
        </div>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-white">
        <FantasyBackdrop />
        <div className="relative z-10 mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-black/80 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-400">
            Race unavailable
          </p>
          <h1 className="mt-4 text-4xl font-black">{roomCode}</h1>
          <p className="mt-5 text-zinc-400">{error}</p>
          <Link
            href="/live"
            className="mt-8 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:bg-yellow-400"
          >
            BACK TO LIVE RACES
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <FantasyBackdrop />

      <nav className="sticky top-0 z-50 border-b border-yellow-500/15 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-xl shadow-[0_0_30px_rgba(234,179,8,.10)]">
              🪙
            </div>
            <div>
              <div className="text-xl font-black leading-none tracking-tight">
                0GP <span className="text-yellow-500">RACE</span>
              </div>
              <div className="mt-1 hidden text-[9px] font-bold uppercase tracking-[.28em] text-zinc-600 sm:block">
                Competitive RuneLite Racing
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/live"
              className="hidden text-xs font-black uppercase tracking-wider text-zinc-400 transition hover:text-yellow-400 sm:block"
            >
              Live Races
            </Link>
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider ${
                connected
                  ? "border-lime-400/20 bg-lime-400/5 text-lime-400"
                  : "border-red-400/20 bg-red-400/5 text-red-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "animate-pulse bg-lime-400" : "bg-red-400"
                }`}
              />
              {connected ? "Live" : "Reconnecting"}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto w-[min(1120px,calc(100vw-500px))] px-3 py-6 lg:py-8 max-[1180px]:w-[calc(100vw-250px)] max-[820px]:w-[calc(100vw-28px)]">
        <section className="overflow-hidden rounded-3xl border border-yellow-500/25 bg-[#090909]/90 shadow-[0_25px_80px_rgba(0,0,0,.65)] backdrop-blur-xl">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />

            <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr_.7fr] xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-[.3em] text-yellow-500">
                    Live Race
                  </p>
                  <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-red-400">
                    ● In progress
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                  {room.raceName}
                </h1>

                <button
                  onClick={copyRoom}
                  className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-left transition hover:border-yellow-500/30 hover:bg-yellow-500/[.04]"
                >
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[.25em] text-zinc-600">
                      Room code
                    </div>
                    <div className="mt-1 font-mono text-xl font-black tracking-wider text-yellow-300">
                      {room.roomCode}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {copied ? "COPIED ✓" : "COPY"}
                  </span>
                </button>
              </div>

              <HeroMetric
                label="Time Remaining"
                value={formatTime(raceRemaining)}
                danger={raceRemaining <= 60_000}
              />

              <div className="grid grid-cols-2 gap-3">
                <MiniMetric label="Racers" value={String(sortedPlayers.length)} />
                <MiniMetric label="Online" value={String(onlineCount)} green />
                <MiniMetric
                  label="Allowance"
                  value={shortGP(room.startingAllowance)}
                />
                <MiniMetric label="Total Score" value={shortGP(totalScore)} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <div className="space-y-6">
            <Podium players={sortedPlayers.slice(0, 3)} changes={scoreChanges} />

            <Panel title="Live Leaderboard" eyebrow="Race standings">
              <div className="overflow-hidden rounded-2xl border border-white/[.07]">
                <div className="hidden grid-cols-[70px_1.4fr_1fr_130px_110px] gap-4 border-b border-white/[.07] bg-white/[.025] px-5 py-3 text-[9px] font-black uppercase tracking-[.22em] text-zinc-600 md:grid">
                  <span>Rank</span>
                  <span>Player</span>
                  <span>Race Score</span>
                  <span>Time</span>
                  <span>Status</span>
                </div>

                {sortedPlayers.map((player, index) => {
                  const change = scoreChanges[player.playerName] || 0;
                  const rankMove = rankChanges[player.playerName] || 0;

                  return (
                    <div
                      key={player.playerName}
                      className={`relative grid gap-3 border-b border-white/[.055] px-4 py-4 transition last:border-b-0 md:grid-cols-[70px_1.4fr_1fr_130px_110px] md:items-center md:gap-4 md:px-5 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/[.075] to-transparent"
                          : "bg-black/10 hover:bg-white/[.025]"
                      }`}
                    >
                      <div className="flex items-center justify-between md:block">
                        <span className="text-xl font-black">
                          {medal(index)}
                        </span>
                        {rankMove !== 0 && (
                          <span
                            className={`text-[10px] font-black md:ml-2 ${
                              rankMove > 0 ? "text-lime-400" : "text-red-400"
                            }`}
                          >
                            {rankMove > 0 ? `▲ ${rankMove}` : `▼ ${Math.abs(rankMove)}`}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <Avatar name={player.playerName} leader={index === 0} />
                          <div>
                            <div className="font-black text-zinc-100">
                              {player.playerName}
                            </div>
                            <div className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600 md:hidden">
                              {stateLabel(player)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-mono text-xl font-black text-yellow-300">
                          {shortGP(player.score)}{" "}
                          <span className="text-xs text-yellow-500/70">GP</span>
                        </div>
                        {change !== 0 && (
                          <div
                            className={`mt-1 font-mono text-xs font-black ${
                              change > 0 ? "text-lime-400" : "text-red-400"
                            }`}
                          >
                            {change > 0 ? "+" : ""}
                            {formatGP(change)}
                          </div>
                        )}
                      </div>

                      <div className="font-mono text-sm font-bold text-zinc-400">
                        {formatTime(liveRemaining(player))}
                      </div>

                      <div className="hidden items-center gap-2 md:flex">
                        <span
                          className={`h-2 w-2 rounded-full ${stateColour(player)}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          {stateLabel(player)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {!sortedPlayers.length && (
                  <div className="p-12 text-center text-zinc-600">
                    Waiting for racers to join...
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Race Momentum" eyebrow="Live since you opened this page">
              <MomentumGraph history={history} players={sortedPlayers.slice(0, 6)} />
              <div className="mt-3 text-[10px] leading-relaxed text-zinc-600">
                This chart is built in your browser from the same live score updates
                already used by the dashboard. It does not change plugin or server
                communication.
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Live Activity" eyebrow="Observed score changes">
              <div className="space-y-1">
                {activity.length ? (
                  activity.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/[.055] bg-black/25 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-zinc-200">
                          {event.player}
                        </div>
                        <div
                          className={`mt-1 font-mono text-xs font-black ${
                            event.amount > 0 ? "text-lime-400" : "text-red-400"
                          }`}
                        >
                          {event.amount > 0 ? "+" : ""}
                          {formatGP(event.amount)}
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-700">
                        {timeAgo(event.at, clockNow)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-600">
                    Waiting for the next score change...
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Race Statistics" eyebrow="Live overview">
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  label="Leader"
                  value={leader ? leader.playerName : "—"}
                  accent
                />
                <StatTile
                  label="Leading Score"
                  value={leader ? `${shortGP(leader.score)} GP` : "0 GP"}
                />
                <StatTile label="Players Online" value={`${onlineCount}/${sortedPlayers.length}`} />
                <StatTile label="Combined Score" value={`${shortGP(totalScore)} GP`} />
                <StatTile
                  label="Biggest Live Gain"
                  value={biggestGain ? `+${shortGP(biggestGain.amount)} GP` : "—"}
                  green
                />
                <StatTile
                  label="Server Sync"
                  value={`${Math.max(
                    0,
                    Math.floor((clockNow - lastServerUpdate) / 1000)
                  )}s ago`}
                />
              </div>
            </Panel>

            <Panel title="How This Stays Live" eyebrow="No slowdown">
              <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
                <Feature
                  icon="⚡"
                  title="Same API"
                  text="The page still reads your existing Render room endpoint."
                />
                <Feature
                  icon="🔄"
                  title="Same refresh rate"
                  text="Authoritative race data refreshes every 2 seconds, exactly like the current live page."
                />
                <Feature
                  icon="⏱"
                  title="Smooth local timer"
                  text="The countdown updates every 250ms in the browser without extra server requests."
                />
                <Feature
                  icon="🛡"
                  title="Plugin untouched"
                  text="No RuneLite, multiplayer or accounting protocol changes are required for this redesign."
                />
              </div>
            </Panel>
          </div>
        </section>

        <footer className="mt-8 flex flex-col justify-between gap-4 border-t border-white/[.07] py-8 text-[10px] uppercase tracking-widest text-zinc-700 sm:flex-row">
          <span>0GP Race • Live RuneLite race dashboard</span>
          <span>Not affiliated with Jagex Ltd.</span>
        </footer>
      </div>
    </main>
  );
}

function FantasyBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]">
      <div className="absolute left-0 top-[70px] bottom-0 w-[270px] bg-[url('/concept-left.webp')] bg-[length:270px_1180px] bg-left-top bg-no-repeat opacity-100 max-[1180px]:w-[170px] max-[820px]:opacity-15" />
      <div className="absolute right-0 top-[70px] bottom-0 w-[270px] bg-[url('/concept-right.webp')] bg-[length:270px_1180px] bg-right-top bg-no-repeat opacity-100 max-[1180px]:w-[170px] max-[820px]:opacity-15" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0_185px,rgba(5,5,5,.18)_245px,rgba(5,5,5,.94)_325px,rgba(5,5,5,.94)_calc(100%-325px),rgba(5,5,5,.18)_calc(100%-245px),transparent_calc(100%-185px))] max-[820px]:bg-black/70" />
      <div className="absolute left-1/2 top-[-240px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-yellow-500/[.06] blur-[150px]" />
    </div>
  );
}

function HeroMetric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[.08] bg-black/40 p-5 text-center">
      <div className="text-[9px] font-black uppercase tracking-[.25em] text-zinc-600">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-3xl font-black sm:text-4xl ${
          danger ? "text-red-400" : "text-yellow-300"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
      <div className="text-[8px] font-black uppercase tracking-[.22em] text-zinc-700">
        {label}
      </div>
      <div className={`mt-1 text-xl font-black ${green ? "text-lime-400" : "text-zinc-200"}`}>
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/[.08] bg-[#090909]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[.28em] text-yellow-500/75">
            {eyebrow}
          </div>
          <h2 className="mt-1 text-xl font-black">{title}</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/20 to-transparent" />
      </div>
      {children}
    </section>
  );
}

function Avatar({ name, leader }: { name: string; leader: boolean }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border font-black ${
        leader
          ? "border-yellow-400/50 bg-yellow-500/10 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,.12)]"
          : "border-white/10 bg-white/[.035] text-zinc-400"
      }`}
    >
      {letter}
      {leader && (
        <span className="absolute -right-1 -top-2 text-xs" aria-hidden>
          👑
        </span>
      )}
    </div>
  );
}

function Podium({
  players,
  changes,
}: {
  players: Player[];
  changes: ScoreChanges;
}) {
  if (!players.length) return null;

  const order = players.length >= 3 ? [players[1], players[0], players[2]] : players;

  return (
    <Panel title="Podium" eyebrow="Top racers">
      <div className="grid gap-3 md:grid-cols-3">
        {order.map((player) => {
          const actualRank = players.findIndex(
            (candidate) => candidate.playerName === player.playerName
          );
          const change = changes[player.playerName] || 0;
          const champion = actualRank === 0;

          return (
            <div
              key={player.playerName}
              className={`relative overflow-hidden rounded-2xl border p-5 ${
                champion
                  ? "border-yellow-400/40 bg-gradient-to-b from-yellow-500/[.13] to-yellow-500/[.025] md:-translate-y-2"
                  : "border-white/[.08] bg-black/30"
              }`}
            >
              {champion && (
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-200 to-transparent" />
              )}
              <div className="flex items-center justify-between">
                <span className="text-3xl">{medal(actualRank)}</span>
                <span className="text-[9px] font-black uppercase tracking-[.2em] text-zinc-700">
                  Rank {actualRank + 1}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Avatar name={player.playerName} leader={champion} />
                <div className="min-w-0">
                  <div className="truncate text-lg font-black">
                    {player.playerName}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
                    <span className={`h-2 w-2 rounded-full ${stateColour(player)}`} />
                    {stateLabel(player)}
                  </div>
                </div>
              </div>

              <div className="mt-6 font-mono text-3xl font-black text-yellow-300">
                {shortGP(player.score)}{" "}
                <span className="text-xs text-yellow-500/60">GP</span>
              </div>

              {change !== 0 && (
                <div
                  className={`mt-2 font-mono text-xs font-black ${
                    change > 0 ? "text-lime-400" : "text-red-400"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {formatGP(change)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function StatTile({
  label,
  value,
  accent = false,
  green = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[.07] bg-black/25 p-4">
      <div className="text-[8px] font-black uppercase tracking-[.22em] text-zinc-700">
        {label}
      </div>
      <div
        className={`mt-2 truncate text-lg font-black ${
          green ? "text-lime-400" : accent ? "text-yellow-300" : "text-zinc-200"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-yellow-500/15 bg-yellow-500/[.05] text-sm">
        {icon}
      </div>
      <div>
        <div className="font-black text-zinc-200">{title}</div>
        <div className="mt-1 text-xs leading-relaxed text-zinc-600">{text}</div>
      </div>
    </div>
  );
}

function MomentumGraph({
  history,
  players,
}: {
  history: HistoryPoint[];
  players: Player[];
}) {
  const width = 900;
  const height = 260;
  const padX = 34;
  const padY = 24;

  if (history.length < 2 || !players.length) {
    return (
      <div className="grid h-[260px] place-items-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-sm text-zinc-600">
        Building live score history...
      </div>
    );
  }

  const minAt = history[0].at;
  const maxAt = history[history.length - 1].at;
  const allScores = history.flatMap((point) =>
    players.map((player) => point.scores[player.playerName] ?? player.score)
  );
  const maxScore = Math.max(1, ...allScores);
  const minScore = Math.min(0, ...allScores);

  const colours = [
    "#facc15",
    "#e4e4e7",
    "#fb923c",
    "#84cc16",
    "#60a5fa",
    "#c084fc",
  ];

  function x(at: number) {
    if (maxAt === minAt) return padX;
    return padX + ((at - minAt) / (maxAt - minAt)) * (width - padX * 2);
  }

  function y(score: number) {
    const range = Math.max(1, maxScore - minScore);
    return height - padY - ((score - minScore) / range) * (height - padY * 2);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[.07] bg-black/30 p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[260px] w-full"
        role="img"
        aria-label="Live race score momentum graph"
      >
        {[0, 1, 2, 3, 4].map((row) => {
          const yy = padY + (row * (height - padY * 2)) / 4;
          return (
            <line
              key={row}
              x1={padX}
              x2={width - padX}
              y1={yy}
              y2={yy}
              stroke="rgba(255,255,255,.07)"
              strokeWidth="1"
            />
          );
        })}

        {players.map((player, playerIndex) => {
          const points = history
            .map((point) => {
              const score = point.scores[player.playerName];
              if (score === undefined) return null;
              return `${x(point.at)},${y(score)}`;
            })
            .filter(Boolean)
            .join(" ");

          return (
            <polyline
              key={player.playerName}
              points={points}
              fill="none"
              stroke={colours[playerIndex % colours.length]}
              strokeWidth={playerIndex === 0 ? 3 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={playerIndex === 0 ? 1 : 0.8}
            />
          );
        })}
      </svg>

      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2 px-2 pb-2">
        {players.map((player, index) => (
          <div key={player.playerName} className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span
              className="h-0.5 w-4"
              style={{
                backgroundColor: [
                  "#facc15",
                  "#e4e4e7",
                  "#fb923c",
                  "#84cc16",
                  "#60a5fa",
                  "#c084fc",
                ][index % 6],
              }}
            />
            {player.playerName}
          </div>
        ))}
      </div>
    </div>
  );
}
