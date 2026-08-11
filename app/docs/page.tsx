import { FantasyShell, SiteNav, SectionTitle } from "../components/FantasyShell";

const rules = [
  ["01", "Create the arena", "Choose the race length and optional starting GP allowance, then share the generated room code."],
  ["02", "Race from your allowance", "Race-earned wealth increases your score. Pre-race value is treated separately so outside wealth cannot become free race progress."],
  ["03", "Use the bank safely", "Race-owned items can move through the bank without being counted twice. Imported value remains protected by the race wallet."],
  ["04", "Over-budget grace", "If your available race value falls below the allowed boundary, the protection system gives you time to correct an accidental withdrawal."],
  ["05", "Multiplayer sync", "Online rooms synchronise player scores, race state and remaining time to the live website."],
  ["06", "Account lock", "A paused or saved race remains tied to the correct RuneScape account so swapping accounts in the same client cannot hijack the race."],
];

export default function DocsPage() {
  return (
    <FantasyShell>
      <SiteNav active="docs" />
      <section className="site-center-wide px-4 py-14 sm:px-7 lg:py-20">
        <SectionTitle
          eyebrow="Race Manual"
          title="How 0GP Race Works"
          text="The competition is built around one idea: every point on the board should come from wealth legitimately earned during the race."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {rules.map(([n,title,text]) => (
            <article key={n} className="game-panel rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-yellow-500/25 bg-yellow-500/[.06] font-mono font-black text-yellow-300">{n}</div>
                <h2 className="text-xl font-black text-yellow-100">{title}</h2>
              </div>
              <div className="gold-line mt-5" />
              <p className="mt-5 text-sm leading-7 text-zinc-500">{text}</p>
            </article>
          ))}
        </div>

        <div className="game-panel mt-8 rounded-2xl p-7">
          <div className="text-[9px] font-black uppercase tracking-[.25em] text-yellow-400">Installation</div>
          <h2 className="mt-3 text-2xl font-black">RuneLite Plugin Hub</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">
            Once approved, open RuneLite → Plugin Hub → search for <span className="font-black text-yellow-300">0GP Race</span>.
          </p>
        </div>
      </section>
    </FantasyShell>
  );
}
