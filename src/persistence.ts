import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { PetState } from "./pet.js";

const SAVE_DIR  = join(homedir(), ".tamagotchi");
const SAVE_FILE = join(SAVE_DIR, "save.json");

export function loadPet(): PetState | null {
  if (!existsSync(SAVE_FILE)) return null;
  try {
    const raw = readFileSync(SAVE_FILE, "utf-8");
    return JSON.parse(raw) as PetState;
  } catch {
    return null;
  }
}

export function savePet(pet: PetState): void {
  mkdirSync(SAVE_DIR, { recursive: true });
  writeFileSync(SAVE_FILE, JSON.stringify(pet, null, 2), "utf-8");
}

export function deleteSave(): void {
  if (existsSync(SAVE_FILE)) {
    writeFileSync(SAVE_FILE, "", "utf-8");
  }
}
