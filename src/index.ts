import { ETwitterStreamEvent } from "twitter-api-v2";
import fs from "fs/promises";
import { client } from "./client";
import { generateTrainerCard } from "./generateTrainerCard";
import { broadcast, coloredText } from "./logger";
import { cooldown } from "./queue";

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

broadcast("Streaming tweets...", "highlight");
stream.on(ETwitterStreamEvent.Data, async (tweet) => {
  try {
    const isRetweet = !!tweet.data.referenced_tweets?.some(
      (tweet) => tweet.type === "retweeted"
    );

    if (isRetweet) return;

    const [{ username }] = tweet.includes?.users ?? [];
    if (username === BOT_USERNAME) return;
    if (cooldown.checkUser(username)) return;

    const filePath = await generateTrainerCard(username);
    const mediaId = await client.user.v1.uploadMedia(filePath);

    await client.user.v2.reply("", tweet.data.id, {
      media: { media_ids: [mediaId] },
    });

    await fs.unlink(filePath);

    broadcast(
      `Trainer card delivered to ${coloredText(`@${username}`, "highlight")}`,
      "success"
    );
  } catch (error) {
    broadcast(`Oops! Something went wrong`, "fail");
    console.log(error);
  }
});
