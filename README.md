# tamagotchi-cli

A persistent terminal virtual pet built with TypeScript. Feed it, play with it, keep it alive — or neglect it and watch it suffer. State persists between sessions so elapsed real time counts against your pet even when the terminal is closed.

## Install

```bash
git clone <repo>
cd tamagotchi-cli
npm install
npm run build
npm install -g .
```

After installing globally, the `tama` command is available anywhere.

For development without installing:

```bash
npm run dev -- <command>
```

## Commands

```
tama new                 Hatch a new pet (prompts for name)
tama status              Show current stats
tama feed                Feed your pet (+30 hunger)
tama play                Play with your pet (+25 happiness, -15 energy)
tama sleep               Let your pet rest (+40 energy)
tama rename <name>       Rename your pet
tama watch [secs]        Interactive mode (default: refreshes every 10s)
tama help                Show help
```

## Watch Mode

`tama watch` keeps the terminal alive with a live display that auto-refreshes.

```
← →   Move selection between actions
↑ ↓   Also move selection
Enter  Execute selected action
Ctrl+C Exit and save
```

Decay continues to accrue in real time while in watch mode. The display refreshes every N seconds (default 10); pass a number to change it:

```bash
tama watch 5    # refresh every 5 seconds
```

## How It Works

### Stats

| Stat | Range | Effect when zero |
|---|---|---|
| Hunger | 0–100 | Health degrades at 1.5/min |
| Happiness | 0–100 | Health degrades at 1.5/min |
| Energy | 0–100 | Can't play below 10 |
| Health | 0–100 | Pet dies at 0 |

### Decay rates (per real-world minute)

| Stat | Rate |
|---|---|
| Hunger | −0.5 |
| Happiness | −0.4 |
| Energy | −0.3 |

Decay is calculated from the timestamp of the last save. No background daemon — offline time still counts.

### Life stages

| Stage | Age threshold |
|---|---|
| Egg | 0m |
| Baby | 5m |
| Child | 30m |
| Adult | 120m |
| Elder | 480m |
| Dead | Health = 0 |

### Persistence

State is saved to `~/.tamagotchi/save.json` as plain JSON. You can inspect or edit it directly if needed.

## Project Structure

```
src/
  index.ts        CLI entry point and command routing
  pet.ts          Pet state model, decay logic, actions
  watch.ts        Interactive watch mode (raw keypress, setInterval)
  display.ts      Terminal rendering with chalk
  sprites.ts      ASCII art per life stage
```

## Dev

```bash
npm run dev -- watch     # run without building
npm run build            # compile to dist/
```
