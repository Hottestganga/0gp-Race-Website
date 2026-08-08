"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

const API_URL =
    process.env.NEXT_PUBLIC_0GP_API_URL ||
    "https://kaha-0gp-challenge.onrender.com";

function formatGP(value: number) {
  return new Intl.NumberFormat("en-AU").format(Math.round(value)) + " GP";
}

function shortGP(value: number) {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return Math.round(value).toString();
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(
      0,
      Math.floor(milliseconds / 1000)
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
      .map((value) => value.toString().padStart(2, "0"))
      .join(":");
}

export default function RacePage() {
  const params = useParams();

  const roomCode = String(params.roomCode || "").toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [connected, setConnected] = useState(false);

  const [lastServerUpdate, setLastServerUpdate] =
      useState(Date.now());

  const [clockNow, setClockNow] =
      useState(Date.now());

  const [scoreChanges, setScoreChanges] =
      useState<ScoreChanges>({});

  const previousScores = useRef<Record<string, number>>({});

  async function loadRace() {
    try {
      const response = await fetch(
          `${API_URL}/api/room?roomCode=${encodeURIComponent(
              roomCode
          )}`,
          {
            cache: "no-store",
          }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
            data.message || "Race not found"
        );
      }

      const nextRoom: Room = data.room;

      const changes: ScoreChanges = {};

      for (const player of nextRoom.players) {
        const oldScore =
            previousScores.current[player.playerName];

        if (
            oldScore !== undefined &&
            oldScore !== player.score
        ) {
          changes[player.playerName] =
              player.score - oldScore;
        }

        previousScores.current[player.playerName] =
            player.score;
      }

      setScoreChanges(changes);
      setRoom(nextRoom);

      const now = Date.now();

      setLastServerUpdate(now);
      setClockNow(now);

      setConnected(true);
      setError("");
    } catch (err) {
      setConnected(false);

      setError(
          err instanceof Error
              ? err.message
              : "Unable to load race"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * SERVER REFRESH
   *
   * Authoritative race information comes from Render
   * every two seconds.
   */
  useEffect(() => {
    loadRace();

    const interval = setInterval(
        loadRace,
        2000
    );

    return () => clearInterval(interval);
  }, [roomCode]);

  /*
   * LOCAL CLOCK
   *
   * This makes the timer visually count down every
   * second rather than waiting for another API request.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setClockNow(Date.now());
    }, 250);

    return () => clearInterval(timer);
  }, []);

  /*
   * Remove GP change indicators after a few seconds.
   */
  useEffect(() => {
    if (
        Object.keys(scoreChanges).length === 0
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setScoreChanges({});
    }, 4500);

    return () => clearTimeout(timer);
  }, [scoreChanges]);

  function liveRemaining(player: Player) {
    // Freeze the timer whenever the player isn't actively racing.
    if (
        !player.loggedIn ||
        player.raceState !== "RUNNING"
    ) {
      return Math.max(
          0,
          player.remainingMilliseconds
      );
    }

    // Only count down locally while the player is running.
    const elapsed =
        clockNow - lastServerUpdate;

    return Math.max(
        0,
        player.remainingMilliseconds - elapsed
    );
  }
  if (loading) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-yellow-500" />

            <p className="mt-5 font-black text-yellow-500">
              Loading live race...
            </p>
          </div>
        </main>
    );
  }

  if (error || !room) {
    return (
        <main className="min-h-screen bg-black px-6 py-20 text-white">
          <div className="mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-red-500/[0.05] p-8">

            <p className="text-sm font-black uppercase tracking-[0.25em] text-red-400">
              Race unavailable
            </p>

            <h1 className="mt-4 text-4xl font-black">
              {roomCode}
            </h1>

            <p className="mt-5 text-zinc-400">
              {error}
            </p>

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

  const sortedPlayers = [...room.players].sort(
      (a, b) => b.score - a.score
  );

  const leader = sortedPlayers[0];

  const raceRemaining = leader
      ? liveRemaining(leader)
      : 0;

  return (
      <main className="min-h-screen overflow-hidden bg-black text-white">

        {/* BACKGROUND */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-1/2 top-[-350px] h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-yellow-500/[0.07] blur-[180px]" />
        </div>

        {/* NAV */}
        <nav className="relative z-20 border-b border-white/10 bg-black/80 backdrop-blur-xl">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

            <Link
                href="/"
                className="text-xl font-black"
            >
              0GP{" "}
              <span className="text-yellow-500">
              RACE
            </span>
            </Link>

            <div
                className={`flex items-center gap-2 text-xs font-black ${
                    connected
                        ? "text-green-400"
                        : "text-red-400"
                }`}
            >

            <span
                className={`h-2 w-2 rounded-full ${
                    connected
                        ? "animate-pulse bg-green-400"
                        : "bg-red-400"
                }`}
            />

              {connected
                  ? "LIVE CONNECTION"
                  : "RECONNECTING"}

            </div>

          </div>

        </nav>

        {/* RACE HEADER */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14">

          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-12 lg:flex-row lg:items-end">

            <div>

              <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                Live Race
              </p>

              <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
                {room.raceName}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4">

              <span className="font-mono text-yellow-400">
                {room.roomCode}
              </span>

                <span className="text-zinc-700">
                •
              </span>

                <span className="text-sm text-zinc-500">
                {room.players.length} racer
                  {room.players.length === 1
                      ? ""
                      : "s"}
              </span>

              </div>

            </div>

            {/* BIG TIMER */}
            <div className="rounded-3xl border border-yellow-500/25 bg-zinc-950 px-8 py-6 text-center shadow-2xl shadow-yellow-950/20">

              <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-600">
                Time Remaining
              </p>

              <p
                  className={`mt-2 font-mono text-5xl font-black tracking-tight ${
                      raceRemaining <= 60000
                          ? "text-red-400"
                          : "text-yellow-400"
                  }`}
              >
                {formatTime(raceRemaining)}
              </p>

            </div>

          </div>

          {/* TOP STATS */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
                label="Current Leader"
                value={
                  leader
                      ? leader.playerName
                      : "—"
                }
            />

            <StatCard
                label="Leading Score"
                value={
                  leader
                      ? shortGP(leader.score) + " GP"
                      : "0 GP"
                }
            />

            <StatCard
                label="Starting Allowance"
                value={formatGP(
                    room.startingAllowance
                )}
            />

            <StatCard
                label="Players"
                value={String(
                    room.players.length
                )}
            />

          </div>

        </section>

        {/* LEADERBOARD */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">

          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-500">
                Live Standings
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Leaderboard
              </h2>

            </div>

            <p className="text-xs text-zinc-600">
              Scores sync every 2 seconds ·
              timer runs locally
            </p>

          </div>

          <div className="space-y-3">

            {sortedPlayers.map(
                (player, index) => {
                  const change =
                      scoreChanges[
                          player.playerName
                          ] || 0;

                  const remaining =
                      liveRemaining(player);

                  return (
                      <div
                          key={player.playerName}
                          className={`relative overflow-hidden rounded-2xl border p-5 transition duration-300 sm:grid sm:grid-cols-[70px_1fr_180px_170px] sm:items-center sm:gap-5 ${
                              index === 0
                                  ? "border-yellow-500/40 bg-yellow-500/[0.045]"
                                  : "border-white/10 bg-zinc-950"
                          }`}
                      >

                        {/* RANK */}
                        <div
                            className={`text-3xl font-black ${
                                index === 0
                                    ? "text-yellow-500"
                                    : "text-zinc-700"
                            }`}
                        >
                          #{index + 1}
                        </div>

                        {/* PLAYER */}
                        <div className="mt-4 sm:mt-0">

                          <div className="flex items-center gap-3">

                            <p className="text-xl font-black">
                              {player.playerName}
                            </p>

                            {index === 0 && (
                                <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                          Leader
                        </span>
                            )}

                          </div>

                          <div className="mt-2 flex items-center gap-2">

                      <span
                          className={`h-2 w-2 rounded-full ${
                              player.loggedIn
                                  ? "bg-green-400"
                                  : "bg-zinc-600"
                          }`}
                      />

                            <span className="text-xs font-bold uppercase text-zinc-500">
                        {player.raceState}
                      </span>

                          </div>

                        </div>

                        {/* TIMER */}
                        <div className="mt-5 sm:mt-0">

                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                            Time
                          </p>

                          <p className="mt-1 font-mono text-lg font-bold text-zinc-300">
                            {formatTime(
                                remaining
                            )}
                          </p>

                        </div>

                        {/* SCORE */}
                        <div className="mt-5 sm:mt-0 sm:text-right">

                          <p className="font-mono text-2xl font-black text-yellow-400">
                            {shortGP(
                                player.score
                            )}{" "}
                            GP
                          </p>

                          {change !== 0 && (
                              <p
                                  className={`mt-1 font-mono text-sm font-black ${
                                      change > 0
                                          ? "text-green-400"
                                          : "text-red-400"
                                  }`}
                              >
                                {change > 0
                                    ? "+"
                                    : ""}
                                {shortGP(
                                    change
                                )}{" "}
                                GP
                              </p>
                          )}

                        </div>

                      </div>
                  );
                }
            )}

          </div>

          {room.players.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-center text-zinc-500">
                Waiting for racers to join...
              </div>
          )}

          {/* STATUS */}
          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-600 sm:flex-row">

          <span>
            Watching {room.roomCode}
          </span>

            <span>
            Last server sync{" "}
              {Math.max(
                  0,
                  Math.floor(
                      (clockNow -
                          lastServerUpdate) /
                      1000
                  )
              )}
              s ago
          </span>

          </div>

        </section>

      </main>
  );
}

function StatCard({
                    label,
                    value,
                  }: {
  label: string;
  value: string;
}) {
  return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">

        <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
          {label}
        </p>

        <p className="mt-2 truncate text-xl font-black">
          {value}
        </p>

      </div>
  );
}