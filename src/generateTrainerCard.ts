import jimp from "jimp";
import { COUNT, generateTrainerData, Region } from "./generateTrainerData";

const ASSETS_DIR = "assets";

const loadAll = (resolver: (idx: number) => string, length: number) =>
  Promise.all(Array.from({ length }, (_, idx) => jimp.read(resolver(idx))));

const assetLoader = async () => {
  console.log("loading assets...");
  const [pokemons, kantoBadges, johtoBadges, trainers, font] =
    await Promise.all([
      loadAll((idx) => `${ASSETS_DIR}/pokemons/${idx}.png`, COUNT.pokemons),
      loadAll((idx) => `${ASSETS_DIR}/badges/kanto/${idx}.png`, COUNT.badges),
      loadAll((idx) => `${ASSETS_DIR}/badges/johto/${idx}.png`, COUNT.badges),
      loadAll((idx) => `${ASSETS_DIR}/trainers/${idx}.png`, COUNT.trainers),
      jimp.loadFont(`${ASSETS_DIR}/pokedex.fnt`),
    ]);

  const badges = [...kantoBadges, ...johtoBadges];

  return {
    pokemon: (idx: number) => pokemons[idx],
    badge: (idx: number, region: Region) =>
      badges[idx + (region === "Kanto" ? 0 : 8)],
    trainer: (idx: number) => trainers[idx],
    font,
  };
};

const getAsset = await assetLoader();
const { font } = getAsset;

export const generateTrainerCard = async (username: string) => {
  const trainerData = generateTrainerData(username);

  const img = await jimp.read(`${ASSETS_DIR}/card.png`);

  trainerData.pokemons.forEach((pokemonId, idx) => {
    img.composite(
      getAsset.pokemon(pokemonId),
      28 + 84 * (idx % 3),
      222 + (idx > 2 ? 68 : 0)
    );
  });

  img.composite(getAsset.trainer(trainerData.trainer), 260, 170);

  Array.from({ length: trainerData.badges }, (_, badgeIdx) => {
    img.composite(
      getAsset.badge(badgeIdx, trainerData.region),
      52 + 48 * badgeIdx,
      380
    );
  });

  img.print(font, 263, 30, `IDNo. ${trainerData.id}`);
  img.print(font, 45, 72, `NAME: ${trainerData.name}`);
  img.print(font, 45, 126, `${trainerData.hometown} (${trainerData.region})`);
  img.print(font, 45, 158, `MONEY: $${trainerData.money}`);
  img.print(font, 45, 190, `POKéDEX: ${trainerData.pokedex}`);

  const filePath = `saved/${trainerData.name}.png`;
  await img.writeAsync(filePath);
  return filePath;
};
