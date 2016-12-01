/**
 * Baidu Yuyin RESTful API
 *
 * @author Abner Chou(hi@abnerchou.me)
 * @description Nodejs Implement for Baidu Yuyin RESTful API.
 * Need register for API keys from http://yuyin.baidu.com
 *
 */
'use strict';

const eventEmitter = require('events').EventEmitter;
const util = require('util');
const querystring = require('querystring');
const request = require('request');
const md5 = require('md5');
const fs = require('fs');
const childProcess = require('child_process');
const p = require('path');
const moment = require('moment');

class BaiduYuyin extends eventEmitter {
    /*
     * Constructor
     * @method constructor
     * @param  {string}    apiKey               In the Baidu Yuyin APP
     * @param  {string}    secretKey            In the Baidu Yuyin APP
     * @param  {string}    playCmd='afplay'     Command for audio player
     * @param  {string}    path                 Path to save data
     * @param  {boolean}   isBuffered=false     Set if save buffer locally
     */
    constructor(apiKey, secretKey, playCmd = 'afplay', path, isBuffered = false) {

        super();

        this.__access_url__ = 'https://openapi.baidu.com/oauth/2.0/token';
        this.__text2audio_url__ = 'http://tsn.baidu.com/text2audio';
        this.__recogination_url__ = 'http://vop.baidu.com/server_api';

        let clientID = apiKey;
        let clientSecret = secretKey;
        let grantType = 'client_credentials';

        this.isBuffered = isBuffered; // Check if store audio
        this.isBufferedPath = p.normalize(__dirname + '/download');
        this.sessionToken = '';
        this.isLogin = false;
        this.sessionFile = p.normalize(__dirname + '/session.json');
        this.tempFile = p.normalize((path ? path : __dirname) + '/temp.mp3');
        this.playCmd = playCmd;

        let params = {
            grant_type: grantType,
            client_id: clientID,
            client_secret: clientSecret,
        };
        // Get Baidu token session
        var _url = this.__access_url__ + '?' + querystring.stringify(params);

        fs.access(this.sessionFile, fs.F_OK, err => {

            if (err) {
                this._checkAuthentication(_url);
            } else {
                // Read isBuffered token session
                let _sessionJson = JSON.parse(fs.readFileSync(this.sessionFile));
                let _sessionToken = _sessionJson.token;
                let _createDate = _sessionJson.create_date;


                this.sessionToken = _sessionToken;

                this._checkAuthentication(_url, _createDate);
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
                        fs.mkdir(p.normalize(path));
                    }
                });
            }
        }
    }

    /*
     * [Text to speech]
     * @method speak
     * @param  {string} txt     Input string to transfer to audio
     * @param  {list}   opt     Option list
     */
    speak(txt, opt) {

        if (!opt) {
            console.log('Parameter opt is not provided, using default values');
            opt = {};
        }

        opt = this._optionDefault(opt, 1);
        
        opt.tex = txt ? encodeURIComponent(txt) : opt.tex;

        let url = this.__text2audio_url__ + '?' + querystring.stringify(opt);
        let dl = md5(url) + '.mp3';

        return new Promise((resolve, reject) => {

            let dlFile = p.normalize(this.isBufferedPath + '/' + dl);

            if (this.isBuffered) {
                try {
                    fs.accessSync(dlFile, fs.F_OK | fs.R_OK);
                    childProcess.spawn(this.playCmd, [dlFile]).on('exit', (code, signal) => resolve());
                    return true;
                } catch (err) {
                    // If dlFile does not exits, continue.
                }
            }

            // Download file pipeline
            dlFile = this.isBuffered ? dlFile : this.tempFile;

            let download = fs.createWriteStream(dlFile);

            if (this.isBuffered && this.tempFile) {
                console.log('Temp file is ignored due to isBuffered sets to TRUE');
            }

            download.on('finish', () => {
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

	/*
     * [Transfer audio to text]
     * @method recognize
     * @param  {audio}  audio   Input audio to translate
     * @param  {list}   opt     Option list
     */
    recognize(audio, opt) {

        if (!opt){
            console.log('Parameter opt is not provided, using default values');
            opt = {};
        }
        
        opt = this._optionDefault(opt, 0);
       
        opt.len = audio ? Buffer.byteLength(audio) : opt.len;
        opt.speech = audio ? new Buffer(audio).toString('base64') : opt.speech;

        return new Promise((resolve, reject) => {
            request.post({url: this.__recogination_url__, json: opt}, (err, res, body) => {
                    console.log(body);
                    resolve();
                });
        });
	}
    /*
     * [Set default values for option]
     * @method _optionDefault
     * @param  {object} opt     Input options
     * @param  {int}    mode    Mode=0 recognize; Mode=1 speak
     * @return {object} opt     Return the options
     */
    _optionDefault(opt, mode){

        opt.lan = opt.lan || 'zh';
        opt.cuid = opt.cuid || 'BDS-fsu77866jjfkfkkf';

        if(mode == 0){
            opt.format = opt.format || 'pcm';
            opt.rate = opt.rate || 8000;
            opt.channel = opt.channel || 1;
            opt.token = opt.token || this.sessionToken;
            opt.len = opt.len           // No default
            opt.speech = opt.speech     // No default
        }

        if(mode == 1){
            opt.tex = opt.tex || encodeURIComponent('I don\'t know what to say');
            opt.tok = opt.tok || this.sessionToken;
            opt.ctp = opt.ctp || 1;
            opt.spd = opt.spd || 4;
            opt.pit = opt.pit || 4;
            opt.vol = opt.vol || 5;
            opt.per = opt.per || 0;
        }

        return opt;
    }
    /*
     * [Check if API key has been authorized]
     * @method _checkAuthentication
     * @param  {string} url         The prepared URL for API authentication
     * @param  {date}   createDate  Token created date
     * @return null
     */
    _checkAuthentication(url, createDate){
        let _currentDate = new moment().format();
        let _dayDiff = 30;

        if (createDate){
            let _current = new moment(_currentDate);
            let _create = new moment(createDate);

            _dayDiff = _create.diff(_current, 'days');
        } 
        
        if (_dayDiff >= 29) {
            request(url, (err, res, body) => {
                    let json = JSON.parse(body);
                    let _tok = json.access_token;
                    let _refreshTok = json.refresh_token;

                    this.sessionToken = _tok;
                    if (this.sessionToken) {
                        if (createDate){
                            fs.unlinkSync(this.sessionFile);
                        }

                        // Save session token to local file
                        fs.writeFile(this.sessionFile, JSON.stringify({
                            token: _tok,
                            refresh_token: _refreshTok,
                            create_date: _currentDate
                        }), err => {
                            if (err) {
                                throw err;
                            }
                        });

                        this.isLogin = true;

                        this.emit('ready', this.sessionToken);
                    } else {
                        console.log('Login fails, please check API key and secret key.');
                    }
                });
        } else {
            this.emit('ready', this.sessionToken);
        }
    }
}

module.exports = BaiduYuyin;
