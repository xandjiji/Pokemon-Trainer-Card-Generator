import jimp from "jimp";
import { COUNT, generateTrainerData } from "./generateTrainerData";

const loadAll = (resolver: (idx: number) => string, length: number) =>
  Promise.all(Array.from({ length }, (_, idx) => jimp.read(resolver(idx))));

const assetLoader = async () => {
  console.log("loading assets...");
  const [pokemons, kantoBadges, johtoBadges, trainers] = await Promise.all([
    loadAll((idx) => `assets/pokemons/${idx}.png`, COUNT.pokemons),
    loadAll((idx) => `assets/badges/kanto/${idx}.png`, COUNT.badges),
    loadAll((idx) => `assets/badges/johto/${idx}.png`, COUNT.badges),
    loadAll((idx) => `assets/trainers/${idx}.png`, COUNT.trainers),
  ]);

  const badges = [...kantoBadges, ...johtoBadges];

  return {
    pokemon: (idx: number) => pokemons[idx],
    badge: (idx: number) => badges[idx],
    trainer: (idx: number) => trainers[idx],
  };
};

const getAsset = await assetLoader();

const generateTrainerCard = async (username: string) => {
  const trainerData = generateTrainerData(username);

  console.log("ok!");
  const img = await jimp.read("assets/card.png");

  console.log(trainerData);

  trainerData.pokemons.forEach((pokemonId, idx) => {
    img.composite(
      getAsset.pokemon(pokemonId),
      28 + 84 * (idx % 3),
      222 + (idx > 2 ? 68 : 0)
    );
  });

  img.composite(getAsset.trainer(trainerData.trainer), 260, 170);

  const badgeIdxOffset = trainerData.region === "Kanto" ? 0 : 8;
  Array.from({ length: trainerData.badges }, (_, badgeIdx) => {
    img.composite(
      getAsset.badge(badgeIdxOffset + badgeIdx),
      52 + 48 * badgeIdx,
      380
    );
  });

  await img.writeAsync("saved/card.png");
};

generateTrainerCard("xandxandxand");
