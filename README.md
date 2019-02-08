# pokehash-twitter-bot

This is the Twitter bot version of the pokehash trainer card generator. If you are looking for the web application:
https://github.com/xandjiji/pokehash

![example](https://i.imgur.com/hqBMUAG.png)

### Installation

  - You need [Node.js](https://nodejs.org/) to run this bot
  - You need the [twitter](https://www.npmjs.com/package/twitter) package to communicate with the Twitter API
  - You need the [jimp](https://www.npmjs.com/package/jimp) package to create the trainer card images

Install the dependencies with:

```
npm install twitter
npm install jimp
```

Feed your Twitter API keys in the ```config.js``` file:

```javascript
module.exports = {
     consumer_key:            '...',
     consumer_secret:         '...',
     access_token_key:        '...',
     access_token_secret:     '...'
}
```

Simply run it with:

```
node bot.js
```
