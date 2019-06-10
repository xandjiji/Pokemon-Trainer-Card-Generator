var logging = {}

logging.colors = {
    reset:      '\x1b[0m',
    red:        '\x1b[31m',
    green:      '\x1b[32m',
    yellow:     '\x1b[33m',
    blue:       '\x1b[34m',
    magenta:    '\x1b[35m',
    cian:       '\x1b[36m',
    gray:       '\x1b[90m'
}

logging.numberFormat = function numberFormat(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

logging.timeStamp = function timeStamp() {
    let time = new Date().toLocaleTimeString('en-US', {hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric'});
    return `[${time}] `;
}

logging.startupMsg = function startupMsg() {
    
    let msg =
        `${logging.colors.magenta}${logging.timeStamp()}` +
        `${logging.colors.reset}bot is starting...${logging.colors.reset}`;

    return console.log(msg);
}

logging.loadingAssetsMsg = function loadingAssetsMsg() {
    
    let msg =
        `${logging.colors.magenta}${logging.timeStamp()}` +
        `${logging.colors.reset}loading assets...${logging.colors.reset}`;

    return console.log(msg);
}

logging.initializedFileMsg = function initializedFileMsg() {
    
    let msg =
        `${logging.colors.magenta}${logging.timeStamp()}` +
        `${logging.colors.reset}the ${logging.colors.magenta}failedTweets.json${logging.colors.reset} file was created and initialized correctly!${logging.colors.reset}`;

    return console.log(msg);
}

logging.zeroTweetsLoadedMsg = function zeroTweetsLoaded() {
    
    let msg =
        `${logging.colors.magenta}${logging.timeStamp()}` +
        `${logging.colors.reset}the tweet queue was loaded from the ${logging.colors.magenta}failedTweets.json${logging.colors.reset} file. ${logging.colors.magenta}[0]${logging.colors.reset}`;

    return console.log(msg);
}

logging.tweetsLoadedMsg = function zeroTweetsLoaded(size) {
    
    let msg =
        `${logging.colors.magenta}${logging.timeStamp()}` +
        `${logging.colors.reset}the tweet queue was loaded from the ${logging.colors.magenta}failedTweets.json${logging.colors.reset} file. ${logging.colors.magenta}[${size}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.readyMsg = function readyMsg() {
    
    let msg =
        `${logging.colors.magenta}${logging.timeStamp()}` +
        `${logging.colors.reset}bot is ready!${logging.colors.reset}`;

    return console.log(msg);
}

logging.errorMsg = function errorMsg(error) {

    let msg =
        `${logging.colors.red}${logging.timeStamp()}${logging.colors.reset}` +
        `┕> ${error[0].message}`;

    return console.log(msg);
}

logging.successMsg = function successMsg(tweet, successCount) {
    
    let msg =
        `${logging.colors.green}${logging.timeStamp()}` +
        `${logging.colors.cian}@${tweet.user.screen_name}${logging.colors.reset} was successful. ` +
        `${logging.colors.yellow}[${logging.numberFormat(tweet.user.followers_count)} followers]` +
        `${logging.colors.gray}[#${successCount}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.failMsg = function failMsg(tweet, failCount) {
    
    let msg =
        `${logging.colors.red}${logging.timeStamp()}` +
        `${logging.colors.cian}@${tweet.user.screen_name}${logging.colors.reset} has failed. ` +
        `${logging.colors.yellow}[${logging.numberFormat(tweet.user.followers_count)} followers]` +
        `${logging.colors.gray}[#${failCount}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.oldSuccessMsg = function oldSuccessMsg(queueSize, successCount) {
    
    let msg =
        `${logging.colors.green}${logging.timeStamp()}` +
        `${logging.colors.reset}a tweet from the ${logging.colors.magenta}failedTweets.json${logging.colors.reset} file was successful. ` +
        `${logging.colors.magenta}[${queueSize} left]` +
        `${logging.colors.gray}[#${successCount}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.oldFailMsg = function oldFailMsg(queueSize, retries) {
    
    let msg =
        `${logging.colors.red}${logging.timeStamp()}` +
        `${logging.colors.reset}a tweet from the ${logging.colors.magenta}failedTweets.json${logging.colors.reset} file has failed. ` +
        `${logging.colors.magenta}[${queueSize} left]` +
        `${logging.colors.gray}[#${retries}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.cooldownMsg = function cooldownMsg(tweet) {

    let msg =
        `${logging.colors.gray}${logging.timeStamp()}` +
        `${logging.colors.cian}@${tweet.user.screen_name}${logging.colors.reset} is on cooldown!${logging.colors.reset}`;

    return console.log(msg);
}

logging.resetMsg = function resetMsg() {

    let msg =
        `${logging.colors.gray}${logging.timeStamp()}${logging.colors.reset}` +
        `the cooldown list was reset.${logging.colors.reset}`;

    return console.log(msg);    
}

module.exports = logging;
