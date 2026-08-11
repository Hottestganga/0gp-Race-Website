"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FantasyShell, SiteNav, SectionTitle } from "../components/FantasyShell";

type Player = {
  playerName: string;
  score: number;
  remainingMilliseconds: number;
  loggedIn: boolean;
  raceState: string;
  lastSeen?: number;
};

type Winner = {
  playerName: string;
  score: number;
};

type Room = {
  roomCode: string;
  raceName: string;
  durationMilliseconds: number;
  startingAllowance: number;
  createdAt?: number;
  lastActivity?: number;
  finishedAt?: number;
  winner?: Winner | null;
  players: Player[];
};

const API_URL =
  process.env.NEXT_PUBLIC_0GP_API_URL ||
  "https://kaha-0gp-challenge.onrender.com";

function shortGP(value: number) {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B GP`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M GP`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K GP`;
  return `${Math.round(value)} GP`;
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function roomStatus(room: Room) {
  const states = room.players.map((player) =>
    String(player.raceState || "").toUpperCase()
  );

  if (states.includes("RUNNING")) return "RUNNING";
  if (states.some((state) => state === "PAUSED" || state === "OVER_BUDGET")) return "PAUSED";
  return "ACTIVE";
}

function timeAgo(timestamp?: number) {
  if (!timestamp) return "Recently";

  const ms = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(ms / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function LiveRacesPage() {
  const router = useRouter();

  const [tab, setTab] =
    useState<"active" | "finished" | "search">("active");

  const [roomCode, setRoomCode] = useState("");
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [finishedRooms, setFinishedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [clockNow, setClockNow] = useState(Date.now());

  async function loadRooms() {
    try {
      const [activeResponse, finishedResponse] = await Promise.all([
        fetch(`${API_URL}/api/rooms`, { cache: "no-store" }),
        fetch(`${API_URL}/api/finished`, { cache: "no-store" }),
      ]);

      const [activeData, finishedData] = await Promise.all([
        activeResponse.json(),
        finishedResponse.json(),
      ]);

      if (!activeResponse.ok || !activeData.ok) {
        throw new Error(activeData.message || "Unable to load active races");
      }

      if (!finishedResponse.ok || !finishedData.ok) {
        throw new Error(finishedData.message || "Unable to load finished races");
      }

      setActiveRooms(Array.isArray(activeData.rooms) ? activeData.rooms : []);
      setFinishedRooms(Array.isArray(finishedData.rooms) ? finishedData.rooms : []);
      setConnected(true);
      setError("");

      const now = Date.now();
      setLastUpdate(now);
      setClockNow(now);
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : "Unable to load races");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
    const refresh = setInterval(loadRooms, 3000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setClockNow(Date.now()), 250);
    return () => clearInterval(clock);
  }, []);

  const sortedActive = useMemo(() => {
    return [...activeRooms].sort((a, b) => {
      const aRunning = roomStatus(a) === "RUNNING" ? 1 : 0;
      const bRunning = roomStatus(b) === "RUNNING" ? 1 : 0;

      if (aRunning !== bRunning) {
        return bRunning - aRunning;
      }

      return (b.lastActivity || 0) - (a.lastActivity || 0);
    });
  }, [activeRooms]);

  const sortedFinished = useMemo(() => {
    return [...finishedRooms].sort(
      (a, b) => (b.finishedAt || b.lastActivity || 0) - (a.finishedAt || a.lastActivity || 0)
    );
  }, [finishedRooms]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();

    const normalised = roomCode.trim().toUpperCase();

    if (!normalised) {
      return;
    }

    router.push(`/race/${encodeURIComponent(normalised)}`);
  }

  function liveRemaining(player: Player | undefined) {
    if (!player) return 0;

    if (!player.loggedIn || player.raceState !== "RUNNING") {
      return Math.max(0, player.remainingMilliseconds);
    }

    return Math.max(
      0,
      player.remainingMilliseconds - (clockNow - lastUpdate)
    );
  }

  return (
    <FantasyShell>
      <SiteNav active="live" />

      <section className="site-center-wide px-4 py-12 sm:px-7 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <SectionTitle
            eyebrow="Spectator Arena"
            title="Live Races"
            text="Browse active rooms, inspect recently finished battles or jump directly to a room code."
          />

          <div className="game-panel rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[.22em] text-zinc-700">Network</div>
                <div className={`mt-2 font-black ${connected ? "text-lime-400" : "text-red-400"}`}>
                  {connected ? "● LIVE CONNECTION" : "● RECONNECTING"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black uppercase tracking-[.22em] text-zinc-700">Active rooms</div>
                <div className="mt-2 text-2xl font-black text-yellow-300">{activeRooms.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap gap-2">
          <TabButton active={tab === "active"} onClick={() => setTab("active")} label="ACTIVE ARENAS" count={activeRooms.length} />
          <TabButton active={tab === "finished"} onClick={() => setTab("finished")} label="FINISHED" count={finishedRooms.length} />
          <TabButton active={tab === "search"} onClick={() => setTab("search")} label="ROOM LOOKUP" />
        </div>

        {error && (
          <div className="mt-7 border border-red-500/30 bg-red-500/[.06] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {tab === "search" && (
          <section className="game-panel mt-8 max-w-2xl rounded-2xl p-7">
            <div className="text-[9px] font-black uppercase tracking-[.25em] text-yellow-400">Find a battle</div>
            <h2 className="mt-3 text-2xl font-black">Enter a room code</h2>
            <form onSubmit={submitSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                placeholder="0GP-5767"
                className="min-w-0 flex-1 border border-yellow-500/20 bg-black/70 px-5 py-4 font-mono text-lg font-bold uppercase text-white outline-none placeholder:text-zinc-800 focus:border-yellow-400"
              />
              <button type="submit" className="bg-yellow-400 px-7 py-4 font-black text-black hover:bg-yellow-300">
                ENTER ARENA
              </button>
            </form>
          </section>
        )}

        {tab === "active" && (
          <section className="mt-8">
            {loading ? (
              <LoadingCard text="Loading active races..." />
            ) : sortedActive.length === 0 ? (
              <EmptyCard title="No active arenas right now." text="Start an online race in RuneLite and it will appear here automatically." />
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {sortedActive.map((room) => {
                  const players = [...room.players].sort((a, b) => b.score - a.score);
                  const leader = players[0];
                  const status = roomStatus(room);
                  const remaining = liveRemaining(leader);

                  return (
                    <Link
                      key={room.roomCode}
                      href={`/race/${room.roomCode}`}
                      className="game-panel group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-yellow-300/45"
                    >
                      <div className="h-1 bg-gradient-to-r from-yellow-800 via-yellow-300 to-yellow-800" />
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0">
                            <div className={`text-[9px] font-black uppercase tracking-[.25em] ${status === "RUNNING" ? "text-lime-400" : "text-yellow-400"}`}>
                              {status === "RUNNING" ? "● LIVE BATTLE" : "● " + status}
                            </div>
                            <h2 className="mt-3 truncate text-2xl font-black">{room.raceName || "0GP Race"}</h2>
                            <p className="mt-2 font-mono text-xs font-black tracking-widest text-yellow-400">{room.roomCode}</p>
                          </div>

                          <div className="border border-yellow-500/15 bg-black/60 px-4 py-3 text-right">
                            <div className="text-[8px] font-black uppercase tracking-[.18em] text-zinc-700">Leader time</div>
                            <div className="mt-1 font-mono font-black text-zinc-200">{formatTime(remaining)}</div>
                          </div>
                        </div>

                        <div className="gold-line mt-6" />
                        <div className="mt-6 grid grid-cols-3 gap-3">
                          <RaceStat label="Racers" value={players.length.toString()} />
                          <RaceStat label="Leader" value={leader?.playerName || "—"} />
                          <RaceStat label="Top score" value={leader ? shortGP(leader.score) : "0 GP"} />
                        </div>

                        <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[.2em]">
                          <span className="text-zinc-700">{timeAgo(room.lastActivity)}</span>
                          <span className="text-yellow-300">WATCH LIVE →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === "finished" && (
          <section className="mt-8">
            {loading ? (
              <LoadingCard text="Loading finished races..." />
            ) : sortedFinished.length === 0 ? (
              <EmptyCard title="No finished races yet." text="Completed races will appear here while the server retains their results." />
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {sortedFinished.map((room) => {
                  const standings = [...room.players].sort((a, b) => b.score - a.score);
                  const winner = room.winner || standings[0];

                  return (
                    <Link key={room.roomCode} href={`/race/${room.roomCode}`} className="game-panel group rounded-2xl p-6 transition hover:-translate-y-1 hover:border-yellow-300/45">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">🏆</div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-black uppercase tracking-[.22em] text-zinc-600">Completed battle</div>
                          <h2 className="mt-2 truncate text-xl font-black">{room.raceName || "0GP Race"}</h2>
                          <div className="mt-1 font-mono text-xs text-yellow-400">{room.roomCode}</div>
                        </div>
                      </div>
                      <div className="gold-line mt-5" />
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <RaceStat label="Winner" value={winner?.playerName || "—"} />
                        <RaceStat label="Score" value={winner ? shortGP(winner.score) : "0 GP"} />
                        <RaceStat label="Racers" value={standings.length.toString()} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </section>
    </FantasyShell>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-sm font-black transition ${
        active
          ? "bg-yellow-500 text-black"
          : "text-zinc-400 hover:text-white"
      }`}
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
          {count}
        </span>
      )}
    </button>
  );
}

function RaceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase text-zinc-600">{label}</p>
      <p className="mt-1 truncate font-black">{value}</p>
    </div>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-12 text-center">
      <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-yellow-500" />
      <p className="mt-5 font-black text-yellow-500">{text}</p>
    </div>
  );
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-zinc-950 p-12 text-center">
      <p className="text-xl font-black">{title}</p>
      <p className="mt-3 text-zinc-500">{text}</p>
    </div>
  );
}
