# Autorecorder

Automated screen-recording suite for CopilotKit framework integrations. It
produces one narrated-looking demo video per documentation page: read the doc,
switch to VS Code and show the code that implements it, switch to the browser and
drive the live feature (including on-screen Notepad notes and terminal replays
for error/limitation reporting).

Configured for **AG2 (Python) + Angular** (`CPK-Angular-Ag2`) — covering all 11
`/demo` routes in `frontend/src/app/app.routes.ts` plus 2 compile-error clips
(`frontend-tools-compile` and `a2ui-compile`).

> **Porting this to another framework?** Read **[ADAPT.md](ADAPT.md)** first. It
> is written for the person or agent doing the port, and it is the contract the
> `doctor` command enforces.

---

## Run it

Both services must be up first — the recorder refuses to start otherwise, because
a video of a dead page is worse than no video.

```bash
cd backend  && uv run main.py    # AG2 FastAPI + AGUIStream :8000
cd frontend && npm run dev       # Copilot Runtime :8200 + ng serve :4200
```

`npm run dev` starts **two** processes. Angular has no server route to host the
Copilot Runtime, so it runs as its own Node process (`frontend/server.ts`) on
`8200` and the browser posts across origins to it — which is why `runtimeWarmPath`
in `project.config.ts` is an absolute URL (`http://localhost:8200/api/copilotkit/info`).

Then:

```bash
cd autorecorder
npm install
npx playwright install chromium

npm run doctor            # validate offline configuration (must exit 0)
npm run check             # typecheck + unit tests + core integrity check
npm run record -- --list  # list all 13 registered clips
npm run record -- --quickstart
npm run record            # record all clips in order
```

| Flag | Effect |
|---|---|
| `--list`, `--help` | Print every registered route and exit |
| `--doctor` | Validate the configuration; exits 1 on error |
| `--doctor --online` | Also probe every doc/demo URL and the selectors |
| `--<page-id>` | Record one page — `--quickstart`, `--threads`, `--a2ui-compile` |
| `--page=<id>` | Same thing, explicit form |
| `--filter=<query>` | Record every page whose id or name contains the query |
| `--force` | Record even if the pre-flight health check fails |

Videos land in `videos/` as `AG2-angular-<NN>-<name>.webm`, 1920×1080, ~25fps.

---

## Registered Clips & Error Reporting

See **[`videos/notes.md`](videos/notes.md)** for full error-reporting notes per video.

| # | ID | Output File | Type | On-Screen Error Note |
|---|---|---|---|---|
| 01 | `quickstart` | `AG2-angular-01-Quickstart.webm` | Working demo | — |
| 02 | `chat-ui` | `AG2-angular-02-ChatUi.webm` | Working demo (4 surfaces) | — |
| 03 | `frontend-tools-generative-ui` | `AG2-angular-03-FrontendToolsGenerativeUi.webm` | Working + finding (Turn 3) | `registercomponent-findings.txt` |
| 04 | `a2ui` | `AG2-angular-04-A2ui.webm` | Error / inert feature | `a2ui-catalogs.txt`, `a2ui-notes.txt` |
| 05 | `voice-multimodal` | `AG2-angular-05-VoiceMultimodal.webm` | Partial (attach OK, transcribe 503) | `voice-notes.txt` |
| 06 | `human-in-the-loop` | `AG2-angular-06-HumanInTheLoop.webm` | Working (`requestApproval` card) | Logs multi-turn warning via `ctx.warn` if model asks in prose first |
| 07 | `shared-state` | `AG2-angular-07-SharedState.webm` | Error / backend state gap | `shared-state-notes.txt` |
| 08 | `threads` | `AG2-angular-08-Threads.webm` | Error / unlicensed runtime | `threads-issue.txt` |
| 09 | `memory` | `AG2-angular-09-Memory.webm` | Error / unlicensed runtime | `memory-notes.txt` |
| 10 | `attachments` | `AG2-angular-10-Attachments.webm` | Working demo | — |
| 11 | `headless` | `AG2-angular-11-HeadlessUi.webm` | Working demo | — |
| 12 | `frontend-tools-compile` | `AG2-angular-12-FrontendToolsCompileError.webm` | Compile error (`TS2322`) | `frontend-tools-compile.txt`, `fix.txt` + terminal replay |
| 13 | `a2ui-compile` | `AG2-angular-13-A2uiUndefinedNames.webm` | Compile error (`TS2304` × 22) | `a2ui-compile.txt`, `fix.txt` + terminal replay |
