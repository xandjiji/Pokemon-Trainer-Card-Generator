import * as dotenv from "dotenv";
import { TwitterApi, ETwitterStreamEvent } from "twitter-api-v2";

const BOT_USERNAME = "PokeTrainerCard";

dotenv.config();
const appClient = new TwitterApi(process.env.BEARER_TOKEN as string);
const userClient = new TwitterApi({
  appKey: process.env.API_KEY as string,
  appSecret: process.env.API_KEY_SECRET as string,
  accessToken: process.env.ACCESS_TOKEN as string,
  accessSecret: process.env.ACCESS_TOKEN_SECRET as string,
});

const rules = await appClient.v2.streamRules();

if (rules.data?.length) {
  await appClient.v2.updateStreamRules({
    delete: { ids: rules.data.map((rule) => rule.id) },
  });
}

await appClient.v2.updateStreamRules({
  add: [{ value: `@${BOT_USERNAME}` }],
});

const stream = await appClient.v2.searchStream({
  expansions: ["referenced_tweets.id", "author_id"],
});

stream.autoReconnect = true;

stream.on(ETwitterStreamEvent.Data, async (tweet) => {
  const isRetweet = !!tweet.data.referenced_tweets?.some(
    (tweet) => tweet.type === "retweeted"
  );

  if (isRetweet) return;

  const [{ username }] = tweet.includes?.users ?? [];
  if (username === BOT_USERNAME) return;

  await userClient.v2.reply("pong", tweet.data.id);
});
