Baidu Yuyin API
-----------------------
[![npm version](https://badge.fury.io/js/baidu-yuyin-api.svg)](https://badge.fury.io/js/baidu-yuyin-api)

This is a forked repo of [baidu_yuyin](https://github.com/aokihu/BaiduYuyin). Currently under development, use with caution.
The original README is [here](https://github.com/Dream-Navigator/BaiduYuyin/blob/master/DEPRECATE-README.md)(in Chinese).

Usage
-------
### Installation

`npm install baidu_yuyin`

### Examples
```javascript
var BaiduYuyin = require("BaiduYuyin");

var speech = new BaiduYuyin(apiKey, secretKey,'afplayer', '/tmp');
var optt = {tex: 'English testing, Hello world', lan: 'zh'}; // Text to speech, language not support English.
var optcn = {lan: 'zh'};
var opten = {format: 'wav', lan: 'en'};

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

```


Change Logs
-----------

Update 0.1.6 [2016-11-29]
* Update README
* Update test sample
* Text to speech not support English output

Update 0.1.4 [2016-11-29]
* Supporting speech recoginization
* Using `NODE_DEBUG=request node test.js` to test HTTP request

Update 0.1.3 [2016-11-28]
* Using Linux file system
* Support wmplayer and vlc player on Windows platform

Update 0.1.2 [2016-11-27]
* Rewrite code style
* Fix minor issues

