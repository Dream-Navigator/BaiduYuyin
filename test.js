/*
 * A config.json file is needed to run this test.
 * Please make sure the APIKey and SecrectKey are in the config.json.
 */
var fs = require("fs");

var json = JSON.parse(fs.readFileSync("./config.json"));
var BaiduYuyin = require("./index.js");

var apiKey = json.APIKey;
var secrectKey = json.SecrectKey;

var speech = new BaiduYuyin(apiKey, secrectKey, 'vlc', null, false); //Win: vlc, wmplayer MacOS: afplayer
var optt = {
    tex: 'English testing, Hello world',
    lan: 'zh'
}; // Text to speech, language not support English.
var optcn = {
    format: 'pcm',
    lan: 'zh'
};
var opten = {
    format: 'wav',
    lan: 'en'
};

speech.on('ready', () => {
    // Text to speech
    speech.speak("你好世界")
    .then(() => {
        return speech.speak(null, optt);
    })
    .then(() => {
        return speech.speak("测试结束");
    })
    .then(() => {
        return speech.recoginize(fs.readFileSync('./test.pcm'), optcn);
    })
    .then(() => {
        return speech.recoginize(fs.readFileSync('./test_en.wav'), opten);
    });
});
