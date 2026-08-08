"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Player = {
  playerName: string;
  score: number;
  remainingMilliseconds: number;
  loggedIn: boolean;
  raceState: string;
  lastSeen?: number;
};

type Room = {
  roomCode: string;
  raceName: string;
  durationMilliseconds: number;
  startingAllowance: number;
  createdAt?: number;
  lastActivity?: number;
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

export default function LiveRacesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"active" | "search">("active");
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [clockNow, setClockNow] = useState(Date.now());

  async function loadRooms() {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Unable to load active races");
      }

      setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      setConnected(true);
      setError("");

      const now = Date.now();
      setLastUpdate(now);
      setClockNow(now);
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : "Unable to load active races");
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

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aRunning = roomStatus(a) === "RUNNING" ? 1 : 0;
      const bRunning = roomStatus(b) === "RUNNING" ? 1 : 0;
      if (aRunning !== bRunning) return bRunning - aRunning;
      return (b.lastActivity || 0) - (a.lastActivity || 0);
    });
  }, [rooms]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const normalised = roomCode.trim().toUpperCase();
    if (!normalised) return;
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
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black">
            0GP <span className="text-yellow-500">RACE</span>
          </Link>

          <div className={`flex items-center gap-2 text-xs font-black ${
            connected ? "text-green-400" : "text-red-400"
          }`}>
            <span className={`h-2 w-2 rounded-full ${
              connected ? "animate-pulse bg-green-400" : "bg-red-400"
            }`} />
            {connected ? "LIVE CONNECTION" : "RECONNECTING"}
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500">
            Spectator Mode
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            WATCH 0GP RACES
          </h1>

          <p className="mt-5 text-lg leading-8 text-zinc-400">
            Find a race by room code or browse every race currently active on the hosted server.
          </p>
        </div>

        <div className="mt-10 inline-flex rounded-2xl border border-white/10 bg-zinc-950 p-1">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${
              tab === "active"
                ? "bg-yellow-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ACTIVE RACES
            {rooms.length > 0 && (
              <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
                {rooms.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab("search")}
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${
              tab === "search"
                ? "bg-yellow-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            FIND A RACE
          </button>
        </div>

        {tab === "search" ? (
          <section className="mt-8 max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 p-7 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Room Search
            </p>

            <h2 className="mt-3 text-2xl font-black">Enter a room code</h2>

            <form onSubmit={submitSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                placeholder="0GP-5767"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-5 py-4 font-mono text-lg font-bold uppercase text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
              />

              <button
                type="submit"
                className="rounded-xl bg-yellow-500 px-7 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                WATCH RACE
              </button>
            </form>

            <p className="mt-4 text-sm text-zinc-600">
              Room codes are not case-sensitive.
            </p>
          </section>
        ) : (
          <section className="mt-8">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-12 text-center">
                <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-yellow-500" />
                <p className="mt-5 font-black text-yellow-500">
                  Loading active races...
                </p>
              </div>
            ) : error && rooms.length === 0 ? (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/[0.05] p-8">
                <p className="font-black text-red-400">
                  Unable to load active races
                </p>
                <p className="mt-2 text-zinc-500">{error}</p>
              </div>
            ) : sortedRooms.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-zinc-950 p-12 text-center">
                <p className="text-xl font-black">No active races right now.</p>
                <p className="mt-3 text-zinc-500">
                  Start an online race in RuneLite and it will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {sortedRooms.map((room) => {
                  const players = [...room.players].sort((a, b) => b.score - a.score);
                  const leader = players[0];
                  const status = roomStatus(room);
                  const remaining = liveRemaining(leader);

                  return (
                    <Link
                      key={room.roomCode}
                      href={`/race/${room.roomCode}`}
                      className="group rounded-3xl border border-white/10 bg-zinc-950 p-7 transition hover:-translate-y-1 hover:border-yellow-500/50"
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full ${
                              status === "RUNNING"
                                ? "animate-pulse bg-green-400"
                                : "bg-yellow-400"
                            }`} />

                            <span className={`text-xs font-black uppercase tracking-[0.2em] ${
                              status === "RUNNING"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}>
                              {status}
                            </span>
                          </div>

                          <h2 className="mt-4 truncate text-2xl font-black">
                            {room.raceName || "0GP Race"}
                          </h2>

                          <p className="mt-1 font-mono text-sm text-yellow-500">
                            {room.roomCode}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-xl border border-white/10 bg-black px-4 py-3 text-right">
                          <p className="text-xs uppercase text-zinc-600">
                            Leader Time
                          </p>
                          <p className="mt-1 font-mono font-black">
                            {formatTime(remaining)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                        <RaceStat label="Players" value={players.length.toString()} />
                        <RaceStat label="Leader" value={leader?.playerName || "—"} />
                        <RaceStat label="Top Score" value={leader ? shortGP(leader.score) : "0 GP"} />
                      </div>

                      <div className="mt-7 text-sm font-black text-yellow-500">
                        WATCH RACE →
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
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
