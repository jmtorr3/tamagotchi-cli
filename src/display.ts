import chalk from "chalk";
import { sprites } from "./sprites.js";
import type { PetState } from "./pet.js";

const BAR_WIDTH = 20;

function statBar(value: number): string {
  const filled = Math.round((value / 100) * BAR_WIDTH);
  const empty  = BAR_WIDTH - filled;
  const color =
    value > 60 ? chalk.green :
    value > 30 ? chalk.yellow :
                 chalk.red;
  return color("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}

function stageLabel(stage: string): string {
  return chalk.cyan(`[${stage.charAt(0).toUpperCase() + stage.slice(1)}]`);
}

export function renderStatus(pet: PetState): void {
  const sprite = sprites[pet.stage];

  console.log();
  sprite.forEach(line => console.log("  " + chalk.yellow(line)));
  console.log();
  console.log(
    `  ${chalk.bold(pet.name)}  ${stageLabel(pet.stage)}  ${chalk.gray(`Age: ${Math.floor(pet.age)}m`)}`
  );
  console.log();
  console.log(`  Hunger    ${statBar(pet.hunger)}  ${Math.round(pet.hunger)}%`);
  console.log(`  Happiness ${statBar(pet.happiness)}  ${Math.round(pet.happiness)}%`);
  console.log(`  Energy    ${statBar(pet.energy)}  ${Math.round(pet.energy)}%`);
  console.log(`  Health    ${statBar(pet.health)}  ${Math.round(pet.health)}%`);
  console.log();

  if (pet.dead) {
    console.log(chalk.red("  Your pet has died. Run `tama new` to start over."));
    console.log();
  }
}

export function renderMessage(message: string): void {
  console.log(`  ${chalk.white(message)}`);
  console.log();
}

export function renderWatchPrompt(commands: readonly string[], selectedIndex: number): void {
  const items = commands.map((cmd, i) =>
    i === selectedIndex
      ? chalk.bgWhite.black(` ${cmd} `)
      : chalk.gray(`  ${cmd}  `)
  ).join("");
  console.log(`  ${items}`);
  console.log(chalk.gray("  ← → to select  Enter to confirm  Ctrl+C to quit"));
  console.log();
}

export function renderHelp(): void {
  console.log();
  console.log(chalk.bold("  tama <command>"));
  console.log();
  console.log("  status          Show your pet's stats");
  console.log("  feed            Feed your pet");
  console.log("  play            Play with your pet");
  console.log("  sleep           Let your pet rest");
  console.log("  rename <name>   Rename your pet");
  console.log("  new             Start a new pet (prompts for name)");
  console.log("  watch [secs]    Interactive mode, refreshes every N seconds (default 10)");
  console.log("  help            Show this help");
  console.log();
}
