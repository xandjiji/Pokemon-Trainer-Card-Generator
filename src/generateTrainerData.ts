import { createHash } from "crypto";

const REGIONS = ["Kanto", "Johto"];

const CITIES = [
  "Celadon City",
  "Azalea Town",
  "Cerulean City",
  "Blackthorn City",
  "Cinnabar Island",
  "Cherrygrove City",
  "Fuchsia City",
  "Cianwood City",
  "Lavender Town",
  "Ecruteak City",
  "Pallet Town",
  "Goldenrod City",
  "Pewter City",
  "Mahogany Town",
  "Saffron City",
  "New Bark Town",
  "Vermilion City",
  "Olivine City",
  "Viridian City",
  "Violet City",
];

const sha256 = (input: string) =>
  createHash("sha-256").update(input).digest("hex");

const parseHex = (hex: string) => parseInt("0x" + hex);

export const generateTrainerData = (username: string) => {
  const hash = sha256(username);

  return {
    name: username,
    region: REGIONS[parseHex(hash.substring(0, 4)) % 2],
    hometown: CITIES[parseHex(hash.substring(0, 4)) % 20],
    money: parseHex(hash.substring(5, 9)),
    pokedex: (parseHex(hash.substring(10, 14)) % 246) + 6,
    badges: parseHex(hash.substring(15, 19)) % 9,
    trainer: parseHex(hash.substring(20, 24)) % 107,
    pokemon1: parseHex(hash.substring(25, 29)) % 252,
    pokemon2: parseHex(hash.substring(30, 34)) % 252,
    pokemon3: parseHex(hash.substring(35, 39)) % 252,
    pokemon4: parseHex(hash.substring(40, 44)) % 252,
    pokemon5: parseHex(hash.substring(45, 49)) % 252,
    pokemon6: parseHex(hash.substring(50, 54)) % 252,
    id: parseHex(hash.substring(55, 59)),
  };
};
