Baidu Yuyin API
-----------------------
[![npm version](https://badge.fury.io/js/baidu-yuyin-api.svg)](https://badge.fury.io/js/baidu-yuyin-api)
[![Dependency Status](https://img.shields.io/david/request/request.svg?style=flat-square)](https://david-dm.org/request/request)

~~This is a forked repo of [baidu_yuyin](https://github.com/aokihu/BaiduYuyin). Currently under development, use with caution.
The original README is [here](https://github.com/Dream-Navigator/BaiduYuyin/blob/master/DEPRECATE-README.md)(in Chinese).~~

[![NPM](https://nodei.co/npm/baidu-yuyin-api.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/baidu-yuyin-api/)

Usage
-------

**Need Nodejs v6 above to run this module.**

### Installation

```bash
npm install baidu-yuyin-api
```

### Examples
```javascript
var BaiduYuyin = require("baidu-yuyin-api");

// Init Baidu Yuyin API.
// Make sure the apiKey and secretKey are set.
// afplay is default player for Mac OS.
// For windows, can use vlc or wmplayer instead.
var speech = new BaiduYuyin(apiKey, secretKey, 'afplay', null, false); 

// Options
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
        return speech.recognize(fs.readFileSync('./test.pcm'), optcn);
    })
    .then(() => {
        return speech.recognize(fs.readFileSync('./test_en.wav'), opten);
    });
});

```

### Test

Clone the repo to local, and run `npm install && npm test`.

Change Logs
-----------

Update 0.1.9 [2016-12-02]
* Fix the auto renew session token

Update 0.1.8 [2016-12-01]
* Make sure only renew session file when necessary
* Minor fixes on README
* Correct miss spelling words

Update 0.1.7 [2016-11-30]
* Fix the samples in README
* Add test API key in config.json
* Auto renew session token if it expired (30 days)

Update 0.1.6 [2016-11-29]
* Update README
* Update test samples
* Text to speech not support English output

Update 0.1.4 [2016-11-29]
* Supporting speech recognition
* Using `NODE_DEBUG=request node test.js` to test HTTP request

Update 0.1.3 [2016-11-28]
* Using Linux file system
* Support wmplayer and vlc player on Windows platform

Update 0.1.2 [2016-11-27]
* Rewrite code style
* Fix minor issues

