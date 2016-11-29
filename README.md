This is a forked repo of [baidu_yuyin](https://github.com/aokihu/BaiduYuyin). Currently under development, use with caution.

Update 0.1.4 [2016-11-29]
* Supporting speech recoginization
* Using `NODE_DEBUG=request node test.js` to test HTTP request

Update 0.1.3 [2016-11-28]
* Using Linux file system
* Support wmplayer and vlc player on Windows platform

Update 0.1.2 [2016-11-27]
* Rewrite code style
* Fix minor issues

### 注意
### 因为Player的依赖库对Nodejs 4.0支持不好，请不要随意升级到新版本
## 如果你是Mac用户的话，我已经使用本地播放器来播放语音文件了，不过话说回来，如果是Mac的话本身就有语音库了

Baidu Yuyin 百度语音合成
-----------------------

使用Baidu的在线语音合成服务，需要自己申请API Key，申请网址http://yuyin.baidu.com

更新1.0.7[2016-7-22]
----------------------
1. 更改了播放器的调用方式，不再根据平台自行选择，需要使用者自己来判断使用播放mp3的命令，默认使用afplay
2. Nodejs最低版本为5.0，因为使用了ES6的Class形式，低版本不再支持，我想大家应该已经升级了吧
3. 增加了指定临时下载语音文件保存目录参数，如果不设定的话就保存在当前目录下
4. 更新了依赖项目，去掉了不使用的player库，（这货实在不实用啊）

更新1.0.3[2016-7-21]
----------------------
1. 增加了缓存sessionToken到本地的功能，免得每次都去请求一边，超过24小时重新请求
2. Linux系统使用mplayer命令播放语音文件,请自行安装哦
3. 自动删除下载的mp3文件

更新1.0.2[2015-9-19]
----------------------
1. 使用绝对地址保存零时语音文件

更新1.0.1[2015-9-18]
----------------------
1. Mac用户现在使用本地播放器来播放语音文件


使用方法
-------
### 安装

`npm install baidu_yuyin`

### 使用
```javascript
var BDSpeech = require("BDSpeech");

var speech = new BDSpeech(apiKey, secretKey,'mplayer', '/tmp')

speech.on('ready', () => {
  speech.speak("你好世界")
})

```
