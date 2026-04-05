# Tamagotchi CLI — Roadmap

Current state: single-pet CLI, local JSON persistence, one user.
Target: a Digimon-inspired multiplayer experience — digital monsters that live on your machine, connected to a wider digital world via the internet.

## Theme

Your creature is a **digital monster** that inhabits your terminal. The internet is its world — wild digital monsters roam it as viruses, rogue processes, malicious entities. When your terminal is open and connected, encounters can happen at any time. When you're offline, the digital world is quiet. Your monster defends your system or hunts viruses depending on how you play.

---

## Phase 1 — Server + Auth + Database

Replace `~/.tamagotchi/save.json` with a real backend. The CLI becomes a thin client that talks to the server.

**Stack**
- Server: Node.js + Fastify (TypeScript, stays in ecosystem)
- ORM: Prisma
- DB: PostgreSQL
- Auth: JWT (register/login, token stored in `~/.tamagotchi/config.json`)

**Schema (initial)**
```
User        id, username, passwordHash, elo, createdAt
Creature    id, userId, name, speciesId, hunger, happiness, energy, health, age, stage, dead, lastSaved
```

**Tasks**
- [ ] Init Fastify server (`server/` directory at repo root)
- [ ] Prisma schema — User + Creature tables
- [ ] Auth routes: `POST /auth/register`, `POST /auth/login` → JWT
- [ ] Creature routes: `GET /creatures`, `POST /creatures`, `POST /creatures/:id/feed`, etc.
- [ ] Move decay logic to server (apply on load, same timestamp math)
- [ ] Update `persistence.ts` to call server API instead of reading local JSON
- [ ] Store JWT in `~/.tamagotchi/config.json`
- [ ] `tama login` and `tama register` commands

---

## Phase 2 — Species System + Party

Add creature variety and expand from 1 pet to a party of 6.

**Species definition (static config, e.g. `server/data/species.ts`)**
```typescript
interface Species {
  id: string;             // "fluffox", "embrite", "gloomfin"
  name: string;
  decayRates: { hunger: number; happiness: number; energy: number };
  statGrowth: { atk: number; def: number; spd: number; hp: number }; // per level
  stages: LifeStageConfig[];
  sprites: Record<LifeStage, string[]>;
  moves: string[];        // move IDs available to this species
}
```

**Expanded Creature schema**
```
Creature    + speciesId, level, xp, atk, def, spd, maxHp
```

**Party rules**
- Max 6 creatures per user
- Each creature is independent (separate stats, decay, stage)
- One creature is designated "active" for watch mode display

**Tasks**
- [ ] Define 3–5 starter species with distinct stat curves and decay rates
- [ ] `tama hatch <species>` — hatch a new creature of a given species (max 6)
- [ ] `tama party` — list all creatures with stats
- [ ] `tama switch <id>` — set active creature for watch mode
- [ ] Add `speciesId` and battle stats to Creature DB table
- [ ] Add level + XP system (XP gained from care, battles)
- [ ] ASCII sprites per species per stage (extend `sprites.ts` pattern)

---

## Phase 3 — Wild Encounters (Virus System)

While `tama watch` is running and the client has an active server connection, wild digital monsters (viruses) can intrude at any time.

**Concept**
- Wild encounters only happen when online — viruses exist in the digital network, not locally
- When offline (no server connection), watch mode runs normally with no encounters
- Encounter is a "virus" — a wild creature with randomized species, level, and moves
- User can: **fight** (make it faint → XP) or **capture** (add to party if slot available)
- A system notification fires when an encounter starts so the user knows even if the terminal isn't in focus

**Encounter flow**
1. Server periodically pushes encounter events to connected watch sessions via WebSocket
2. Client receives event, interrupts watch mode display, renders encounter screen
3. User picks: `[fight]` `[catch]` `[flee]`
4. Battle resolves turn-by-turn (same engine as PvP, but opponent is server-controlled AI)
5. On faint: XP awarded to active creature, encounter dismissed
6. On catch: creature added to party (if < 6), or prompted to release one
7. On flee: 50% chance to escape (speed-based); encounter ends
8. After encounter: watch mode resumes normally

**Encounter rate**
- Base rate: 1 encounter per 15–30 min (random interval, server-side)
- Rate scales with server "threat level" (could be a global value, fun for events)
- Higher-level players face higher-level viruses

**Notification**
- Uses `node-notifier` (or OS-native via shell: `osascript` on Mac, `notify-send` on Linux)
- Message: `"⚠ Virus detected — [VirusName] is attacking your system!"`
- Fires client-side on encounter event receipt

**Offline behavior**
- Watch mode checks server connectivity on start
- If no connection: displays `[OFFLINE — no encounters]` indicator, watch mode still works for care
- On reconnect: encounter eligibility resumes

**Wild Creature schema**
```
WildEncounter   id, userId, speciesId, level, status (pending/fled/fainted/caught), createdAt
```

**Tasks**
- [ ] Server: encounter scheduler — push WebSocket events to connected sessions at random intervals
- [ ] Server: wild creature generator — random species + level scaled to user's active creature
- [ ] Client: interrupt watch mode on encounter event, render encounter screen
- [ ] Client: fight/catch/flee logic in watch mode keypress handler
- [ ] Client: OS notification on encounter (`node-notifier`)
- [ ] Client: offline detection + `[OFFLINE]` indicator in watch mode
- [ ] Server: log encounter outcomes to `WildEncounter` table
- [ ] XP reward on faint, party add on catch

---

## Phase 4 — PvP Battle System + Matchmaking

Turn-based PvP where users queue with their full party of 6. Same battle engine used for wild encounters (Phase 3) — just swap the AI opponent for a human player.

**Battle rules**
- Each player sends their full party of 6
- One creature active at a time per player (send out / switch)
- Turn-based: each turn both players pick a move (or switch)
- Moves deal damage based on atk vs def + type modifiers
- Battle ends when all 6 of one side faint
- Winner gains ELO, XP for participating creatures

**Matchmaking**
- ELO stored on User (starts at 1000)
- Queue: `POST /battle/queue` — enter queue with party
- Server pairs users within ±150 ELO range
- If no match after 30s, widen range by 100

**Battle schema**
```
Battle          id, player1Id, player2Id, winnerId, status, createdAt, completedAt
BattleLog       id, battleId, turn, action (JSON)
Move            id, name, power, accuracy, type, effect
CreatureMove    creatureId, moveId
```

**Battle engine (server-side)**
- Turn resolution: both players submit moves, server resolves simultaneously or priority-based (speed stat)
- WebSocket connection for real-time battle (`ws://server/battle/:battleId`)
- Fallback: polling `GET /battle/:id/state` if WS unavailable

**CLI battle commands**
- `tama battle queue` — enter matchmaking queue
- `tama battle status` — show queue status or active battle
- `tama battle move <move>` — submit move in active battle
- `tama battle switch <id>` — switch active creature

**Tasks**
- [ ] Move definitions (4–6 moves per species, typed effects)
- [ ] Battle engine: damage formula, turn resolution, switch logic
- [ ] ELO update on battle complete
- [ ] WebSocket server for real-time battle state
- [ ] `tama battle` commands (queue, move, switch)
- [ ] Battle history: `tama history` shows recent results

---

## Deferred / Nice-to-have

- [ ] Leaderboard endpoint (`GET /leaderboard`)
- [ ] Achievements / care log
- [ ] Species evolution (Creature evolves at certain level)
- [ ] Type system (fire/water/etc. with effectiveness chart)
- [ ] Web dashboard companion (React)
- [ ] Push notifications when a stat goes critical

---

## Current Milestones (already done)

- [x] Core pet model with stat decay
- [x] Persistence (load/save JSON)
- [x] Basic CLI commands (feed, play, sleep, status, rename)
- [x] ASCII art sprites per life stage
- [x] Life stage progression
- [x] Interactive watch mode with arrow key navigation
