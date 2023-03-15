import { ETwitterStreamEvent } from "twitter-api-v2";
import { client } from "./client";

const BOT_USERNAME = "PokeTrainerCard";

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

stream.on(ETwitterStreamEvent.Data, async (tweet) => {
  const isRetweet = !!tweet.data.referenced_tweets?.some(
    (tweet) => tweet.type === "retweeted"
  );

  if (isRetweet) return;

  const [{ username }] = tweet.includes?.users ?? [];
  if (username === BOT_USERNAME) return;

  await client.user.v2.reply("pong", tweet.data.id);
});
