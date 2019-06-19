"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment-timezone");
var express = require("express");
// import * as request from 'request';
var Nano = require("nano");
var async = require("async");
var uuidV4 = require("uuid");
var cors = require("cors");
var http = require("http");
var redis = require("redis");
// import * as passwordValidator from 'password-validator';
var passwordValidator = require('password-validator');
var Q = require("q");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var WebSocket = require("ws");
var unitel = require("./unitel_api_module");
// import { POINT_CONVERSION_COMPRESSED } from 'constants';
// import * as jsesc from 'jsesc';
// import { Module } from 'module';//
//import debug = require("debug");
var App = /** @class */ (function () {
    function App() {
        this.timeout = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
        this._system_prefix = ['ice-maker', 'gij', 'web-post', 'user-management'];
        this.app = express();
        this.__design_view = "objectList";
        this.__design_device = {
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
        };
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
        this.r_client.monitor(function (err, res) {
            console.log("Entering monitoring mode.");
        });
        this.r_client.on('monitor', this.monitor_redis.bind(this));
        this.passValidator = new passwordValidator();
        this.passValidator.is().min(6) // Minimum length 8 
            .is().max(100) // Maximum length 100 
            //.has().uppercase()                              // Must have uppercase letters 
            .has().lowercase() // Must have lowercase letters 
            .has().digits() // Must have digits 
            .has().not().spaces();
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
        var u = unitel.default;
        console.log('init u');
        //console.log('check start');
        //let number ='8562098860280';
        //let number = '8562097299830';
        // u.checkStartEndPromotion(number);
        // u.checkSubscriberChargeDetails(number);
        // u.checkBalanceData(number);
    }
    App.prototype.commandReader = function (js) {
        var deferred = Q.defer();
        // const isValid=validateTopup(js.client);
        // if(!isValid.length)
        return deferred.promise;
    };
    App.prototype.endRedis = function (err, res) {
        //console.log('endRedis')
        if (err)
            console.log(err);
        else
            console.log(res);
        // setTimeout(() => {
        //     r_client.end(true);    
        // }, 1000*30);
    };
    App.prototype.ab2str = function (arrayBuffer) {
        var binaryString = '';
        var bytes = new Uint8Array(arrayBuffer), length = bytes.length;
        for (var i = 0; i < length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        return binaryString;
    };
    App.prototype.str2ab = function (str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    };
    App.prototype.filterObject = function (obj) {
        var need = ['gui', '_rev', 'gui', 'password', 'oldphone', 'system', 'parents', 'roles', 'isActive'];
        // var need = [ '_rev', 'gui', 'password', 'oldphone', 'system'];
        //console.log(key);
        for (var i in obj) {
            //if(i==='password')
            //console.log(obj[i]);
            for (var x = 0; x < need.length; x++) {
                var k = need[x];
                if (!obj.hasOwnProperty(i)) { }
                else if (Array.isArray(obj[i])) {
                    if (i.toLowerCase().indexOf(k) > -1)
                        obj[i].length = 0;
                }
                else if (typeof obj[i] === 'object') {
                    this.filterObject(obj[i]);
                }
                else if (i.indexOf(k) > -1) {
                    obj[i] = '';
                }
            }
        }
        return obj;
    };
    App.prototype.initWebsocket = function () {
        var _this = this;
        //debug()
        var parent = this;
        this.ws_client = new WebSocket(this._usermanager_ws); // user-management
        this.wss.on('connection', function (ws, req) { return __awaiter(_this, void 0, void 0, function () {
            var ip;
            return __generator(this, function (_a) {
                ip = req.connection.remoteAddress;
                console.log('connection from ' + ip);
                //const ip = req.headers['x-forwarded-for'];
                ws['isAlive'] = true;
                ws.binaryType = 'arraybuffer';
                ws['client'] = {};
                ws['client'].auth = {};
                ws['gui'] = '';
                ws['lastupdate'] = moment(moment.now()).toDate();
                console.log('DECLARE MESSAGE ', ws.readyState);
                ws.on('message', function (data) {
                    var js = {};
                    try {
                        console.log('comming message');
                        var b = parent.ab2str(data);
                        // console.log('1');
                        //console.log(b);
                        var s = Buffer.from(b, 'base64').toString();
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
                        parent.commandReader(js).then(function (res) {
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
                                console.log('clear auth');
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
                                var b_1 = Buffer.from(JSON.stringify(js['client'])).toString('base64');
                                ws.send(JSON.stringify(b_1), {
                                    binary: true
                                });
                            }
                        }).catch(function (err) {
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
                            var b = Buffer.from(JSON.stringify(js['client'])).toString('base64');
                            //console.log(b);
                            // let a = Buffer.from(b);
                            //console.log(a);
                            if (ws.readyState === ws.OPEN) {
                                ws.send(JSON.stringify(b), {
                                    binary: true
                                });
                            }
                        });
                    }
                    catch (error) {
                        console.log(error);
                        js['client'].data.message = error.message;
                        ws['client'] = JSON.parse(JSON.stringify(js['client']));
                        ws['lastupdate'] = moment(moment.now()).toDate();
                        parent.filterObject(js['client'].auth);
                        var b = Buffer.from(JSON.stringify(js['client'])).toString('base64');
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
                ws.on('pong', function () {
                    try {
                        ws['isAlive'] = true;
                        if (!ws['lastupdate'] && !ws['gui']) {
                            ws['isAlive'] = false;
                        }
                        var startDate = moment(ws['lastupdate']).toDate();
                        var endDate = moment(moment.now());
                        var timeout = endDate.diff(startDate, 'seconds');
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
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
                ws.on('error', function (err) {
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
                return [2 /*return*/];
            });
        }); });
        var interval = setInterval(function () {
            _this.wss.clients.forEach(function (ws) {
                try {
                    if (ws['isAlive'] === false || !ws['isAlive']) {
                        console.log(ws['isAlive'] + 'TERMINATE ws ' + ws['gui']);
                        return ws.terminate();
                    }
                    console.log('TIME INTERVAL');
                    ws['isAlive'] = false;
                    ws.ping(function () { });
                }
                catch (error) {
                    console.log(error);
                }
            });
        }, 60000 * 15); // set 60 seconds         
    };
    App.prototype.checkConnection = function (gui) {
        var client_count = 0;
        this.wss.clients.forEach(function (ws) {
            try {
                if (ws['gui'] === gui) {
                    if (client_count) {
                        return;
                    }
                    client_count++;
                    ws['isAlive'] = true;
                    ws['lastupdate'] = (moment().toDate());
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    };
    App.prototype.unitelCheckStartEndPromotion = function (res, number) {
        var u = unitel.default;
        u.checkStartEndPromotion(number).then(function (r) {
            res.send(r);
        }).catch(function (err) {
            res.send((err));
        });
    };
    App.prototype.unitelCheckSubscriberChargeDetails = function (res, number) {
        var u = unitel.default;
        u.checkSubscriberChargeDetails(number).then(function (r) {
            res.send(r);
        }).catch(function (err) {
            res.send((err));
        });
    };
    App.prototype.unitelCheckBalanceData = function (res, number) {
        var u = unitel.default;
        u.checkBalanceData(number).then(function (r) {
            res.send((r));
        }).catch(function (err) {
            res.send((err));
        });
    };
    App.prototype.initDB = function () {
        // init_db('icemaker_device', __design_icemakerdevice);
        //this.init_db('icemaker_device', this.__design_device);
        // init_db('raws', __design_raw);    
        //this.init_db('alarm_record', this.__design_alarm);
        // init_db('status_record', __design_status);        
    };
    App.prototype.init_db = function (dbname, design) {
        // create a new database
        var db;
        async.eachSeries([
            db = this.create_db(dbname),
            db = this.nano.use(dbname),
            db.insert(design, function (err, res) {
                if (err) {
                    db.get('_design/objectList', function (err, res) {
                        console.log(dbname);
                        if (err)
                            console.log('could not find design ' + err.message);
                        else {
                            if (res) {
                                var d = res;
                                //console.log("d:"+JSON.stringify(d));
                                db.destroy('_design/objectList', d._rev, function (err, res) {
                                    if (err)
                                        console.log(err);
                                    else {
                                        //console.log(res);
                                        db.insert(design, "_design/objectList", function (err, res) {
                                            if (err)
                                                console.log('err insert new design ' + dbname);
                                            else {
                                                //console.log('insert design completed ' + dbname);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                // console.log("could not find design");
                            }
                        }
                    });
                }
                else {
                    //console.log('created design ' + dbname);
                }
            })
        ], function (err) {
            console.log('exist ' + dbname);
        });
        //db = nano.use(dbname);
        //return db;
    };
    App.prototype.errorHandler = function (err, req, res, next) {
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
    };
    App.prototype.errorLogging = function (log) {
        var db = this.create_db("errorlogs");
        console.log(log);
        db.insert(log, log.gui, function (err, body) {
            if (err)
                console.log(err);
            else {
                console.log("log oK ");
            }
        });
    };
    App.prototype.create_db = function (dbname) {
        var db;
        this.nano.db.create(dbname, function (err, body) {
            // specify the database we are going to use    
            if (!err) {
                console.log('database ' + dbname + ' created!');
            }
            else
                console.log(dbname + " could not be created!");
        });
        db = this.nano.use(dbname);
        return db;
    };
    ;
    App.prototype.convertTZ = function (fromTZ) {
        // return new Date(new Date(fromTZ).toLocaleString('en-US', {
        //     timeZone: 'Asia/Vientiane'
        //   }));
        process.env.TZ = 'Asia/Vientiane';
        //if(moment)
        //moment().format();     
        return moment(moment.tz(fromTZ, "Asia/Vientiane").format().replace('+07:00', ''));
    };
    App.prototype.wscallback = function (res, code, msg) {
        console.log('%s,%s,%s', res, code, msg);
    };
    App.prototype.clog = function (f) {
        var p = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            p[_i - 1] = arguments[_i];
        }
        console.log(f, p.length ? p : '');
    };
    App.prototype.config = function () {
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
    };
    App.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        this.app.use('/public', express.static('public'));
        this.app.use(this.errorHandler);
        router.all('/', function (req, res) {
            _this.clog('OK Test');
            res.redirect('/public');
        });
        router.all('/unitelCheckStartEndPromotion', function (req, res) {
            _this.clog('OK unitel check start end promotion');
            //console.log(req);
            //console.log(req.query);
            var number = req.query.number;
            _this.unitelCheckStartEndPromotion(res, number);
        });
        router.all('/unitelCheckSubscriberChargeDetails', function (req, res) {
            _this.clog('OK  unitel check subscriber charger details');
            var number = req.query.number;
            _this.unitelCheckSubscriberChargeDetails(res, number);
        });
        router.all('/unitelCheckBalanceData', function (req, res) {
            _this.clog('OK  unitel check balance data');
            var number = req.query.number;
            _this.unitelCheckBalanceData(res, number);
        });
        // router.all('/cleanBillAndPayment', (req: Request, res: Response) => {
        //     this.clog('clean OK');
        // });
        this.app.use('/', router);
        // this.app.all('/', (req: Request, res: Response) => {
        //     this.clog('OK Test');
        //     res.sendFile(path.join(__dirname + '../../../index.html'));
        // });
    };
    App.prototype.monitor_redis = function (time, args, raw_reply) {
        var _this = this;
        //console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
        try {
            args = args.toString();
            if (args.indexOf('set') != 0) //capture the set command only
                return;
            //args=args.replace('\\','');
            //console.log('getjs');
            var js_1 = args.substring(args.indexOf('{'), args.lastIndexOf('}') + 1);
            //console.log(js);
            js_1 = JSON.parse(js_1);
            var arr = args.split(',');
            //console.log(arr);
            var command = arr[0];
            var k_1 = arr[1];
            var mode = '';
            var timeout = 0;
            if (arr[arr.length - 1].indexOf('}') < 0) {
                mode = arr[arr.length - 2];
                timeout = arr[arr.length - 1];
            }
            var clients = this.wss.clients;
            try {
                if (command == "set")
                    if (clients) {
                        clients.forEach(function (ws) {
                            var element = ws;
                            //console.log(element['client']);
                            if (_this._current_system + "_client_" + element['gui'] == k_1) {
                                console.log('client-changed');
                                var b = Buffer.from(JSON.stringify(element['client'])).toString('base64');
                                element.send((JSON.stringify(b)), { binary: true });
                            }
                            else if (_this._current_system + "_error_" + element['gui'] == k_1) {
                                console.log('error-changed');
                                var l = {
                                    log: JSON.stringify(js_1),
                                    logdate: (moment().format()),
                                    type: "error",
                                    gui: uuidV4()
                                };
                                _this.errorLogging(l);
                                var b = Buffer.from(JSON.stringify(element['client'])).toString('base64');
                                element.send((JSON.stringify(b)), { binary: true });
                            }
                            if (_this._current_system + "_login_" + element['client'].logintoken == k_1) {
                                var js_2 = {};
                                js_2.client.logintoken = element['client'].logintoken;
                                js_2.client.data = {};
                                js_2.client.data.command = 'NONE';
                            }
                        });
                    }
            }
            catch (error) {
                console.log(error);
            }
        }
        catch (error) {
            console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
            console.log(error);
        }
    };
    ;
    return App;
}());
exports.default = new App();
//# sourceMappingURL=app.js.map