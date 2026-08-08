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
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black">
            0GP <span className="text-yellow-500">RACE</span>
          </Link>

          <div
            className={`flex items-center gap-2 text-xs font-black ${
              connected ? "text-green-400" : "text-red-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "animate-pulse bg-green-400" : "bg-red-400"
              }`}
            />
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
            Browse races that are live now, see recently finished results, or
            jump straight to a room code.
          </p>
        </div>

        <div className="mt-10 inline-flex flex-wrap rounded-2xl border border-white/10 bg-zinc-950 p-1">
          <TabButton
            active={tab === "active"}
            onClick={() => setTab("active")}
            label="ACTIVE RACES"
            count={activeRooms.length}
          />

          <TabButton
            active={tab === "finished"}
            onClick={() => setTab("finished")}
            label="FINISHED RACES"
            count={finishedRooms.length}
          />

          <TabButton
            active={tab === "search"}
            onClick={() => setTab("search")}
            label="FIND A RACE"
          />
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/[0.05] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {tab === "search" && (
          <section className="mt-8 max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 p-7 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Room Search
            </p>

            <h2 className="mt-3 text-2xl font-black">
              Enter a room code
            </h2>

            <form
              onSubmit={submitSearch}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
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
        )}

        {tab === "active" && (
          <section className="mt-8">
            {loading ? (
              <LoadingCard text="Loading active races..." />
            ) : sortedActive.length === 0 ? (
              <EmptyCard
                title="No active races right now."
                text="Start an online race in RuneLite and it will appear here automatically."
              />
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {sortedActive.map((room) => {
                  const players = [...room.players].sort(
                    (a, b) => b.score - a.score
                  );
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
                            <span
                              className={`h-2 w-2 rounded-full ${
                                status === "RUNNING"
                                  ? "animate-pulse bg-green-400"
                                  : "bg-yellow-400"
                              }`}
                            />
                            <span
                              className={`text-xs font-black uppercase tracking-[0.2em] ${
                                status === "RUNNING"
                                  ? "text-green-400"
                                  : "text-yellow-400"
                              }`}
                            >
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

        {tab === "finished" && (
          <section className="mt-8">
            {loading ? (
              <LoadingCard text="Loading finished races..." />
            ) : sortedFinished.length === 0 ? (
              <EmptyCard
                title="No finished races yet."
                text="Completed races will stay here for roughly 24 hours with the current server setup."
              />
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {sortedFinished.map((room) => {
                  const standings = [...room.players].sort(
                    (a, b) => b.score - a.score
                  );

                  const winner =
                    room.winner ||
                    standings.find(
                      (player) =>
                        String(player.raceState || "").toUpperCase() === "FINISHED"
                    ) ||
                    standings[0];

                  return (
                    <Link
                      key={room.roomCode}
                      href={`/race/${room.roomCode}`}
                      className="group rounded-3xl border border-white/10 bg-zinc-950 p-7 transition hover:-translate-y-1 hover:border-yellow-500/50"
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                            FINISHED
                          </p>

                          <h2 className="mt-4 truncate text-2xl font-black">
                            {room.raceName || "0GP Race"}
                          </h2>

                          <p className="mt-1 font-mono text-sm text-yellow-500">
                            {room.roomCode}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-xl border border-white/10 bg-black px-4 py-3 text-right">
                          <p className="text-xs uppercase text-zinc-600">
                            Finished
                          </p>
                          <p className="mt-1 font-black text-zinc-300">
                            {timeAgo(room.finishedAt || room.lastActivity)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-7 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">
                          Winner
                        </p>
                        <div className="mt-2 flex items-end justify-between gap-4">
                          <p className="truncate text-xl font-black">
                            🏆 {winner?.playerName || "—"}
                          </p>
                          <p className="shrink-0 font-black text-yellow-500">
                            {winner ? shortGP(winner.score) : "0 GP"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                        <RaceStat label="Players" value={standings.length.toString()} />
                        <RaceStat
                          label="Duration"
                          value={formatTime(room.durationMilliseconds)}
                        />
                        <RaceStat
                          label="Top Score"
                          value={winner ? shortGP(winner.score) : "0 GP"}
                        />
                      </div>

                      <div className="mt-7 text-sm font-black text-yellow-500">
                        VIEW RESULTS →
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
