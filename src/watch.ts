import { loadPet, savePet } from "./persistence.js";
import { applyDecay, feed, play, sleep } from "./pet.js";
import { renderStatus, renderMessage, renderWatchPrompt } from "./display.js";
import type { PetState } from "./pet.js";

function clearScreen() {
  process.stdout.write("\x1B[2J\x1B[0;0H");
}

const COMMANDS = ["feed", "play", "sleep", "quit"] as const;
type Command = typeof COMMANDS[number];

export async function runWatch(intervalSeconds = 10): Promise<void> {
  const saved = loadPet();
  if (!saved) {
    console.log("\n  No pet found. Run `tama new` to hatch one.\n");
    return;
  }

  let currentPet = applyDecay(saved);
  let selectedIndex = 0;
  let lastMessage: string | undefined;

  function redraw(message?: string) {
    if (message !== undefined) lastMessage = message;
    clearScreen();
    renderStatus(currentPet);
    if (lastMessage) renderMessage(lastMessage);
    renderWatchPrompt(COMMANDS, selectedIndex);
  }

  function shutdown() {
    clearInterval(ticker);
    process.stdin.setRawMode(false);
    process.stdin.pause();
    savePet(currentPet);
    clearScreen();
    console.log("\n  Goodbye!\n");
    process.exit(0);
  }

  function executeSelected() {
    const cmd: Command = COMMANDS[selectedIndex];
    lastMessage = undefined;

    if (cmd === "quit") { shutdown(); return; }

    const actions: Record<string, () => { pet: PetState; message: string }> = {
      feed:  () => feed(currentPet),
      play:  () => play(currentPet),
      sleep: () => sleep(currentPet),
    };

    const { pet, message } = actions[cmd]();
    currentPet = pet;
    savePet(currentPet);
    redraw(message);
  }

  // Enable raw mode so we get keypress events without Enter
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf-8");

  redraw();

  const ticker = setInterval(() => {
    currentPet = applyDecay(currentPet);
    savePet(currentPet);
    redraw();
  }, intervalSeconds * 1000);

  process.on("SIGINT", shutdown);

  process.stdin.on("data", (key: string) => {
    if (key === "\u0003") {
      // Ctrl+C
      shutdown();
    } else if (key === "\u001B[D" || key === "\u001B[A") {
      // Left or Up arrow
      selectedIndex = (selectedIndex - 1 + COMMANDS.length) % COMMANDS.length;
      redraw();
    } else if (key === "\u001B[C" || key === "\u001B[B") {
      // Right or Down arrow
      selectedIndex = (selectedIndex + 1) % COMMANDS.length;
      redraw();
    } else if (key === "\r" || key === "\n") {
      // Enter
      executeSelected();
    }
  });
}
