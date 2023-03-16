import { ETwitterStreamEvent } from "twitter-api-v2";
import fs from "fs/promises";
import { client } from "./client";
import { generateTrainerCard } from "./generateTrainerCard";
import { broadcast, coloredText } from "./logger";
import { TweetData, cooldown, tweetQueue } from "./queue";

const BOT_USERNAME = "PokeTrainerCard";
let tweetCount = 0;

const replyWithTrainerCard = async ({ tweetId, username }: TweetData) => {
  const filePath = await generateTrainerCard(username);
  const mediaId = await client.user.v1.uploadMedia(filePath);

  await client.user.v2.reply("", tweetId, {
    media: { media_ids: [mediaId] },
  });

  await fs.unlink(filePath);
};

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

    const tweedData = { tweetId: tweet.data.id, username };
    await replyWithTrainerCard(tweedData).catch(() =>
      tweetQueue.add(tweedData)
    );
    cooldown.add(username);

    tweetCount += 1;
    broadcast(
      `Trainer card delivered to ${coloredText(
        `@${username} (${coloredText(tweetCount.toString(), "system")} so far)`,
        "highlight"
      )}`,
      "success"
    );
  } catch (error) {
    broadcast(`Oops! Something went wrong`, "fail");
    console.log(error);
  }
});

setInterval(() => {
  const retryTweet = tweetQueue.getFirst();

  if (!retryTweet) return;

  replyWithTrainerCard(retryTweet)
    .then(async () => {
      broadcast(
        `Trainer card delivered to ${coloredText(
          `@${retryTweet.username}`,
          "highlight"
        )} (${coloredText(
          tweetQueue.failedTweets.length.toString(),
          "system"
        )} left)`,
        "success"
      );

      tweetCount += 1;
      await tweetQueue.remove(retryTweet.tweetId);
    })
    .catch(() => {});
}, tweetQueue.TWEET_QUEUE_TIME);
