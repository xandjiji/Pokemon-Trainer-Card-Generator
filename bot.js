var Twitter     = require('twitter');
var Jimp        = require('jimp');
var fs          = require('fs');
var config      = require('./config');
var utils       = require('./utils');

var client = new Twitter(config);

console.log(utils.timeStamp() + 'bot iniciando...');

// carrega os assets em jimps[]
var jimps = [];
carregaAssets();

// posicoes relativas grid de pokemons
let pokegridW = 28;
let pokegridH = 222;

let offsetW = 84;
let offsetH = 68;

// posicoes relativas grid de insigneas
let horizontal = 52;
let offset = 48;
let regionoffset = 0;

// arrays e contadores
let cooldownList = [];
var failedTweets = {
    queue: []
};
carregaFailedTweets();

let successCount = 0;
let failCount = 0;
let retries = 0;
let cooldownMinutes = 10;

// reseta a lista de cooldown a cada 10 minutos
setInterval(resetCooldown, cooldownMinutes * 1000 * 60);
function resetCooldown() {
    cooldownList = [];
    utils.resetMsg();
}

// retuita periodicamente todos os tuites que falharam (NAO TESTADO)
setInterval(reTweet, 1000 * 60);

console.log(utils.timeStamp() + 'bot pronto!');
// dispara ao capturar alguma mention
client.stream('statuses/filter', {track: '@PokeTrainerCard'},  function(stream) {
    stream.on('data', function(tweet) {
        
        // caso o user nao esteja em cooldown
        if(cooldownList.includes(tweet.user.name) == false) {

            var followcount = tweet.user.followers_count;

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

                // desenhando pokemon1
                data[0].composite(data[1+trainercard.pokemon1], pokegridW, pokegridH);

                // desenhando pokemon2
                data[0].composite(data[1+trainercard.pokemon2], pokegridW + (offsetW), pokegridH);

                // desenhando pokemon3
                data[0].composite(data[1+trainercard.pokemon3], pokegridW + (offsetW*2), pokegridH);

                // desenhando pokemon4
                data[0].composite(data[1+trainercard.pokemon4], pokegridW, pokegridH + (offsetH));

                // desenhando pokemon5
                data[0].composite(data[1+trainercard.pokemon5], pokegridW + (offsetW), pokegridH + (offsetH));

                // desenhando pokemon6
                data[0].composite(data[1+trainercard.pokemon6], pokegridW + (offsetW*2), pokegridH + (offsetH));


                // desenhando treinador
                data[0].composite(data[269+trainercard.trainer], 260, 170);

                // desenhando insigneas
                if(trainercard.region == 'Johto') {
                    regionoffset = 8;
                }
                if(trainercard.region == 'Kanto') {
                    regionoffset = 0;
                }
                for(var i = 0; i < trainercard.badges; i++) {
                    data[0].composite(data[253+i+regionoffset], horizontal + (i*offset), 380);
                }

                // escrevendo no cartao
                Jimp.loadFont('assets/pokedex.fnt').then(font => {

                    // -12
                    let card = data[0];

                    card.print(font, 263, 30,   'IDNo. ' + trainercard.id);
                    card.print(font, 45, 72,    'NAME: ' + trainercard.name);
                    card.print(font, 45, 126,   trainercard.hometown + '  (' + trainercard.region + ')');
                    card.print(font, 45, 158,   'MONEY: $' + trainercard.money);
                    card.print(font, 45, 190,   'POKéDEX: ' + trainercard.pokedex);

                    // salvando cartao
                    card.write('saved/' + trainercard.name + '.png', function() {
                        
                        // resetando data[0]
                        data[0].composite(data[376], 0, 0);

                        // upando cartao
                        var imagem = fs.readFileSync('saved/' + trainercard.name + '.png');

                        client.post('media/upload', {media: imagem}, function(error, imagem, response) {
                            if(!error) {

                                //tuitando
                                var status = utils.makeTweet(tweet, imagem);

                                client.post('statuses/update', status, function(error, tweeted, response) {
                                    if(!error) {
                                        successCount++;
                                        utils.successMsg(tweet, successCount);
                                        cooldownList.push(tweet.user.name);
                                    }
                                    if(error) {
                                        failCount++;
                                        utils.failMsg(tweet, failCount);
                                        console.log(error);
                                        failedTweets.queue.push(status);
                                    }
                                });
                            }
                            if(error) {
                                failCount++;
                                utils.failMsg(tweet, failCount);
                                console.log(error);
                            }
                        });
                    });
                });
            })
        } else {
            // caso o user esteja em cooldown
            utils.cooldownMsg(tweet);
        }
    });
    stream.on('error', function(error) {
        failCount++;
        console.log(error);
    });
});

// carrega os assets
function carregaAssets() {

    console.log(utils.timeStamp() + 'carregando os assets...');

    // carregando cartao
    jimps.push(Jimp.read('assets/card.png'));

    // carregando pokemons
    for(var i = 1; i < 253; i++) {
        jimps.push(Jimp.read('assets/pokemons/pokemon' + (i-1) + '.png'));
    }

    // carregando insigneas (kanto)
    for(var i = 253; i < 261; i++) {
        jimps.push(Jimp.read('assets/badges/kanto/kanto' + (i-253) + '.png'));
    }

    // carregando insigneas (johto)
    for(var i = 261; i < 269; i++) {
        jimps.push(Jimp.read('assets/badges/johto/johto' + (i-253) + '.png'));
    }

    // carregando treinadores
    for(var i = 269; i < 376; i++) {
        jimps.push(Jimp.read('assets/trainers/trainer' + (i-269) + '.png'));
    }

    // salvando template
    jimps.push(Jimp.read('assets/card.png'));
}

// retuita um tuite que falhou que falharam (NAO TESTADO)
function reTweet() {

	if(failedTweets.queue.length != 0) {
		client.post('statuses/update', failedTweets.queue[0], function(error, tweet, response) {
			if(!error) {
				successCount++;
				console.log(utils.timeStamp() + 'tweet antigo feito com sucesso (restam: ' + failedTweets.queue.length + ') (#' + successCount + ')');
                
                // atualiza e salva failedTweets
                failedTweets.queue.shift();
                var failedTweetsStr = JSON.stringify(failedTweets);
                fs.writeFile('failedTweets.json', failedTweetsStr);
            }
            if(error) {
                retries++;
                console.log(error);                
                console.log(utils.timeStamp() + 'tweet antigo falhou (restam: ' + failedTweets.queue.length + ') (#' + retries + ')');
			}
		});
	}
}

function carregaFailedTweets() {

    fs.readFile('failedTweets.json', 'utf8', function (error, jsonString) {
        if(error) {
            fs.writeFile('failedTweets.json', '{"queue":[]}\n');
            console.log(error);
            return console.log(utils.timeStamp() + 'arquivo failedTweets.json criado e inicializado corretamente');            
        }
        if(!error) {
            if(jsonString == ''){
                // inicializa corretamente o arquivo
                fs.writeFile('failedTweets.json', '{"queue":[]}\n');
                console.log(utils.timeStamp() + 'tweets antigos carregados (0)');
            } else {
                failedTweets = JSON.parse(jsonString);
                console.log(utils.timeStamp() + 'tweets antigos carregados (' + failedTweets.queue.length + ')');
            }
        }
    })
}
