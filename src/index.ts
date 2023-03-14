import * as dotenv from "dotenv";
import { TwitterApi, ETwitterStreamEvent } from "twitter-api-v2";

dotenv.config();

/* const client = new TwitterApi({
  appKey: process.env.API_KEY as string,
  appSecret: process.env.API_KEY_SECRET as string,
  accessToken: process.env.ACCESS_TOKEN as string,
  accessSecret: process.env.ACCESS_TOKEN_SECRET as string,
}); */

const client = new TwitterApi(process.env.BEARER_TOKEN as string);

const rules = await client.v2.streamRules();

if (rules.data?.length) {
  console.log(rules.data?.length);
  await client.v2.updateStreamRules({
    delete: { ids: rules.data.map((rule) => rule.id) },
  });
}

await client.v2.updateStreamRules({
  add: [{ value: "@PokeTrainerCard" }],
});

const stream = await client.v2.searchStream({
  "user.fields": ["username"],
  "tweet.fields": ["referenced_tweets", "author_id"],
  expansions: ["referenced_tweets.id"],
});

stream.autoReconnect = true;

stream.on(ETwitterStreamEvent.Data, async (tweet) => {
  const isRetweet = !!tweet.data.referenced_tweets?.some(
    (tweet) => tweet.type === "retweeted"
  );

  if (isRetweet) return;

  console.log(tweet.data);

  await client.v2.reply("Pong", tweet.data.id);
});
