var logging = {}

logging.colors = {
    reset:      '\x1b[0m',  // white
    fail:       '\x1b[31m', // red
    success:    '\x1b[32m', // green
    followers:  '\x1b[33m', // yellow
    system:     '\x1b[35m', // magenta
    screenName: '\x1b[36m', // cian
    control:    '\x1b[90m'  // gray
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
        `${logging.colors.system}${logging.timeStamp()}` +
        `${logging.colors.reset}bot is starting...${logging.colors.reset}`;

    return console.log(msg);
}

logging.loadingAssetsMsg = function loadingAssetsMsg() {
    
    let msg =
        `${logging.colors.system}${logging.timeStamp()}` +
        `${logging.colors.reset}loading assets...${logging.colors.reset}`;

    return console.log(msg);
}

logging.initializedFileMsg = function initializedFileMsg() {
    
    let msg =
        `${logging.colors.system}${logging.timeStamp()}` +
        `${logging.colors.reset}the ${logging.colors.system}failedTweets.json${logging.colors.reset} file was created and initialized correctly!${logging.colors.reset}`;

    return console.log(msg);
}

logging.zeroTweetsLoadedMsg = function zeroTweetsLoaded() {
    
    let msg =
        `${logging.colors.system}${logging.timeStamp()}` +
        `${logging.colors.reset}the tweet queue was loaded from the ${logging.colors.system}failedTweets.json${logging.colors.reset} file. ${logging.colors.system}[0]${logging.colors.reset}`;

    return console.log(msg);
}

logging.tweetsLoadedMsg = function zeroTweetsLoaded(size) {
    
    let msg =
        `${logging.colors.system}${logging.timeStamp()}` +
        `${logging.colors.reset}the tweet queue was loaded from the ${logging.colors.system}failedTweets.json${logging.colors.reset} file. ${logging.colors.system}[${size}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.readyMsg = function readyMsg() {
    
    let msg =
        `${logging.colors.system}${logging.timeStamp()}` +
        `${logging.colors.reset}bot is ready!${logging.colors.reset}`;

    return console.log(msg);
}

logging.errorMsg = function errorMsg(error) {

    let msg =
        `${logging.colors.fail}${logging.timeStamp()}${logging.colors.reset} [${error[0].code}]`;

    return console.log(msg);
}

logging.successMsg = function successMsg(tweet, successCount) {
    
    let msg =
        `${logging.colors.success}${logging.timeStamp()}` +
        `${logging.colors.screenName}@${tweet.user.screen_name}${logging.colors.reset} was successful. ` +
        `${logging.colors.followers}[${logging.numberFormat(tweet.user.followers_count)} followers]` +
        `${logging.colors.control}[#${successCount}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.failMsg = function failMsg(tweet, failCount, error) {
    
    let msg =
        `${logging.colors.fail}${logging.timeStamp()}` +
        `${logging.colors.screenName}@${tweet.user.screen_name}${logging.colors.reset} has failed. ` +
        `${logging.colors.followers}[${logging.numberFormat(tweet.user.followers_count)} followers]` +
        `${logging.colors.control}[#${failCount}]${logging.colors.reset}` +
        `[${error[0].code}]`;

    return console.log(msg);
}

logging.oldSuccessMsg = function oldSuccessMsg(queueSize, successCount) {
    
    let msg =
        `${logging.colors.success}${logging.timeStamp()}` +
        `${logging.colors.reset}a tweet from the ${logging.colors.system}failedTweets.json${logging.colors.reset} file was successful. ` +
        `${logging.colors.system}[${queueSize} left]` +
        `${logging.colors.control}[#${successCount}]${logging.colors.reset}`;

    return console.log(msg);
}

logging.oldFailMsg = function oldFailMsg(queueSize, retries, error) {
    
    let msg =
        `${logging.colors.fail}${logging.timeStamp()}` +
        `${logging.colors.reset}a tweet from the ${logging.colors.system}failedTweets.json${logging.colors.reset} file has failed. ` +
        `${logging.colors.system}[${queueSize} left]` +
        `${logging.colors.control}[#${retries}]${logging.colors.reset}` +
        `[${error[0].code}]`;

    return console.log(msg);
}

logging.cooldownMsg = function cooldownMsg(tweet) {

    let msg =
        `${logging.colors.control}${logging.timeStamp()}` +
        `${logging.colors.screenName}@${tweet.user.screen_name}${logging.colors.reset} is on cooldown!${logging.colors.reset}`;

    return console.log(msg);
}

logging.resetMsg = function resetMsg() {

    let msg =
        `${logging.colors.control}${logging.timeStamp()}${logging.colors.reset}` +
        `the cooldown list was reset.${logging.colors.reset}`;

    return console.log(msg);    
}

module.exports = logging;
