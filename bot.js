var Twitter    = require('twitter');
var Jimp       = require('jimp');
var config     = require('./config');

var client = new Twitter(config);

var arroba = "@PokeTrainerCard";


console.log("bot iniciado!");

// arrays de cidade/regiao
var regions = [
	'Kanto',
	'Johto'];
var cities = [
	'Celadon City',
	'Azalea Town',
	'Cerulean City',
	'Blackthorn City',
	'Cinnabar Island',
	'Cherrygrove City',
	'Fuchsia City',
	'Cianwood City',
	'Lavender Town',
	'Ecruteak City',
	'Pallet Town',
	'Goldenrod City',
	'Pewter City',
	'Mahogany Town',
	'Saffron City',
	'New Bark Town',
	'Vermilion City',
	'Olivine City',
	'Viridian City',
	'Violet City'];

var emojis = [':-)', '>:-)', '<3', ';-)', ':-D', ':-*', ':-O', ':-v', 'c-:', '~(^_^)~', '(n_n)'];


var jimps = [];

// carregando cartao
jimps.push(Jimp.read('assets/card.png'));

// carregando pokemons
for (var i = 1; i < 253; i++){
     jimps.push(Jimp.read('assets/pokemons/pokemon' + (i-1) + '.png'));
}

// carregando insigneas (kanto)
for (var i = 253; i < 261; i++){
     jimps.push(Jimp.read('assets/badges/kanto/kanto' + (i-253) + '.png'));
}

// carregando insigneas (johto)
for (var i = 261; i < 269; i++){
     jimps.push(Jimp.read('assets/badges/johto/johto' + (i-253) + '.png'));
}

// carregando treinadores
for (var i = 269; i < 376; i++){
     jimps.push(Jimp.read('assets/trainers/trainer' + (i-269) + '.png'));
}

// salvando template
jimps.push(Jimp.read('assets/card.png'));

// posicoes relativas grid de pokemons
let pokegridW = 28;
let pokegridH = 222;

let offsetW = 84;
let offsetH = 68;

// posicoes relativas grid de insigneas
let horizontal = 52;
let offset = 48;
let regionoffset = 0;

client.stream('statuses/filter', {track: '@PokeTrainerCard'},  function(stream) {
     stream.on('data', function(tweet) {

		//console.log(tweet);

		var tweetid = tweet.id;
		var tweetidstr = tweet.id_str;
		var tweetername = tweet.user.name;


          var hash = sha256(tweet.user.screen_name);

          var trainercard = [{
          	'id': '',
               'name': '',
          	'region': '',
          	'hometown': '',
          	'money': '',
          	'pokedex': '',
          	'badges': '',
          	'trainer': '',
          	'pokemon1': '',
          	'pokemon2': '',
          	'pokemon3': '',
          	'pokemon4': '',
          	'pokemon5': '',
          	'pokemon6': ''}]

          trainercard.name		= tweet.user.screen_name;
     	trainercard.region		= regions[	(parseInt('0x' + hash.substring(0, 4)) % 2)];
     	trainercard.hometown	= cities[		(parseInt('0x' + hash.substring(0, 4)) % 20)];
     	trainercard.money		= 			(parseInt('0x' + hash.substring(5, 9)));
     	trainercard.pokedex		= 			(parseInt('0x' + hash.substring(10, 14)) % 252);
     	trainercard.badges		= 			(parseInt('0x' + hash.substring(15, 19)) % 9);
     	trainercard.trainer		= 			(parseInt('0x' + hash.substring(20, 24)) % 107);
     	trainercard.pokemon1	= 			(parseInt('0x' + hash.substring(25, 29)) % 252);
     	trainercard.pokemon2	= 			(parseInt('0x' + hash.substring(30, 34)) % 252);
     	trainercard.pokemon3	= 			(parseInt('0x' + hash.substring(35, 39)) % 252);
     	trainercard.pokemon4	= 			(parseInt('0x' + hash.substring(40, 44)) % 252);
     	trainercard.pokemon5	= 			(parseInt('0x' + hash.substring(45, 49)) % 252);
     	trainercard.pokemon6	= 			(parseInt('0x' + hash.substring(50, 54)) % 252);
     	trainercard.id 		= 			(parseInt('0x' + hash.substring(55, 59)));

          Promise.all(jimps).then(function(data) {
               return Promise.all(jimps);
          }).then(function(data) {

               /*
                    card:     0
                    pokemons: 1-252
                    badges:   253-268
                    trainers: 269-375
                    template:    376
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
               if(trainercard.region == 'Johto'){
                    regionoffset = 8;
               }
               if(trainercard.region == 'Kanto'){
                    regionoffset = 0;
               }
               for(var i = 0; i < trainercard.badges; i++){
                    data[0].composite(data[253+i+regionoffset], horizontal + (i*offset), 380);
               }

               // escrevendo
               Jimp.loadFont('assets/pokedex.fnt').then(font => {
                    // -12
                    data[0].print(font, 263, 30, 'IDNo. ' + trainercard.id);
                    data[0].print(font, 45, 72, 'NAME: ' + trainercard.name);
                    data[0].print(font, 45, 126, trainercard.hometown + '  (' + trainercard.region + ')');
                    data[0].print(font, 45, 158, 'MONEY: $' + trainercard.money);
                    data[0].print(font, 45, 190, 'POKéDEX: ' + trainercard.pokedex);

                    data[0].write('saved/' + trainercard.name + '.png', function(){
	                    data[0].composite(data[376], 0, 0);

					var imagem = require('fs').readFileSync('saved/' + trainercard.name + '.png');

			          client.post('media/upload', {media: imagem}, function(error, imagem, response) {

			               if (!error) {
			                    //tuitando
			                    var status = {
							status: '@' + trainercard.name + ' here you go, ' + tweetername + '! ' + emojis[Math.floor((Math.random() * 10))],
							in_reply_to_status_id: tweetidstr,
							//in_reply_to_status_id_str: tweetidstr,
			                    media_ids: imagem.media_id_string
			                    }

			                    client.post('statuses/update', status, function(error, tweet, response) {
			                    if (!error) {

							//console.log('respondido ao ID: ' + tweetid);
							console.log('@' + trainercard.name + ' finalizado');
							} if (error) {
								console.log(error);
								console.log('@' + trainercard.name + ' falhou');
								data[0].composite(data[376], 0, 0);
							}
			                    });

			               }
			          });


				});
               });
          })


          //tuita('@' + tweet.user.screen_name + ' here you go!');
     });

     stream.on('error', function(error) {
          console.log('falhou');
     });
});

var sha256 = function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};

	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length'
	var i, j; // Used as a counter across the whole file
	var result = ''

	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;

	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = sha256.h = sha256.h || [];
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}

	ascii += '\x80' // Append Ƈ' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return; // ASCII check: only accept characters in range 0-255
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)

	// process each chunk
	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
		var oldHash = hash;
		// This is now the undefinedworking hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8);

		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			// Expand the message into 64 words
			// Used below if
			var w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&hash[5])^((~e)&hash[6])) // ch
				+ k[i]
				// Expand the message schedule if needed
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
					)|0
				);
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj

			hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1)|0;
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}


	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}

	return result;
};
