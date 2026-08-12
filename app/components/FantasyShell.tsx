import Link from "next/link";

export function FantasyShell({ children }: { children: React.ReactNode }) {
  return (
      <main className="fantasy-stage min-h-screen text-white">
        <div className="fantasy-vignette" />
        <div className="fantasy-grid" />
        <Embers />
        {children}
      </main>
  );
}

export function SiteNav({ active }: { active?: string }) {
  const links = [
    ["/live", "LIVE RACES", "live"],
    ["/history", "RACE HISTORY", "history"],
    ["/leaderboard", "LEADERBOARD", "leaderboard"],
    ["/docs", "HOW TO PLAY", "docs"],
  ];

  return (
      <nav className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur-xl">
        <div className="site-center-wide flex items-center justify-between gap-5 px-4 py-3 sm:px-7">
          <Link href="/" className="flex items-center gap-3">
            <img
                src="/0gp-race-logo.png"
                alt=""
                className="h-11 w-11 rounded-lg object-cover shadow-[0_0_25px_rgba(229,185,65,.15)]"
            />
            <div>
              <div className="text-xl font-black leading-none">
                0GP <span className="gold-text">RACE</span>
              </div>
              <div className="mt-1 hidden text-[8px] font-black uppercase tracking-[.28em] text-zinc-600 sm:block">
                RuneLite Race Platform
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 overflow-x-auto text-[9px] font-black uppercase tracking-[.17em] lg:flex lg:gap-6 lg:text-[10px]">
              {links.map(([href, label, key]) => (
                  <Link
                      key={href}
                      href={href}
                      className={`whitespace-nowrap transition ${
                          active === key
                              ? "text-yellow-300"
                              : "text-zinc-500 hover:text-white"
                      }`}
                  >
                    {label}
                  </Link>
              ))}
            </div>

            <a
                href="https://discord.gg/hP6vS7vGH"
                target="_blank"
                rel="noopener noreferrer"
                title="Join the Kaha 0GP Discord"
                className="whitespace-nowrap rounded-lg border border-yellow-500/35 bg-yellow-500/[.06] px-4 py-2 text-[9px] font-black uppercase tracking-[.13em] text-yellow-300 transition hover:border-yellow-300/60 hover:bg-yellow-500/[.12] sm:text-[10px]"
            >
              💬 JOIN DISCORD
            </a>
          </div>
        </div>
      </nav>
  );
}

function Embers() {
  const specs = [
    ["12%", "20%", "0s"],
    ["22%", "72%", "1.2s"],
    ["78%", "18%", "2.6s"],
    ["88%", "65%", ".6s"],
    ["65%", "88%", "3.5s"],
    ["35%", "84%", "2s"],
  ];

  return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {specs.map(([left, top, delay], i) => (
            <span
                key={i}
                className="ember absolute h-1 w-1 rounded-full bg-orange-300 shadow-[0_0_12px_4px_rgba(251,146,60,.25)]"
                style={{ left, top, animationDelay: delay }}
            />
        ))}
      </div>
  );
}

export function SectionTitle({
                               eyebrow,
                               title,
                               text,
                             }: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
      <div>
        <div className="text-[10px] font-black uppercase tracking-[.30em] text-yellow-400">
          {eyebrow}
        </div>

        <h1 className="pixel-title mt-3 text-4xl font-black uppercase sm:text-6xl lg:text-7xl">
          {title}
        </h1>

        {text && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400">
              {text}
            </p>
        )}
      </div>
  );
}