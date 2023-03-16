import * as dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import fs from "fs/promises";
import { generateTrainerCard } from "./generateTrainerCard";
import { TweetData } from "./queue";

dotenv.config();

export const BOT_USERNAME = "PokeTrainerCard";

const client = {
  app: new TwitterApi(process.env.BEARER_TOKEN as string),
  user: new TwitterApi({
    appKey: process.env.API_KEY as string,
    appSecret: process.env.API_KEY_SECRET as string,
    accessToken: process.env.ACCESS_TOKEN as string,
    accessSecret: process.env.ACCESS_TOKEN_SECRET as string,
  }),
};

export const replyWithTrainerCard = async ({
  tweetId,
  username,
}: TweetData) => {
  const filePath = await generateTrainerCard(username);
  const mediaId = await client.user.v1.uploadMedia(filePath);

  await client.user.v2.reply("", tweetId, {
    media: { media_ids: [mediaId] },
  });

  await fs.unlink(filePath);
};

export const startStream = async () => {
  const rules = await client.app.v2.streamRules();

  if (rules.data?.length) {
    await client.app.v2.updateStreamRules({
      delete: { ids: rules.data.map((rule) => rule.id) },
    });
  }

  await client.app.v2.updateStreamRules({
    add: [{ value: `@${BOT_USERNAME}` }],
  });

  const stream = await client.app.v2.searchStream({
    expansions: ["referenced_tweets.id", "author_id"],
  });

  stream.autoReconnect = true;

  return stream;
};
