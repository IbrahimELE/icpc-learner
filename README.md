# SEERC Trainer

An offline-first training app for the **ICPC Southeastern Europe Regional Contest (SEERC)**, built for a beginner who wants a structured path from "I know some C++" to "I can solve real regional problems".

Everything runs in your browser from this folder. No accounts, no tracking; your progress is saved in the browser's local storage (export a backup from **Settings**).

## Start

**Option A — full experience (recommended):** double-click `start.bat` (Windows) or run `./start.sh` (macOS/Linux). It starts a tiny local server on <http://localhost:7331> and opens the app. This enables the **C++ Playground's local compiler** and the **stress tester**, using the `g++` installed on your machine. Requires Node.js (LTS).

**Option B — no server:** open `index.html` directly in a browser. Everything works except local compilation; the Playground then uses the public Wandbox compiler over the internet.

> If your local `g++` cannot compile (for example a broken MSYS2 install), the server detects this at startup and the Playground falls back to the online Wandbox compiler automatically. Set the `SEERC_GPP` environment variable to point the server at a specific `g++` binary.

## What is inside

| Area | Contents |
|---|---|
| **Roadmap** | 49 topics in 5 tiers, each with a full lesson, SEERC-importance stars, prerequisites and time estimates |
| **Lessons** | Explanations written for beginners, C++ snippets, pitfalls, "how to recognize it", and the SEERC angle |
| **Problem Bank** | 360+ curated problems (CSES, Codeforces, AtCoder, Kattis) with difficulty, topic tags and progressive hints; status tracking |
| **Practice** | 225 quiz questions, 150+ spaced-repetition flashcards, 50+ "name the technique" drills, endless complexity drills |
| **Visualizers** | 35 step-by-step algorithm animations with synchronized code highlighting |
| **Contest Simulator** | ICPC rules (solved count + penalty), 5-hour timer, balloons, replay of past SEERC sets, mashups from the bank, upsolve queue |
| **Playground** | C++ editor, run with input, expected-output diff, stress testing against a brute force |
| **Cheat Sheet** | 70 compile-tested templates; tick the ones you want and print your Team Reference Document |
| **Tools** | Complexity calculator, constraint → technique guide, modular calculator, test generator, template generator |
| **About SEERC** | Format, eligible countries, archive of past contests (Codeforces Gym / Universal Cup / PDFs), penalty calculator, resources |
| **Study Plan** | Week-by-week schedule from today to contest day based on your hours per week |

## Suggested routine

1. **Daily (20–40 min):** open the Dashboard, do the flashcards that are due, one technique drill, and one problem.
2. **Study sessions (2–3 h):** one lesson → its quiz → 2–3 of its problems in the Playground.
3. **Weekly (from week 4):** one mock contest in the simulator, then upsolve what you missed.
4. **Two weeks before SEERC:** print the Team Reference Document, do full 5-hour replays under real conditions.

## Folder layout

```
index.html            app shell (loads all scripts, no build step)
css/app.css           styles (dark/light themes)
js/core/              utilities, state store, markdown renderer, highlighter, router, UI kit
js/data/              curriculum: topics, lessons/, problems, quizzes, flashcards, drills, templates, SEERC facts
js/viz/               visualizer engine + algorithm animations
js/pages/             one file per page
server.js             local static server + /api/run and /api/stress (Node, no dependencies)
start.bat, start.sh   launchers
```

## Facts and sources

SEERC facts (2026 dates and sites, eligible countries, past gym IDs) were checked in September 2026 against icpc.global, the SEERC site, Codeforces Gym, Universal Cup and the ICPC archive mirror. Always confirm the current year's rules on the official site: <https://seerc.euc.icpc.global/>.
