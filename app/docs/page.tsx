import Link from "next/link";

const sections = [
  ["1. Create a race", "Choose the race length and optional starting GP allowance, then share the generated room code."],
  ["2. Race from your allowance", "Race-earned wealth increases your score. Pre-race items used from the bank are treated as imported value and reduce your available race balance."],
  ["3. Bank safely", "Race-owned items can be banked and withdrawn again without being counted twice. Returning imported items reverses their debit."],
  ["4. Over-budget grace", "If your balance drops below 0 GP, you have 30 seconds to correct the mistake before disqualification."],
  ["5. Multiplayer", "Online rooms synchronise player scores, race status and remaining time when the multiplayer service is enabled."],
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black">0GP <span className="text-yellow-500">RACE</span></Link>
          <span className="text-sm font-black text-zinc-500">DOCUMENTATION</span>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">Getting Started</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">HOW 0GP RACE WORKS</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
          0GP Race is designed to make wealth-building competitions easy to run while protecting against accidentally importing outside value.
        </p>

        <div className="mt-12 space-y-5">
          {sections.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
              <h2 className="text-2xl font-black text-yellow-500">{title}</h2>
              <p className="mt-3 leading-7 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.05] p-7">
          <h2 className="text-xl font-black">Installation</h2>
          <p className="mt-3 text-zinc-400">
            Once approved, open RuneLite → Plugin Hub → search for <span className="font-black text-yellow-400">0GP Race</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
