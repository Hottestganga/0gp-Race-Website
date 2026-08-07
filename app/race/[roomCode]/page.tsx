"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

const API_URL = process.env.NEXT_PUBLIC_0GP_API_URL || "";

const demoRoom: Room = {
  roomCode: "DEMO",
  raceName: "Live Race Preview",
  durationMilliseconds: 14400000,
  startingAllowance: 0,
  players: [
    { playerName: "Reedy", score: 42811204, remainingMilliseconds: 6138000, loggedIn: true, raceState: "RUNNING" },
    { playerName: "Ganga", score: 38442991, remainingMilliseconds: 6125000, loggedIn: true, raceState: "RUNNING" },
    { playerName: "Iron Mike", score: 31885402, remainingMilliseconds: 6097000, loggedIn: true, raceState: "RUNNING" },
  ],
};

const gp = (n: number) => new Intl.NumberFormat("en-AU").format(n) + " GP";

function time(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s/3600), Math.floor((s%3600)/60), s%60]
    .map(v => String(v).padStart(2, "0"))
    .join(":");
}

export default function RacePage() {
  const params = useParams();
  const roomCode = String(params.roomCode || "").toUpperCase();
  const [room, setRoom] = useState<Room | null>(API_URL ? null : { ...demoRoom, roomCode });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(API_URL));

  async function loadRace() {
    if (!API_URL) return;
    try {
      const response = await fetch(`${API_URL}/api/room?roomCode=${encodeURIComponent(roomCode)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Race not found");
      setRoom(data.room);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load race");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRace();
    if (!API_URL) return;
    const id = setInterval(loadRace, 2000);
    return () => clearInterval(id);
  }, [roomCode]);

  if (loading) return <Shell><p className="text-yellow-500 font-black">Loading race...</p></Shell>;

  if (error || !room) {
    return (
      <Shell>
        <div className="max-w-xl rounded-2xl border border-red-500/30 bg-red-500/[0.05] p-8">
          <p className="text-red-400 font-black">RACE UNAVAILABLE</p>
          <h1 className="mt-3 text-4xl font-black">{roomCode}</h1>
          <p className="mt-4 text-zinc-400">{error}</p>
          <Link href="/live" className="mt-7 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-black text-black">BACK TO LIVE RACES</Link>
        </div>
      </Shell>
    );
  }

  const sorted = [...room.players].sort((a,b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black">0GP <span className="text-yellow-500">RACE</span></Link>
          <div className="flex items-center gap-2 text-xs font-black text-green-400"><span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />LIVE</div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {!API_URL && (
          <div className="mb-8 rounded-xl border border-yellow-500/25 bg-yellow-500/[0.05] px-5 py-4 text-sm text-yellow-200">
            Demo mode: set <code className="font-mono text-yellow-400">NEXT_PUBLIC_0GP_API_URL</code> when the hosted backend is ready.
          </div>
        )}

        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">Live Race</p>
            <h1 className="mt-3 text-5xl font-black sm:text-7xl">{room.raceName}</h1>
            <p className="mt-3 font-mono text-yellow-400">{room.roomCode}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Players" value={String(room.players.length)} />
            <Stat label="Starting GP" value={gp(room.startingAllowance)} />
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">Leaderboard</h2>
            <span className="text-xs text-zinc-600">{API_URL ? "Refreshes every 2 seconds" : "Demo data"}</span>
          </div>

          <div className="space-y-3">
            {sorted.map((player, i) => (
              <div key={player.playerName} className={`grid gap-4 rounded-2xl border p-5 sm:grid-cols-[60px_1fr_auto_auto] sm:items-center ${i===0 ? "border-yellow-500/40 bg-yellow-500/[0.04]" : "border-white/10 bg-zinc-950"}`}>
                <div className={i===0 ? "text-2xl font-black text-yellow-500" : "text-2xl font-black text-zinc-600"}>#{i+1}</div>
                <div>
                  <p className="text-lg font-black">{player.playerName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${player.loggedIn ? "bg-green-400" : "bg-zinc-600"}`} />
                    <span className="text-xs uppercase text-zinc-500">{player.raceState}</span>
                  </div>
                </div>
                <div><p className="text-xs uppercase text-zinc-600">Time remaining</p><p className="mt-1 font-mono text-zinc-300">{time(player.remainingMilliseconds)}</p></div>
                <div className="font-mono text-xl font-black text-yellow-400 sm:text-right">{gp(player.score)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-black px-6 py-20 text-white"><div className="mx-auto max-w-6xl">{children}</div></main>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-zinc-950 px-5 py-4"><p className="text-xs uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-2 font-black text-yellow-400">{value}</p></div>;
}
