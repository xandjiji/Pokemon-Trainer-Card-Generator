var utils = {}

/* arrays de cidade/regiao/emoji */

utils.regions = [
	'Kanto',
	'Johto'];

utils.cities = [
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

utils.emojis = [
    ':-)',
    '>:-)',
    '<3',
    ';-)',
    ':-D',
    ':-*',
    ':-O',
    ':-v',
    'c-:',
    '~(^_^)~',
    '(n_n)',
    ':-P',
    ':^)'];

/* funcoes de console.log() */

utils.timeStamp = function timeStamp() {
    var time = new Date().toLocaleTimeString('en-US', {hour12: false, hour: "numeric", minute: "numeric", second: "numeric"});
    return '[' + time + '] ';
}

utils.successMsg = function successMsg(tweet, successCount) {
    
    var msg =   utils.timeStamp() +
                '@' + tweet.user.screen_name + ' finalizado ' +
                '(' + tweet.user.followers_count + ' seguidores) ' + 
                '(#' + successCount + ')';

    return console.log(msg);
}

utils.failMsg = function failMsg(tweet, failCount) {
    
    var msg =   utils.timeStamp() +
                '@' + tweet.user.screen_name + ' falhou ' +
                '(' + tweet.user.followers_count + ' seguidores) ' +
                '(#' + failCount + ')';

    return console.log(msg);
}

utils.cooldownMsg = function cooldownMsg(tweet) {

    var msg =   '-> ' + utils.timeStamp() +
                '@' + tweet.user.screen_name + ' bloqueado pelo cooldown';

    return console.log(msg);
}

utils.resetMsg = function resetMsg() {

    var msg =   utils.timeStamp() +
                'lista de cooldown resetada';

    return console.log(msg);    
}

/* funcoes de montar tuite e trainercard */

utils.makeTrainercard = function makeTrainercard(screen_name) {

    var hash = utils.sha256(screen_name);

    var trainercard = {
        name:       screen_name,
        region:     utils.regions[  (parseInt('0x' + hash.substring(0, 4)) % 2)],
        hometown:   utils.cities[   (parseInt('0x' + hash.substring(0, 4)) % 20)],
        money:                      (parseInt('0x' + hash.substring(5, 9))),
        pokedex:                    (parseInt('0x' + hash.substring(10, 14)) % 252),
        badges:                     (parseInt('0x' + hash.substring(15, 19)) % 9),
        trainer:                    (parseInt('0x' + hash.substring(20, 24)) % 107),
        pokemon1:                   (parseInt('0x' + hash.substring(25, 29)) % 252),
        pokemon2:                   (parseInt('0x' + hash.substring(30, 34)) % 252),
        pokemon3:                   (parseInt('0x' + hash.substring(35, 39)) % 252),
        pokemon4:                   (parseInt('0x' + hash.substring(40, 44)) % 252),
        pokemon5:                   (parseInt('0x' + hash.substring(45, 49)) % 252),
        pokemon6:                   (parseInt('0x' + hash.substring(50, 54)) % 252),
        id:                         (parseInt('0x' + hash.substring(55, 59))) 
    };

    return trainercard;
}

utils.makeTweet = function makeTweet(tweet, imagem) {

    var composedTweet = {
        status: '@' + tweet.user.screen_name + ' here you go, ' + tweet.user.name + '!',
        in_reply_to_status_id: tweet.id_str,
        media_ids: imagem.media_id_string
    };

    return composedTweet;

}

/* implementacao de sha256 */

utils.sha256 = function sha256(ascii) {
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
}

module.exports = utils;
