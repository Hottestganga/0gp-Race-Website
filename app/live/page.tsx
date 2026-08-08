"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LiveRacesPage() {
    const router = useRouter();

    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");

    function watchRace() {
        const code = roomCode.trim().toUpperCase();

        if (!code) {
            setError("Enter a room code.");
            return;
        }

        if (!/^0GP-[A-Z0-9]{4,10}$/.test(code)) {
            setError("Room codes should look like 0GP-6666.");
            return;
        }

        setError("");
        router.push(`/race/${encodeURIComponent(code)}`);
    }

    return (
        <main className="min-h-screen bg-black text-white">

            {/* NAVIGATION */}
            <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <Link href="/" className="text-xl font-black">
                        0GP <span className="text-yellow-500">RACE</span>
                    </Link>

                    <div className="flex items-center gap-6 text-sm font-bold text-zinc-500">

                        <Link
                            href="/leaderboard"
                            className="transition hover:text-yellow-500"
                        >
                            Leaderboard
                        </Link>

                        <Link
                            href="/history"
                            className="transition hover:text-yellow-500"
                        >
                            Race History
                        </Link>

                    </div>

                </div>
            </nav>

            {/* HERO */}
            <section className="relative overflow-hidden border-b border-white/10 px-6 py-24">

                <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[160px]" />

                <div className="relative mx-auto max-w-5xl text-center">

                    <div className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-full border border-green-500/25 bg-green-500/[0.05] px-4 py-2">

                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

                        <span className="text-xs font-black uppercase tracking-[0.25em] text-green-400">
              Spectator Mode
            </span>

                    </div>

                    <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
                        WATCH A RACE
                        <br />
                        <span className="text-yellow-500">LIVE.</span>
                    </h1>

                    <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
                        Enter an active 0GP Race room code to open its live spectator
                        leaderboard.
                    </p>

                </div>

            </section>

            {/* ROOM LOOKUP */}
            <section className="px-6 py-20">

                <div className="mx-auto max-w-2xl">

                    <div className="rounded-3xl border border-yellow-500/25 bg-zinc-950 p-8 shadow-2xl shadow-yellow-950/20">

                        <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-500">
                            Find Race
                        </p>

                        <h2 className="mt-3 text-3xl font-black">
                            Enter a room code
                        </h2>

                        <p className="mt-3 text-zinc-500">
                            Room codes are created inside the 0GP Race RuneLite plugin.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <input
                                value={roomCode}
                                onChange={(event) => {
                                    setRoomCode(event.target.value);
                                    setError("");
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        watchRace();
                                    }
                                }}
                                placeholder="0GP-6666"
                                className="flex-1 rounded-xl border border-white/10 bg-black px-5 py-4 font-mono text-lg font-bold uppercase text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
                            />

                            <button
                                type="button"
                                onClick={watchRace}
                                className="rounded-xl bg-yellow-500 px-7 py-4 font-black text-black transition hover:bg-yellow-400"
                            >
                                WATCH RACE
                            </button>

                        </div>

                        {error && (
                            <p className="mt-4 text-sm font-bold text-red-400">
                                {error}
                            </p>
                        )}

                        <div className="mt-8 rounded-xl border border-white/5 bg-black/60 p-5">

                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                                Example
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setRoomCode("0GP-6666");
                                    setError("");
                                }}
                                className="mt-2 font-mono text-yellow-400 transition hover:text-yellow-300"
                            >
                                0GP-6666
                            </button>

                        </div>

                    </div>

                </div>

            </section>

            {/* WHAT YOU WILL SEE */}
            <section className="border-t border-white/10 bg-zinc-950/40 px-6 py-20">

                <div className="mx-auto max-w-6xl">

                    <div className="text-center">

                        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                            Live Spectating
                        </p>

                        <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                            Follow the competition.
                        </h2>

                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-3">

                        <Feature
                            title="Live Rankings"
                            text="See every competitor ordered by their current race GP total."
                        />

                        <Feature
                            title="Race Timer"
                            text="Follow the remaining competition time for each racer."
                        />

                        <Feature
                            title="Player Status"
                            text="See whether racers are running, paused or currently logged out."
                        />

                    </div>

                </div>

            </section>

            <footer className="border-t border-white/10 px-6 py-10">

                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-zinc-600 sm:flex-row">

                    <div>
            <span className="font-black text-white">
              0GP <span className="text-yellow-500">RACE</span>
            </span>

                        <span className="ml-3">
              Developed by Ganga
            </span>
                    </div>

                    <div>
                        Install through the RuneLite Plugin Hub.
                    </div>

                </div>

            </footer>

        </main>
    );
}

function Feature({
                     title,
                     text,
                 }: {
    title: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/60 p-7">

            <div className="h-2 w-2 rounded-full bg-yellow-500" />

            <h3 className="mt-5 text-xl font-black">
                {title}
            </h3>

            <p className="mt-3 leading-7 text-zinc-500">
                {text}
            </p>

        </div>
    );
}