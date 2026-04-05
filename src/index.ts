#!/usr/bin/env node
import * as readline from "readline";
import { loadPet, savePet, deleteSave } from "./persistence.js";
import { createPet, applyDecay, feed, play, sleep, rename } from "./pet.js";
import { renderStatus, renderMessage, renderHelp } from "./display.js";

async function promptName(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question("  What will you name your pet? ", answer => {
      rl.close();
      resolve(answer.trim() || "Mochi");
    });
  });
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (command === "help" || !command) {
    renderHelp();
    return;
  }

  if (command === "new") {
    const name = await promptName();
    const pet = createPet(name);
    savePet(pet);
    console.log(`\n  Your egg has appeared. Take good care of ${name}!\n`);
    renderStatus(pet);
    return;
  }

  // All other commands need an existing pet
  const saved = loadPet();
  if (!saved) {
    console.log('\n  No pet found. Run `tama new` to hatch one.\n');
    return;
  }

  const pet = applyDecay(saved);

  switch (command) {
    case "status": {
      renderStatus(pet);
      savePet(pet);
      break;
    }
    case "feed": {
      if (pet.dead) { renderStatus(pet); savePet(pet); break; }
      const { pet: fed, message } = feed(pet);
      renderStatus(fed);
      renderMessage(message);
      savePet(fed);
      break;
    }
    case "play": {
      if (pet.dead) { renderStatus(pet); savePet(pet); break; }
      const { pet: played, message } = play(pet);
      renderStatus(played);
      renderMessage(message);
      savePet(played);
      break;
    }
    case "sleep": {
      if (pet.dead) { renderStatus(pet); savePet(pet); break; }
      const { pet: rested, message } = sleep(pet);
      renderStatus(rested);
      renderMessage(message);
      savePet(rested);
      break;
    }
    case "rename": {
      const newName = args[0];
      if (!newName) { console.log("\n  Usage: tama rename <name>\n"); break; }
      const { pet: renamed, message } = rename(pet, newName);
      renderStatus(renamed);
      renderMessage(message);
      savePet(renamed);
      break;
    }
    default: {
      console.log(`\n  Unknown command: ${command}`);
      renderHelp();
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
