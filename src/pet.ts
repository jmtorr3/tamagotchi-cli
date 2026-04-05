import type { LifeStage } from "./sprites.js";

export interface PetState {
  name: string;
  hunger: number;      // 0–100, lower = more hungry
  happiness: number;   // 0–100
  energy: number;      // 0–100
  health: number;      // 0–100
  age: number;         // in minutes of real time
  lastSaved: number;   // Date.now() timestamp
  stage: LifeStage;
  dead: boolean;
}

const DECAY = {
  hunger: 0.5,      // per minute
  happiness: 0.4,
  energy: 0.3,
};

const AGE_THRESHOLDS: Record<number, LifeStage> = {
  0: "egg",
  5: "baby",
  30: "child",
  120: "adult",
  480: "elder",
};

export function createPet(name: string): PetState {
  return {
    name,
    hunger: 80,
    happiness: 80,
    energy: 80,
    health: 100,
    age: 0,
    lastSaved: Date.now(),
    stage: "egg",
    dead: false,
  };
}

export function applyDecay(pet: PetState): PetState {
  const now = Date.now();
  const elapsedMinutes = (now - pet.lastSaved) / 1000 / 60;

  let { hunger, happiness, energy, health, age } = pet;

  hunger    = clamp(hunger    - elapsedMinutes * DECAY.hunger,    0, 100);
  happiness = clamp(happiness - elapsedMinutes * DECAY.happiness, 0, 100);
  energy    = clamp(energy    - elapsedMinutes * DECAY.energy,    0, 100);
  age       = age + elapsedMinutes;

  // Health degrades when critical stats hit zero
  if (hunger === 0 || happiness === 0) {
    health = clamp(health - elapsedMinutes * 1.5, 0, 100);
  }

  const stage = resolveStage(age, health);
  const dead = health <= 0;

  return { ...pet, hunger, happiness, energy, health, age, stage, dead, lastSaved: now };
}

export function feed(pet: PetState): { pet: PetState; message: string } {
  if (pet.dead) return { pet, message: "..." };
  const hunger = clamp(pet.hunger + 30, 0, 100);
  return { pet: { ...pet, hunger }, message: `${pet.name} happily eats. Hunger restored.` };
}

export function play(pet: PetState): { pet: PetState; message: string } {
  if (pet.dead) return { pet, message: "..." };
  if (pet.energy < 10) return { pet, message: `${pet.name} is too tired to play.` };
  const happiness = clamp(pet.happiness + 25, 0, 100);
  const energy    = clamp(pet.energy    - 15, 0, 100);
  return { pet: { ...pet, happiness, energy }, message: `You play with ${pet.name}. +25 happiness, -15 energy.` };
}

export function sleep(pet: PetState): { pet: PetState; message: string } {
  if (pet.dead) return { pet, message: "..." };
  const energy = clamp(pet.energy + 40, 0, 100);
  return { pet: { ...pet, energy }, message: `${pet.name} takes a nap. Energy restored.` };
}

export function rename(pet: PetState, newName: string): { pet: PetState; message: string } {
  return { pet: { ...pet, name: newName }, message: `Your pet is now named ${newName}.` };
}

function resolveStage(age: number, health: number): LifeStage {
  if (health <= 0) return "dead";
  const thresholds = Object.entries(AGE_THRESHOLDS)
    .map(([t, s]) => ({ t: Number(t), s }))
    .sort((a, b) => b.t - a.t);
  for (const { t, s } of thresholds) {
    if (age >= t) return s;
  }
  return "egg";
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}
