0GP RACE WEBSITE v6 - CONCEPT SCREENSHOT LAYOUT

This build fixes the actual problem:
the previous character art was being covered by a very wide center layout.

Now:
- left side character scenery is a hard visible 270px strip
- right side dragon / skeleton scenery is a hard visible 270px strip
- center dashboard is intentionally narrower, like the concept screenshot
- scenery sits UNDER the dashboard but is NOT hidden by it
- all major pages use the same character-framed layout
- live API / plugin communication is unchanged

Install over the existing site, then:
Ctrl+C
Remove-Item -Recurse -Force .next
npm.cmd run dev
