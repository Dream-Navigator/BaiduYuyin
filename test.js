/*
 * A config.json file is needed to run this test.
 * Please make sure the APIKey and SecrectKey are in the config.json.
 */
var fs = require("fs");

var json = JSON.parse(fs.readFileSync("./config.json"));
var BaiduYuyin = require("./index.js");

var apiKey = json.APIKey;
var secrectKey = json.SecrectKey;

var speech = new BaiduYuyin(apiKey, secrectKey, 'afplay', null, true);

speech.on('ready', token => {

  // var now = new Date();
  // var time = now.getHours()+"点"+now.getMinutes()+"分"
  // let hour = now.getHours()
  // let daytime = ''
  //
  // if(hour < 12 && hour >= 9){
  //   daytime = '上午'
  // }
  // else if (hour < 9 && hour >= 0) {
  //   daytime = '早晨'
  // }
  // else if (hour < 19 && hour >= 12) {
  //   daytime = '下午'
  // }
  // else if (hour < 24 && hour >= 19) {
  //   daytime = '晚上'
  // }
  //
  // speech.speak(`${daytime}好,现在时间是${daytime}${time}`)
  //
  if (!token) {
    console.log('Token:' + token);
    return;
  }

  //speech.speak('你好，欢迎测试百度语音')
  //  .then(() => {
  //    return speech.speak();
  //  })
  //  .then(() => {
  //    return speech.speak('测试完毕');
  //  })

  let audio = fs.readFileSync('./test.pcm')
  speech.recoginize(audio);


});