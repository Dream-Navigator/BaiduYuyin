/**
 * Baidu Yuyin RESTful API
 *
 * @author aokihu(aokihu@gmail.com)
 * @version 1.0.0
 * @description Need register for API keys from http://yuyin.baidu.com
 *
 */
'use strict';

const eventEmitter = require('events').EventEmitter;
const util   = require('util');
const querystring = require('querystring');
const request = require('request');
const md5 = require('md5');
const fs = require('fs');
const childProcess = require('child_process');

class BaiduYuyin extends eventEmitter{
  /*
   * Constructor
   * @method constructor
   * @param  {string}    apiKey               In the Baidu Yuyin APP
   * @param  {string}    secrectKey           In the Baidu Yuyin APP
   * @param  {string}    playCmd='afplay'     Command for audio player
   * @param  {string}    path                 Path to save data
   * @param  {boolean}   isBuffered=false     Set if save buffer locally
   * @return {[type]}                         [description]
   */
  constructor (apiKey, secrectKey, playCmd='afplay', path, isBuffered=false) {
    super();

    let __accessUrl__ = 'https://openapi.baidu.com/oauth/2.0/token';
    this.__url__ = 'http://tsn.baidu.com/text2audio';

    let clientID = apiKey;
    let clientSecret = secrectKey;
    let grantType = 'client_credentials';

    this.isBuffered = isBuffered; // Check if store audio
    this.isBufferedPath = __dirname + '/download';
    this.sessionToken = '';
    this.isLogin = false;
    this.sessionFile = __dirname + '/session.json';
    this.tempFile = (path ? path :  __dirname) + '/temp.mp3';
    this.playCmd = playCmd;

    let params = {
      grant_type: grantType,
      client_id: clientID,
      client_secret: clientSecret,
    };

    fs.access(this.sessionFile, fs.F_OK, err => {
      if (err) {
        // Get Baidu token session
        var _url = __accessUrl__ + '?' + querystring.stringify(params);

        request(_url, (err, res, body) => {
          let json = JSON.parse(body);
          let _token = json.access_token;

          this.sessionToken = _token;
		  if (this.sessionToken) {
			this.isLogin = true;
			// Save session token to local file
            fs.writeFile(this.sessionFile, JSON.stringify({token: _token}), err => { if (err) { throw err ;} });
		  } else {
			console.log('Login fails, please check API key and secret key.');
		  }

  		  this.emit('ready', this.sessionToken);
        });
      } else {
        // Read isBuffered token session
        let _sessionJson = JSON.parse(fs.readFileSync(this.sessionFile));
        let sessionToken = _sessionJson.token;

        this.sessionToken = sessionToken;

        if (this.sessionToken) {
          this.isLogin = true;
        }

		this.emit('ready', this.sessionToken);
      }
    });

    // Handle buffers
    if (this.isBuffered) {
      // Check if buffer directory exits, if not, create new.
      fs.access(this.isBufferedPath, fs.F_OK, err => {
        if (err) {
          fs.mkdir(this.isBufferedPath);
        }
      });
    } else {
      // Check if temp path exits, if not, create new.
      if (path) {
        fs.access(path, fs.F_OK, err => {
          if (err) {
            fs.mkdir(__dirname + path);
          }
        });
      }
    }
  }

  /*
   * [speak description]
   * @method speak
   * @param  {[type]} txt [description]
   * @param  {[type]} opt [description]
   * @return {[type]}     [description]
   */
  speak(txt, opt) {
    var id = 'fsu77883jjfkfkkf'; // (new Date()).getTime();
    var params = {
      tex: encodeURIComponent(txt),
      lan: 'zh',
      tok: this.sessionToken,
      ctp: 1,
      cuid: 'BDS-' + id,
      spd: 4,
      pit: 4,
      vol: 5,
      per: 0,
    }

    let url = this.__url__ + '?' + querystring.stringify(params);
    let dl = md5(url);

    return new Promise((resolve, reject) => {
      if (this.isBuffered) {
        try {
          fs.accessSync(this.isBufferedPath + '/' + dl,  fs.F_OK | fs.R_OK);
          childProcess.spawn(this.playCmd, [this.isBufferedPath + '/' + dl])
          .on('exit', (code, signal) => resolve());
          return true;
        }catch (err) {
        }
      }

      // Download file pipeline
      let dlFile = this.isBuffered ? this.isBufferedPath + '/' + dl : this.tempFile;
      let download = fs.createWriteStream(dlFile);

      if (this.isBuffered && this.tempFile) {
		  console.log('Input parameter path is ignored due to isBuffered sets to TRUE');
	  }

      download.on('finish', ()=> {
        childProcess.spawn(this.playCmd, [dlFile])
        .on('exit', (code, signal) => {
          // Remove temp muisc file
          if (!this.isBuffered) {
            fs.unlinkSync(dlFile);
          }

          resolve();
        });
      });

      // Download text audio file
      request(url).pipe(download);
    });
  }
}

module.exports = BaiduYuyin;
