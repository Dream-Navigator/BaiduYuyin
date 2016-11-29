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
const util = require('util');
const querystring = require('querystring');
const request = require('request');
const md5 = require('md5');
const fs = require('fs');
const childProcess = require('child_process');
const p = require('path');

class BaiduYuyin extends eventEmitter {
    /*
     * Constructor
     * @method constructor
     * @param  {string}    apiKey               In the Baidu Yuyin APP
     * @param  {string}    secrectKey           In the Baidu Yuyin APP
     * @param  {string}    playCmd='afplay'     Command for audio player
     * @param  {string}    path                 Path to save data
     * @param  {boolean}   isBuffered=false     Set if save buffer locally
     */
    constructor(apiKey, secrectKey, playCmd = 'afplay', path, isBuffered = false) {
        super();

        let __accessUrl__ = 'https://openapi.baidu.com/oauth/2.0/token';
        this.__text2audio_url__ = 'http://tsn.baidu.com/text2audio';
        this.__recogination_url__ = 'http://vop.baidu.com/server_api';

        let clientID = apiKey;
        let clientSecret = secrectKey;
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
                        fs.writeFile(this.sessionFile, JSON.stringify({
                            token: _token
                        }), err => {
                            if (err) {
                                throw err;
                            }
                        });
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
                        fs.mkdir(p.normalize(path));
                    }
                });
            }
        }
    }

    /*
     * [speak description]
     * @method speak
     * @param  {string} txt     Input string to transfer to audio
     * @param  {list}   opt     Option list
     */
    speak(txt, opt) {
        if (!opt) {
            console.log('Parameter opt is not provided, using default values');
            opt = {};
        }

        opt.tex = opt.tex || encodeURIComponent(txt || 'I don\'t know what to say');
        opt.lan = opt.lan || 'zh';
        opt.tok = opt.tok || this.sessionToken;
        opt.ctp = opt.ctp || 1;
        opt.cuid = opt.cuid || 'BDS-fsu77866jjfkfkkf';
        opt.spd = opt.spd || 4;
        opt.pit = opt.pit || 4;
        opt.vol = opt.vol || 5;
        opt.per = opt.per || 0;

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
     * [recoginize description]
     * @method recoginize
     * @param  {audio}  audio   Input audio to translate
     * @param  {list}   opt     Option list
     */
    recoginize(audio, opt) {
        if (!opt){
            console.log('Parameter opt is not provided, using default values');
            opt = {};
        }

        opt.format = opt.format || 'pcm';
        opt.rate = opt.rate || 8000;
        opt.channel = opt.channel || 1;
        opt.token = opt.token || this.sessionToken;
        opt.cuid = opt.cuid || 'BDS-fsu77896jjfkfkkf';
        opt.lan = opt.lan || 'zh';
        opt.len = opt.len || Buffer.byteLength(audio);
        opt.speech = opt.speech || new Buffer(audio).toString('base64');

        return new Promise((resolve, reject) => {
            request.post({url: this.__recogination_url__, json: opt}, (err, res, body) => {
                    console.log(body);
                });
        });
	}
}

module.exports = BaiduYuyin;
