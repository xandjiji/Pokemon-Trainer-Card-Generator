import * as dotenv from "dotenv";
import { TwitterApi, ETwitterStreamEvent } from "twitter-api-v2";

dotenv.config();
const client = new TwitterApi(process.env.BEARER_TOKEN as string);

const rules = await client.v2.streamRules();

if (rules.data?.length) {
  await client.v2.updateStreamRules({
    delete: { ids: rules.data.map((rule) => rule.id) },
  });
}

await client.v2.updateStreamRules({
  add: [{ value: "@PokeTrainerCard" }],
});

const stream = await client.v2.searchStream({
  expansions: ["referenced_tweets.id", "author_id"],
});

stream.autoReconnect = true;

stream.on(ETwitterStreamEvent.Data, async (tweet) => {
  const isRetweet = !!tweet.data.referenced_tweets?.some(
    (tweet) => tweet.type === "retweeted"
  );

  if (isRetweet) return;

  const [{ username }] = tweet.includes?.users ?? [];
});
