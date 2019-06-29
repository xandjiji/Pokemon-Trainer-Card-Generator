var Twitter     = require('twitter');
var Jimp        = require('jimp');
var fs          = require('fs');

var keys        = require('./keys.env');
var utils       = require('./utils');
var logging     = require('./logging');

var client = new Twitter(keys);

logging.startupMsg();

// load assets into jimps[]
var jimps = [];
loadAssets();

// relative positions in the pokemon grid
let pokegridW = 28;
let pokegridH = 222;

let offsetW = 84;
let offsetH = 68;

// relative positions in the badge grid
let horizontal = 52;
let offset = 48;
let regionoffset = 0;

// arrays and counters
let cooldownList = [];
var failedTweets = {
    queue: []
};
loadFailedTweets();

let successCount = 0;
let failCount = 0;
let retries = 0;
let cooldownMinutes = 240;

// reset the cooldown list every 10 minutes
setInterval(resetCooldown, cooldownMinutes * 1000 * 60);
function resetCooldown() {
    cooldownList = [];
    logging.resetMsg();
}

// tweets periodically a tweet that failed before
setInterval(reTweet, 1000 * 30);



// the bot is now ready
logging.readyMsg();

// triggers if  mentioned
client.stream('statuses/filter', {track: '@PokeTrainerCard'},  function(stream) {
    stream.on('data', function(tweet) {
        
        // if the user is not on cooldown
        if(cooldownList.includes(tweet.user.screen_name) == false) {

            var trainercard = utils.makeTrainercard(tweet.user.screen_name);

            Promise.all(jimps).then(function(data) {
                return Promise.all(jimps);
            }).then(function(data) {

                /*
                    card:       0
                    pokemons:   1-252
                    badges:     253-268
                    trainers:   269-375
                    template:   376
                */

                // drawing pokemon1
                data[0].composite(data[1+trainercard.pokemon1], pokegridW, pokegridH);

                // drawing pokemon2
                data[0].composite(data[1+trainercard.pokemon2], pokegridW + (offsetW), pokegridH);

                // drawing pokemon3
                data[0].composite(data[1+trainercard.pokemon3], pokegridW + (offsetW*2), pokegridH);

                // drawing pokemon4
                data[0].composite(data[1+trainercard.pokemon4], pokegridW, pokegridH + (offsetH));

                // drawing pokemon5
                data[0].composite(data[1+trainercard.pokemon5], pokegridW + (offsetW), pokegridH + (offsetH));

                // drawing pokemon6
                data[0].composite(data[1+trainercard.pokemon6], pokegridW + (offsetW*2), pokegridH + (offsetH));


                // drawing trainer
                data[0].composite(data[269+trainercard.trainer], 260, 170);

                // drawing badges
                if(trainercard.region == 'Johto') {
                    regionoffset = 8;
                }
                if(trainercard.region == 'Kanto') {
                    regionoffset = 0;
                }
                for(var i = 0; i < trainercard.badges; i++) {
                    data[0].composite(data[253+i+regionoffset], horizontal + (i*offset), 380);
                }

                // writing on the card
                Jimp.loadFont('assets/pokedex.fnt').then(font => {

                    // -12
                    let card = data[0];

                    card.print(font, 263, 30,   'IDNo. ' + trainercard.id);
                    card.print(font, 45, 72,    'NAME: ' + trainercard.name);
                    card.print(font, 45, 126,   trainercard.hometown + '  (' + trainercard.region + ')');
                    card.print(font, 45, 158,   'MONEY: $' + trainercard.money);
                    card.print(font, 45, 190,   'POKéDEX: ' + trainercard.pokedex);

                    // saving card image
                    card.write('saved/' + trainercard.name + '.png', function() {
                        
                        // reseting data[0]
                        data[0].composite(data[376], 0, 0);

                        // uploading card image
                        var imagem = fs.readFileSync('saved/' + trainercard.name + '.png');

                        client.post('media/upload', {media: imagem}, function(error, imagem, response) {
                            if(!error) {

                                // tweeting
                                var status = utils.makeTweet(tweet, imagem);

                                client.post('statuses/update', status, function(error, tweeted, response) {
                                    if(!error) {
                                        successCount++;
                                        logging.successMsg(tweet, successCount);
                                        cooldownList.push(tweet.user.screen_name);
                                    }
                                    if(error) {
                                        failCount++;
                                        logging.failMsg(tweet, failCount, error);
                                        //logging.errorMsg(error);
                                        cooldownList.push(tweet.user.screen_name);
                                        failedTweets.queue.push(status);
                                    }
                                });
                            }
                            if(error) {
                                failCount++;
                                logging.failMsg(tweet, failCount, error);
                                //logging.errorMsg(error);
                            }
                        });
                    });
                });
            })
        } else {
            // if the user is on cooldown
            logging.cooldownMsg(tweet);
        }
    });
    stream.on('error', function(error) {
        failCount++;
        logging.errorMsg(error);
    });
});

// loading assets
function loadAssets() {

    logging.loadingAssetsMsg();

    // loading the card
    jimps.push(Jimp.read('assets/card.png'));

    // loading pokemons
    for(var i = 1; i < 253; i++) {
        jimps.push(Jimp.read('assets/pokemons/pokemon' + (i-1) + '.png'));
    }

    // loading badges (kanto)
    for(var i = 253; i < 261; i++) {
        jimps.push(Jimp.read('assets/badges/kanto/kanto' + (i-253) + '.png'));
    }

    // loading badges (johto)
    for(var i = 261; i < 269; i++) {
        jimps.push(Jimp.read('assets/badges/johto/johto' + (i-253) + '.png'));
    }

    // loading trainers
    for(var i = 269; i < 376; i++) {
        jimps.push(Jimp.read('assets/trainers/trainer' + (i-269) + '.png'));
    }

    // loading the template again
    jimps.push(Jimp.read('assets/card.png'));
}

// rewteets a tweet that failed previously
function reTweet() {

	if(failedTweets.queue.length != 0) {
		client.post('statuses/update', failedTweets.queue[0], function(error, tweet, response) {
			if(!error) {
                successCount++; 

                // update and save failedTweets.json and cooldownList
                let screen_name = failedTweets.queue[0].status.substring(1, failedTweets.queue[0].status.indexOf(' '));
                cooldownList.push(screen_name);
                
                failedTweets.queue.shift();
                logging.oldSuccessMsg(failedTweets.queue.length, successCount);
                var failedTweetsStr = JSON.stringify(failedTweets);
                fs.writeFile('failedTweets.json', failedTweetsStr, (error) => { if(error){console.log(logging.timeStamp() + ' ' + error)} });
            }
            if(error) {
                if(error[0].code == 385){
                    failedTweets.queue.shift();
                }
                if(error[0].code == 325){
                    failedTweets.queue.shift();
                }
                retries++;
                
                logging.oldFailMsg(failedTweets.queue.length, retries, error);
                //logging.errorMsg(error);
                var failedTweetsStr = JSON.stringify(failedTweets);
                fs.writeFile('failedTweets.json', failedTweetsStr, (error) => { if(error){console.log(logging.timeStamp() + ' ' +  error)} });
			}
		});
	}
}

function loadFailedTweets() {

    fs.readFile('failedTweets.json', 'utf8', function (error, jsonString) {
        if(error) {
            fs.writeFile('failedTweets.json', '{"queue":[]}\n');
            return logging.initializedFileMsg();            
        }
        if(!error) {
            if(jsonString == ''){
                // initializing the failedTweets.json correctly
                fs.writeFile('failedTweets.json', '{"queue":[]}\n');
                logging.zeroTweetsLoadedMsg();
            } else {
                failedTweets = JSON.parse(jsonString);
                logging.tweetsLoadedMsg(failedTweets.queue.length);
            }
        }
    })
}
