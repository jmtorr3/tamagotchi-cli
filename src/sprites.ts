export type LifeStage = "egg" | "baby" | "child" | "adult" | "elder" | "dead";

export const sprites: Record<LifeStage, string[]> = {
  egg: [
    "  _____  ",
    " /     \\ ",
    "|       |",
    "|       |",
    " \\_____/ ",
  ],
  baby: [
    "  (o_o)  ",
    " /|   |\\ ",
    "  |   |  ",
    "  ^^  ^^ ",
    "         ",
  ],
  child: [
    "  (^.^)  ",
    " /(   )\\ ",
    "  |   |  ",
    " _|   |_ ",
    "         ",
  ],
  adult: [
    "  (^‿^)  ",
    " /[   ]\\ ",
    "  |   |  ",
    " /|   |\\ ",
    "  ^^  ^^ ",
  ],
  elder: [
    "  (~‿~)  ",
    " /[   ]\\ ",
    "  |   |  ",
    " /|   |\\ ",
    "  ~~  ~~ ",
  ],
  dead: [
    "  (x_x)  ",
    " /|   |\\ ",
    "  |   |  ",
    "  ^^  ^^ ",
    "  R.I.P. ",
  ],
};
