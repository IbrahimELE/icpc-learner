/* Lessons — ICPC team strategy and contest day. */
window.LESSONS = window.LESSONS || {};

LESSONS['contest-strategy'] = { md: String.raw`
## How ICPC scoring works
- Teams of **three**, **one computer**, **five hours**, 12–13 problems.
- Ranking: most problems solved; ties broken by **penalty time** = for each solved problem, the minute of the accepted submission plus **20 minutes per rejected submission** on that problem. Unsolved problems cost nothing.
- Compilation errors usually cost nothing (check the year’s rules); everything else (WA, TLE, RE) counts.
- The scoreboard is usually **frozen for the last hour**: your submissions count, but nobody sees the results until the reveal.
- Balloons: one per solved problem, a different colour per problem — the fastest way to see what the room is solving.
Use the [[page:seerc?tab=scoring|penalty calculator]] to see how testing before submitting beats raw speed.

## What a strong 3-person team does
### Minute 0–20: read everything
Split the set (A–D, E–H, I–M). Each person reads their problems and writes a one-line summary and a gut difficulty (easy / doable / hard / no idea). Then a 2-minute sync: agree on the two easiest problems. **Nobody codes before the first sync** unless a problem is trivially known.

### Roles that work
- **Coder** of the current problem: types, compiles, tests. Nobody else touches the keyboard.
- **Verifier**: has already solved the same problem on paper; reads the code as it is typed, prepares test cases, checks the output format.
- **Thinker**: works on the next problems on paper, occasionally checks the scoreboard for what others solve.
Roles rotate by problem. Solo teams simulate this: read all, plan on paper, code, test.

### The queue
Keep a written priority list of problems with their status (idea / ready to code / coding / testing / accepted / rejected × k). The computer always runs the *most certain* ready-to-code problem. Uncertain ideas ripen on paper while the computer is busy.

### Submitting
Before every submission: samples pass, one tiny edge case (n = 1) passes, output format re-read, ''long long'' where sums can be big, all globals reset between test cases. A wrong submission costs 20 minutes *and* the time to debug; a 3-minute test costs 3 minutes.

### When rejected
Do not hammer the judge. Print the code (or step away from the keyboard), let the verifier read it while the coder switches to another problem for 10 minutes. Re-read the statement first: half of all WAs are misreadings.

### The last hour (frozen scoreboard)
Only work on problems that are 80% done. Do not start anything new unless it is an easy problem you missed. Submit what you have; a last-minute accepted problem counts fully.

## Before the contest
- **Team Reference Document (TRD)**: the printed set of templates you are allowed to bring (traditionally up to 25 pages; check the official rules). Build it from the [[page:cheatsheet|Cheat Sheet]]: tested code only, with a table of contents, big enough font to read. Practise *using* it in mock contests — an untested or unfamiliar TRD is worthless.
- **Environment**: know the judge’s compiler flags and language versions; practise on the same OS/editor if announced (many regionals use Linux with a basic editor). Learn to compile from a terminal: ''g++ -O2 -std=gnu++20 -Wall main.cpp''.
- **Mock contests**: at least six full 5-hour simulations under real conditions (one computer, no internet, printed TRD). Use this app’s [[page:contest|Contest Simulator]] with past SEERC sets and Universal Cup mirrors.
- **Sleep** the night before. Eat breakfast. Bring water and snacks if allowed.

## During the contest: checklist per problem
1. Restate the task in one sentence; note constraints and the intended complexity.
2. Samples by hand; smallest edge case in your head.
3. Idea → 30-second proof or counterexample attempt.
4. Plan the code on paper: structures, main loop, edge cases.
5. Code in one go; compile once; run samples + edge case.
6. Submit. Note the time and any rejection in the queue.

## Common team failures (and fixes)
| Failure | Fix |
|---|---|
| Three people staring at one screen | roles; only the coder at the keyboard |
| Reading only the first few problems | split the set; the easiest problem is often letter J |
| Coding an unproven greedy | 2 minutes of counterexample hunting first |
| Wrong-answer spam | mandatory test before submit; step away after a rejection |
| Sunk cost on one problem | 40-minute rule: switch |
| Debugging on the computer for 30 minutes | print the code, debug on paper, free the machine |
| Forgetting multi-test resets / output format | the verifier’s checklist |

## Realistic goals for a first SEERC
Solve the 2–3 approachable problems cleanly and early, then fight for one medium problem. That is a respectable result and a huge step up from most first-time teams. Everything in this roadmap serves that goal: Tiers 0–1 are the approachable problems; Tier 2 is the medium one.

:::team
Solo training still counts: you can practise reading all problems, planning on paper, and the test-before-submit discipline alone. But find two teammates early — coordination is a skill that needs practice, and SEERC registration is per team through your university coach.
:::
` };
