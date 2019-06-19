import * as moment from 'moment-timezone';
import * as express from "express";
import * as crypto from 'crypto';
// import * as request from 'request';
import * as Nano from 'nano';
import * as async from 'async';
import * as uuidV4 from 'uuid';
import * as cors from 'cors';
import * as fs from 'fs';
import * as http from 'http';
import * as redis from 'redis';
import * as pretty from 'express-prettify'
// import * as __browser from 'detect-browser';
import * as path from 'path';
// import * as passwordValidator from 'password-validator';
var passwordValidator = require('password-validator');
import * as util from 'util';
import * as Q from 'q';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as WebSocket from 'ws';

// import { RequestHandlerParams } from 'express-serve-static-core';
import { Request, NextFunction, ErrorRequestHandler, Response } from "express";
import { NextHandleFunction } from 'connect';
import * as unitel from './unitel_api_module';
// import { POINT_CONVERSION_COMPRESSED } from 'constants';
// import * as jsesc from 'jsesc';
// import { Module } from 'module';//
//import debug = require("debug");

class App {
    private timeout = ms => new Promise(res => setTimeout(res, ms));

    commandReader(js) {
        const deferred = Q.defer();
        // const isValid=validateTopup(js.client);
        // if(!isValid.length)

        return deferred.promise;
    }
    endRedis(err, res) {
        //console.log('endRedis')
        if (err) console.log(err);
        else console.log(res);
        // setTimeout(() => {
        //     r_client.end(true);    
        // }, 1000*30);

    }
    ab2str(arrayBuffer): string {
        let
            binaryString = '';
        const
            bytes = new Uint8Array(arrayBuffer),
            length = bytes.length;
        for (let i = 0; i < length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        return binaryString;
    }

    str2ab(str) {
        const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    filterObject(obj) {
        var need = ['gui', '_rev', 'gui', 'password', 'oldphone', 'system', 'parents', 'roles', 'isActive'];
        // var need = [ '_rev', 'gui', 'password', 'oldphone', 'system'];
        //console.log(key);
        for (var i in obj) {
            //if(i==='password')
            //console.log(obj[i]);
            for (let x = 0; x < need.length; x++) {
                let k = need[x];
                if (!obj.hasOwnProperty(i)) { } else if (Array.isArray(obj[i])) {
                    if (i.toLowerCase().indexOf(k) > -1)
                        obj[i].length = 0;
                } else if (typeof obj[i] === 'object') {
                    this.filterObject(obj[i]);
                } else if (i.indexOf(k) > -1) {
                    obj[i] = '';
                }
            }
        }
        return obj;
    }
    initWebsocket(): any {
        //debug()
        let parent = this;

        this.ws_client = new WebSocket(this._usermanager_ws); // user-management

        this.wss.on('connection', async (ws, req) => {
            const ip = req.connection.remoteAddress;
            console.log('connection from ' + ip);
            //const ip = req.headers['x-forwarded-for'];
            ws['isAlive'] = true;
            ws.binaryType = 'arraybuffer';

            ws['client'] = {};
            ws['client'].auth = {};
            ws['gui'] = '';
            ws['lastupdate'] = moment(moment.now()).toDate();
            console.log('DECLARE MESSAGE ', ws.readyState);
            ws.on('message', (data) => {
                let js: any = {};
                try {
                    console.log('comming message');
                    let b = parent.ab2str(data);
                    // console.log('1');
                    //console.log(b);
                    let s = Buffer.from(b, 'base64').toString();
                    // console.log('2');
                    // console.log(s);
                    js['client'] = JSON.parse(s);
                    //console.log(js.client)
                    js['ws'] = ws;
                    ws['lastupdate'] = moment(moment.now()).toDate();
                    ws['isAlive'] = true;
                    ws['gui'] = js['client'].gui;
                    // this.checkConnection(ws['gui']);

                    js['client'].auth = {};
                    ws['client'] = JSON.parse(JSON.stringify(js['client']));
                    console.log('command ', ws['client'].data.command);
                    parent.commandReader(js).then(res => {
                        js = res;
                        ws['gui'] = js['client'].gui;
                        ws['client'] = JSON.parse(JSON.stringify(js['client']));
                        ws['lastupdate'] = moment(moment.now()).toDate();

                        if (res['client'].data.command === 'logout') {
                            ws['gui'] = '';
                            ws['client'] = {};
                            ws['lastupdate'] = '';
                        }
                        if (parent._system_prefix.indexOf(js['client'].prefix) < 0) {
                            console.log('clear auth')
                            delete js['client'].auth;
                            //parent.filterObject(js['client'].data);
                        }
                        console.log('sending');
                        // console.log(js['client']);
                        // js['client'].data.message+=' TEST non english ຍັງຈັບສັນຍານ GPS ບໍ່ໄດ້ ເລີຍບໍ່ທັນ ONLINE ແຕ່ໂທໄດ້, ຕັ້ງຄ່າໄດ້ແລ້ວ';

                        // console.log(98);
                        // console.log(b);
                        // let a = Buffer.from(b);
                        // console.log(a);
                        // console.log(102);
                        console.log(js.client.data.command);
                        if (ws.readyState === ws.OPEN) {
                            let b = Buffer.from(JSON.stringify(js['client'])).toString('base64');
                            ws.send(JSON.stringify(b), {
                                binary: true
                            });
                        }
                    }).catch(err => {
                        js = err;
                        var l = {
                            log: js['client'].data.message,
                            logdate: moment(moment.now()),
                            type: "error",
                            gui: uuidV4()
                        };
                        //console.log(err);
                        parent.errorLogging(l);
                        console.log('ws sending');
                        ws['client'] = JSON.parse(JSON.stringify(js['client']));
                        ws['lastupdate'] = moment(moment.now()).toDate();
                        js['client'].data.message = js['client'].data.message.message;
                        parent.filterObject(js['client'].auth);
                        let b = Buffer.from(JSON.stringify(js['client'])).toString('base64');
                        //console.log(b);
                        // let a = Buffer.from(b);
                        //console.log(a);
                        if (ws.readyState === ws.OPEN) {

                            ws.send(JSON.stringify(b), {
                                binary: true
                            });
                        }
                    });
                } catch (error) {
                    console.log(error);
                    js['client'].data.message = error.message;
                    ws['client'] = JSON.parse(JSON.stringify(js['client']));
                    ws['lastupdate'] = moment(moment.now()).toDate();
                    parent.filterObject(js['client'].auth);
                    let b = Buffer.from(JSON.stringify(js['client'])).toString('base64');
                    //console.log(b);
                    // let a = Buffer.from(b);
                    //console.log(a);
                    if (ws.readyState === ws.OPEN) {

                        ws.send(JSON.stringify(b), {
                            binary: true
                        });
                    }
                }

            });

            ws.on('pong', () => {
                try {
                    ws['isAlive'] = true;
                    if (!ws['lastupdate'] && !ws['gui']) {
                        ws['isAlive'] = false;
                    }
                    let startDate = moment(ws['lastupdate']).toDate()
                    let endDate = moment(moment.now());
                    const timeout = endDate.diff(startDate, 'seconds');
                    if (timeout > 60 * 60)
                        ws['isAlive'] = false;
                    else
                        ws['isAlive'] = true;
                    // parent.wss.clients.forEach(element => {
                    //     let client = element['client'];
                    //     //parent.setLoginStatus(client);
                    //     //parent.setClientStatus(client);
                    //     //this.setOnlineStatus(client);                    
                    // });
                } catch (error) {
                    console.log(error);
                }
            });
            ws.on('error', (err) => {
                //js.client.data.message=JSON.stringify(err);
                console.log(err);
                var l = {
                    log: err,
                    logdate: moment().toDate(),
                    type: "error",
                    gui: uuidV4()
                };
                parent.errorLogging(l);
            });

        });
        const interval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                try {
                    if (ws['isAlive'] === false || !ws['isAlive']) {

                        console.log(ws['isAlive'] + 'TERMINATE ws ' + ws['gui']);
                        return ws.terminate();
                    }
                    console.log('TIME INTERVAL');
                    ws['isAlive'] = false;
                    ws.ping(() => { });
                } catch (error) {
                    console.log(error);
                }
            });
        }, 60000 * 15); // set 60 seconds         


    }

    checkConnection(gui) {
        let client_count = 0;
        this.wss.clients.forEach((ws) => {
            try {
                if (ws['gui'] === gui) {
                    if (client_count) {
                        return;
                    }
                    client_count++;
                    ws['isAlive'] = true;
                    ws['lastupdate'] = (moment().toDate());
                }
            } catch (error) {
                console.log(error);
            }
        });
    }


    private _system_prefix = ['ice-maker', 'gij', 'web-post', 'user-management'];
    private ws_client: WebSocket;
    private wsoption: WebSocket.ServerOptions;
    private wss: WebSocket.Server;
    public server: http.Server;
    private _usermanager_host: string;
    private _usermanager_ws: string;
    private app: express.Application = express();
    private nano: any;
    private r_client: redis.RedisClient;
    private passValidator: any;
    private userValidator: any;
    private phoneValidator: any;
    private _current_system: string;
    private __design_view: string = "objectList";

    private __design_device = {
        "_id": "_design/objectList",
        "views": {
            "findByOwnerName": {
                "map": "function(doc) {\r\n for(var i=0;i<doc.ownername.length;i++) emit([doc.ownername[i]], null);\r\n}"
            },
            "findByImei": {
                "map": "function(doc) {\r\n    if(doc.imei) {\r\n        emit(doc.imei,null);\r\n    }\r\n}"
            },
            "countUsername": {
                "reduce": "_count",
                "map": "function (doc) {\n  emit(doc.username, 1);\n}"
            },
            "countUserGUI": {
                "reduce": "_count",
                "map": "function (doc) {\n  emit(doc.usergui, 1);\n}"
            },
            "byUsername": {
                "map": "function (doc) {\n  emit(doc.username, null);\n}"
            },
            "byUserGUI": {
                "map": "function (doc) {\n  emit(doc.usergui, null);\n}"
            },
            "byParent": {
                "map": "function (doc) {\n  emit(doc.parent, null);\n}"
            },
            "countParent": {
                "reduce": "_count",
                "map": "function (doc) {\n  emit(doc.parent, 1);\n}"
            }
        },
        "language": "javascript"

    }

    constructor() {
        this.convertTZ(moment.now());
        this._current_system = 'unitel-service';
        this._usermanager_host = 'http://nonav.net:6688';
        // this._usermanager_ws = 'ws://nonav.net:6688';
        this._usermanager_ws = 'ws://nonav.net:6688';

        this.nano = Nano('http://admin:5martH67@laoapps.com:5984');

        this.r_client = redis.createClient();

        console.log('config unitel service');
        this.config();

        this.initWebsocket();
        this.r_client.monitor((err: any, res: any): any => {
            console.log("Entering monitoring mode.");
        });
        this.r_client.on('monitor', this.monitor_redis.bind(this));

        this.passValidator = new passwordValidator();
        this.passValidator.is().min(6) // Minimum length 8 
            .is().max(100) // Maximum length 100 
            //.has().uppercase()                              // Must have uppercase letters 
            .has().lowercase() // Must have lowercase letters 
            .has().digits() // Must have digits 
            .has().not().spaces()


        this.userValidator = new passwordValidator();
        this.userValidator.is().min(3)
            .is().max(12)
            .has().digits()
            .has().lowercase()
            .has().not().spaces();
        this.phoneValidator = new passwordValidator();
        this.phoneValidator.is().min(9)
            .has().digits()
            .has().not().spaces();



        this.initDB();

        let u = unitel.default;
        console.log('init u');
        //console.log('check start');
        //let number ='8562098860280';
        //let number = '8562097299830';
        // u.checkStartEndPromotion(number);
        // u.checkSubscriberChargeDetails(number);
        // u.checkBalanceData(number);
    }
    unitelCheckStartEndPromotion(res: Response, number: string): any {
        let u = unitel.default;
        u.checkStartEndPromotion(number).then(r => {
            res.send(r);
        }).catch(err => {
            res.send((err));
        });
    }
    unitelCheckSubscriberChargeDetails(res: Response, number: string): any {
        let u = unitel.default;

        u.checkSubscriberChargeDetails(number).then(r => {
            res.send(r);
        }).catch(err => {
            res.send((err));
        });

    }
    unitelCheckBalanceData(res: Response, number: string): any {
        let u = unitel.default;
        u.checkBalanceData(number).then(r => {
            res.send((r));
        }).catch(err => {
            res.send((err));
        });
    }
    initDB(): void {
        // init_db('icemaker_device', __design_icemakerdevice);
        //this.init_db('icemaker_device', this.__design_device);
        // init_db('raws', __design_raw);    
        //this.init_db('alarm_record', this.__design_alarm);
        // init_db('status_record', __design_status);        
    }
    init_db(dbname, design): void {
        // create a new database
        var db;
        async.eachSeries([
            db = this.create_db(dbname),
            db = this.nano.use(dbname),
            db.insert(design, (err, res) => {
                if (err) {
                    db.get('_design/objectList', (err, res) => {
                        console.log(dbname);
                        if (err) console.log('could not find design ' + err.message);
                        else {
                            if (res) {
                                var d = res;
                                //console.log("d:"+JSON.stringify(d));
                                db.destroy('_design/objectList', d._rev, (err, res) => {
                                    if (err) console.log(err);
                                    else {
                                        //console.log(res);
                                        db.insert(design, "_design/objectList", (err, res) => {
                                            if (err) console.log('err insert new design ' + dbname);
                                            else {
                                                //console.log('insert design completed ' + dbname);
                                            }
                                        });
                                    }
                                });
                            } else {
                                // console.log("could not find design");
                            }
                        }
                    });
                } else {
                    //console.log('created design ' + dbname);
                }

            })
        ], (err) => {
            console.log('exist ' + dbname);
        });
        //db = nano.use(dbname);
        //return db;
    }



    errorHandler(err: ErrorRequestHandler, req: Request, res: Response, next: NextHandleFunction): any {

        console.log(err);
        var l = {
            log: err,
            logdate: (moment().format()),
            type: "error",
            gui: uuidV4()
        };
        this.errorLogging(l);
        if (res.headersSent) {
            return next(req, res, null);
        }
        res.status(500);
        res.render('error', {
            error: err
        });
    }
    errorLogging(log) {
        var db = this.create_db("errorlogs");
        console.log(log);
        db.insert(log, log.gui, (err, body) => {
            if (err) console.log(err);
            else {
                console.log("log oK ");
            }
        });
    }
    create_db(dbname) {
        let db;
        this.nano.db.create(dbname, (err, body) => {
            // specify the database we are going to use    
            if (!err) {
                console.log('database ' + dbname + ' created!');
            } else
                console.log(dbname + " could not be created!");
        });
        db = this.nano.use(dbname);
        return db;
    };

    convertTZ(fromTZ) {

        // return new Date(new Date(fromTZ).toLocaleString('en-US', {
        //     timeZone: 'Asia/Vientiane'
        //   }));
        process.env.TZ = 'Asia/Vientiane';
        //if(moment)
        //moment().format();     
        return moment(moment.tz(fromTZ, "Asia/Vientiane").format().replace('+07:00', ''));
    }
    wscallback(res: boolean, code: number, msg: string): void {
        console.log('%s,%s,%s', res, code, msg);
    }
    clog(f: string, ...p) {
        console.log(f, p.length ? p : '');
    }
    private config(): void {        
        this.app.set('trust proxy', true);
        this.app.use(methodOverride());
        this.app.use(cors());
        this.app.use(bodyParser.json());
        // this.app.use(bodyParser.urlencoded({ extended: false }));
        this.server = http.createServer(this.app);
        this.routes();


        /// WEBSOCKET
        this.wsoption = {};
        this.wsoption.server = this.server;
        this.wsoption.perMessageDeflate = false;
        this.wss = new WebSocket.Server(this.wsoption);

    }
    private routes(): void {
        const router = express.Router();
        this.app.use('/public', express.static('public'));
        this.app.use(this.errorHandler);
        router.all('/', (req: Request, res: Response) => {
            this.clog('OK Test');
            res.redirect('/public');
        });
        router.all('/unitelCheckStartEndPromotion', (req: Request, res: Response) => {
            this.clog('OK unitel check start end promotion');
            //console.log(req);
            //console.log(req.query);
            let number = req.query.number;
            this.unitelCheckStartEndPromotion(res, number);
        });
        router.all('/unitelCheckSubscriberChargeDetails', (req: Request, res: Response) => {
            this.clog('OK  unitel check subscriber charger details');
            let number = req.query.number;
            this.unitelCheckSubscriberChargeDetails(res, number);
        });
        router.all('/unitelCheckBalanceData', (req: Request, res: Response) => {
            this.clog('OK  unitel check balance data');
            let number = req.query.number;
            this.unitelCheckBalanceData(res, number);
        });
        // router.all('/cleanBillAndPayment', (req: Request, res: Response) => {

        //     this.clog('clean OK');

        // });
        this.app.use('/', router);

        // this.app.all('/', (req: Request, res: Response) => {
        //     this.clog('OK Test');
        //     res.sendFile(path.join(__dirname + '../../../index.html'));
        // });
    }
    monitor_redis(time: any, args: any, raw_reply: any): redis.Callback<undefined> {
        //console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
        try {
            args = args.toString();
            if (args.indexOf('set') != 0) //capture the set command only
                return;
            //args=args.replace('\\','');
            //console.log('getjs');
            let js = args.substring(args.indexOf('{'), args.lastIndexOf('}') + 1);
            //console.log(js);
            js = JSON.parse(js);
            let arr = args.split(',');
            //console.log(arr);
            let command = arr[0];
            let k = arr[1];
            let mode = '';
            let timeout = 0;
            if (arr[arr.length - 1].indexOf('}') < 0) {
                mode = arr[arr.length - 2];
                timeout = arr[arr.length - 1]
            }
            let clients = this.wss.clients;
            try {
                if (command == "set")
                    if (clients) {
                        clients.forEach((ws) => {
                            const element = ws;
                            //console.log(element['client']);
                            if (this._current_system + "_client_" + element['gui'] == k) {
                                console.log('client-changed');
                                let b = Buffer.from(JSON.stringify(element['client'])).toString('base64');
                                element.send((JSON.stringify(b)), { binary: true });
                            }
                            else if (this._current_system + "_error_" + element['gui'] == k) {
                                console.log('error-changed');
                                var l = {
                                    log: JSON.stringify(js),
                                    logdate: (moment().format()),
                                    type: "error",
                                    gui: uuidV4()
                                };
                                this.errorLogging(l);
                                let b = Buffer.from(JSON.stringify(element['client'])).toString('base64');
                                element.send((JSON.stringify(b)), { binary: true });
                            }
                            if (this._current_system + "_login_" + element['client'].logintoken == k) {
                                let js: any = {};
                                js.client.logintoken = element['client'].logintoken;
                                js.client.data = {};
                                js.client.data.command = 'NONE';


                            }


                        });
                    }

            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
            console.log(error);
        }
    };
}
export default new App();