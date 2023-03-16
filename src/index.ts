import { ETwitterStreamEvent } from "twitter-api-v2";
import { replyWithTrainerCard, startStream, BOT_USERNAME } from "./twitter";
import { broadcast, coloredText } from "./logger";
import { cooldown, tweetQueue } from "./queue";

let tweetCount = 0;

const stream = await startStream();
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

    const tweetData = { tweetId: tweet.data.id, username };
    await replyWithTrainerCard(tweetData).catch(() =>
      tweetQueue.add(tweetData)
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
