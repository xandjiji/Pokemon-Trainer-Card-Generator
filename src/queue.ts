import fs from "fs/promises";
import { broadcast } from "./logger";

const COOLDOWN_TIME = 1000 * 60 * 10;
const cooldownList: Set<string> = new Set([]);

export const cooldown = {
  list: cooldownList,
  add: (username: string) => {
    cooldownList.add(username);

    setTimeout(() => cooldownList.delete(username), COOLDOWN_TIME);
  },
  checkUser: (username: string) => {
    const isOnCooldown = cooldownList.has(username);

    if (isOnCooldown) broadcast(`@${username} is on cooldown`, "neutral");

    return isOnCooldown;
  },
};
