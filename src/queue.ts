import fs from "fs/promises";
import { broadcast } from "./logger";

const TWEET_QUEUE_TIME = 1000 * 60;
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

export type TweetData = {
  tweetId: string;
  username: string;
};

let failedTweets: TweetData[] = await fs
  .readFile("failedTweets.json", "utf-8")
  .then(JSON.parse)
  .catch(() => []);

const saveQueue = () =>
  fs.writeFile("failedTweets.json", JSON.stringify(failedTweets));

export const tweetQueue = {
  TWEET_QUEUE_TIME,
  failedTweets,
  add: async (tweetData: TweetData) => {
    failedTweets.push(tweetData);
    await saveQueue();
    broadcast(`@${tweetData.username} was added to tweet queue`, "fail");
  },
  remove: async (tweetId: TweetData["tweetId"]) => {
    failedTweets = failedTweets.filter(
      (failedTweet) => tweetId !== failedTweet.tweetId
    );
    await saveQueue();
  },
  getFirst: () => failedTweets[0],
};
