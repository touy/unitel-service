"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var soap = require("soap");
var xml2js = require("xml2js");
var App = /** @class */ (function () {
    function App() {
        this._responseCode = [
            { code: "-1", description: "Login information is not correct." },
            { code: "-2", description: "Internal IP address  not allowed " },
            { code: "11", description: "Not information subscriber " },
            { code: "00000", description: "Error get balance " },
            { code: "77", description: "Not exist isdn " },
            { code: "33", description: "No history charge detail" },
            { code: "-99", description: "Unhandled error, please contact administrator " },
            { code: "0", description: "Success" }
        ];
        this._errorCode_SMS = [{
                "ERROR_CODE": 0,
                "DESCRIPTION": "Invalid username / password"
            }, {
                "ERROR_CODE": 1,
                "DESCRIPTION": "Send Sms Success"
            }, {
                "ERROR_CODE": 2,
                "DESCRIPTION": "Invalid Brandname"
            }, {
                "ERROR_CODE": 3,
                "DESCRIPTION": "Send SMS Failed"
            }, {
                "ERROR_CODE": 4,
                "DESCRIPTION": "Not enough money"
            }, {
                "ERROR_CODE": 5,
                "DESCRIPTION": "Company not permission send    SMS via API"
            }, {
                "ERROR_CODE": 6,
                "DESCRIPTION": "Invalid IP Address"
            }, {
                "ERROR_CODE": 7,
                "DESCRIPTION": "Invalid phone number"
            }
        ];
        this._errorCode = [
            {
                "ERROR_CODE": 1000,
                "DESCRIPTION": "User name is invalid"
            },
            {
                "ERROR_CODE": 2000,
                "DESCRIPTION": "Webservice code is invalid"
            },
            {
                "ERROR_CODE": 4000,
                "DESCRIPTION": "The request's message's format is not accurate"
            },
            {
                "ERROR_CODE": 1001,
                "DESCRIPTION": "User name does not exits"
            },
            {
                "ERROR_CODE": 6000,
                "DESCRIPTION": "Because our system is overloading, please wait another time to sent requests"
            },
            {
                "ERROR_CODE": 7000,
                "DESCRIPTION": "The connection to DB has some problems. The gateway can not handle the request at this time"
            },
            {
                "ERROR_CODE": 6001,
                "DESCRIPTION": "You don't have the right to access the web service"
            },
            {
                "ERROR_CODE": 6002,
                "DESCRIPTION": "Your right about calling the web service is expired, please contact the administrator"
            },
            {
                "ERROR_CODE": 6003,
                "DESCRIPTION": "Login failed. Please check user name, password and your IP Address and contact the administrator"
            },
            {
                "ERROR_CODE": 6004,
                "DESCRIPTION": "Login failed.UserName is invalid."
            },
            {
                "ERROR_CODE": 7001,
                "DESCRIPTION": "Database error"
            },
            {
                "ERROR_CODE": 2005,
                "DESCRIPTION": "Webservice error"
            },
            {
                "ERROR_CODE": 6005,
                "DESCRIPTION": "Error when load response to DOM"
            },
            {
                "ERROR_CODE": 8000,
                "DESCRIPTION": "The ip is incorrect"
            },
            {
                "ERROR_CODE": 9001,
                "DESCRIPTION": "Exception"
            },
            {
                "ERROR_CODE": 9002,
                "DESCRIPTION": "Error when prepare soap input"
            },
            {
                "ERROR_CODE": 3000,
                "DESCRIPTION": "Client does not found in databse or inactive"
            },
            {
                "ERROR_CODE": 2001,
                "DESCRIPTION": "Webservice does not found in databse or inactive"
            },
            {
                "ERROR_CODE": 4001,
                "DESCRIPTION": "Requested web service does not exits"
            },
            {
                "ERROR_CODE": 5000,
                "DESCRIPTION": "Too many requests. Please wait until your other request finish"
            },
            {
                "ERROR_CODE": 1002,
                "DESCRIPTION": "User name is inactive, please contact the administrator"
            },
            {
                "ERROR_CODE": 2002,
                "DESCRIPTION": "The web service you requested is inactive, please contact the administrator"
            },
            {
                "ERROR_CODE": 2003,
                "DESCRIPTION": "The connection to the web service has problems. Please contact the administrator"
            },
            {
                "ERROR_CODE": 2004,
                "DESCRIPTION": "Could not connect to the business web service"
            },
            {
                "ERROR_CODE": 0,
                "DESCRIPTION": "Success"
            },
            {
                "ERROR_CODE": 9000,
                "DESCRIPTION": "Unhandled error occur"
            },
            {
                "ERROR_CODE": 8001,
                "DESCRIPTION": "The password is incorrect"
            },
            {
                "ERROR_CODE": 8002,
                "DESCRIPTION": "The userName $username$ is incorrect!"
            },
            {
                "ERROR_CODE": 6006,
                "DESCRIPTION": "Error occur when decrypt user and password"
            }
        ];
    }
    App.prototype.sendSMS = function (msisdn, content, brandname) {
        var deferred = Q.defer();
        var url = 'http://183.182.100.154:8181/apiSendSms.php?wsdl';
        var args = {
            //sendSMS: {
            username: "Huakathi_2020",
            password: "Huakathi!@#123",
            language_id: 0,
            brand_name: brandname,
            content: content,
            msisdn: msisdn
            //  wscode: "checkVtracking",
            // param: [
            //     { attributes: { name: 'username', value: 'vtracking' } },
            //     { attributes: { name: 'password', value: 'Vtracking2244@Qwer' } },
            //     { attributes: { name: 'msisdn', value: msisdn } },
            //     { attributes: { name: 'typeCheck', value: '1' } },
            // ]
            // ,
            // rawData: ''
            // }
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            else {
                //client.gwOperation.Input=args;
                console.log(client.sendSMS.toString());
                console.log(args);
                client.sendSMS(args, function (err, result, opt, extraHeader) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    else {
                        console.log(result);
                        xml2js.parseString(result.Result.original, function (err, res) {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            }
                            else {
                                console.log(res);
                                var r = res['S:Envelope']['S:Body'][0]['ns2:checkVtrackingResponse'][0].return[0];
                                console.log(r);
                                // r={ description: [ 'SUCCESS' ],
                                // endPromotion: [ '11/11/2019' ],
                                // msisdn: [ '8562097299830' ],
                                // responseCode: [ '0' ],
                                // startPromotion: [ '11/11/2018' ],
                                // typeCheck: [ '1' ] };                                               
                                deferred.resolve(r);
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    };
    App.prototype.checkStartEndPromotion = function (msisdn) {
        var deferred = Q.defer();
        var url = 'http://183.182.100.133:8999/BCCSGateway?wsdl';
        var args = {
            Input: {
                username: "a19bfa2be1695b1d6be5284fbd49f940",
                password: "8af183e295b15cd9118219dbb26911bd",
                wscode: "checkVtracking",
                param: [
                    { attributes: { name: 'username', value: 'vtracking' } },
                    { attributes: { name: 'password', value: 'Vtracking2244@Qwer' } },
                    { attributes: { name: 'msisdn', value: msisdn } },
                    { attributes: { name: 'typeCheck', value: '1' } },
                ],
                rawData: ''
            }
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            else {
                //client.gwOperation.Input=args;
                //console.log(client.gwOperation.toString());
                client.gwOperation(args, function (err, result, opt, extraHeader) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    else {
                        // console.log(result);                                                    
                        xml2js.parseString(result.Result.original, function (err, res) {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            }
                            else {
                                var r = res['S:Envelope']['S:Body'][0]['ns2:checkVtrackingResponse'][0].return[0];
                                console.log(r);
                                // r={ description: [ 'SUCCESS' ],
                                // endPromotion: [ '11/11/2019' ],
                                // msisdn: [ '8562097299830' ],
                                // responseCode: [ '0' ],
                                // startPromotion: [ '11/11/2018' ],
                                // typeCheck: [ '1' ] };                                               
                                deferred.resolve(r);
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    };
    App.prototype.checkSubscriberChargeDetails = function (msisdn) {
        var deferred = Q.defer();
        var url = 'http://183.182.100.133:8999/BCCSGateway?wsdl';
        var args = {
            Input: {
                username: "a19bfa2be1695b1d6be5284fbd49f940",
                password: "8af183e295b15cd9118219dbb26911bd",
                wscode: "checkVtracking",
                param: [
                    { attributes: { name: 'username', value: 'vtracking' } },
                    { attributes: { name: 'password', value: 'Vtracking2244@Qwer' } },
                    { attributes: { name: 'msisdn', value: msisdn } },
                    { attributes: { name: 'typeCheck', value: '2' } },
                ],
                rawData: ''
            }
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            else {
                //client.gwOperation.Input=args;
                //console.log(client.gwOperation.toString());
                client.gwOperation(args, function (err, result, opt, extraHeader) {
                    // console.log(err);
                    // console.log(result);
                    // console.log(opt);
                    // console.log(extraHeader);
                    // console.log('last request: ', client.lastRequest) ;
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    else {
                        // console.log(result);                                                    
                        xml2js.parseString(result.Result.original, function (err, res) {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            }
                            else {
                                var r_1 = res['S:Envelope']['S:Body'][0]['ns2:checkVtrackingResponse'][0].return[0];
                                //console.log(r);   
                                // r={ description: [ 'SUCCESS' ],
                                // responseCode: [ '0' ],  
                                // result:[''],
                                // typeCheck:['2']    
                                // }     
                                // ==> result
                                if (r_1.responseCode[0] === '0') {
                                    xml2js.parseString(r_1.result[0], function (errx, rx) {
                                        if (errx) {
                                            console.log(errx);
                                            deferred.reject(errx);
                                        }
                                        else {
                                            r_1.result = rx;
                                            // rx={ checkVtracking:
                                            //     { msisdn: [ '8562097299830' ],
                                            //       smsfreeBefore: [ '30' ],
                                            //       smsfreeAfter: [ '30' ],
                                            //       data2FreeBefore: [ '100570' ],
                                            //       data2FreeAfter: [ '100430' ],
                                            //       dateCharge: [ '2019-06-19 11:31:14.0' ] } 
                                            //     }
                                            console.log(JSON.stringify(r_1));
                                            deferred.resolve(r_1);
                                        }
                                    });
                                }
                                else {
                                    console.log(r_1);
                                    deferred.resolve(r_1);
                                }
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    };
    App.prototype.checkBalanceData = function (msisdn) {
        var deferred = Q.defer();
        var url = 'http://183.182.100.133:8999/BCCSGateway?wsdl';
        var args = {
            Input: {
                username: "a19bfa2be1695b1d6be5284fbd49f940",
                password: "8af183e295b15cd9118219dbb26911bd",
                wscode: "checkVtracking",
                param: [
                    { attributes: { name: 'username', value: 'vtracking' } },
                    { attributes: { name: 'password', value: 'Vtracking2244@Qwer' } },
                    { attributes: { name: 'msisdn', value: msisdn } },
                    { attributes: { name: 'typeCheck', value: "3" } },
                ],
                rawData: ''
            }
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            else {
                //client.gwOperation.Input=args;
                //console.log(client.gwOperation.toString());
                client.gwOperation(args, function (err, result, opt, extraHeader) {
                    // console.log(err);
                    // console.log(result);
                    // console.log(opt);
                    // console.log(extraHeader);
                    // console.log('last request: ', client.lastRequest) ;
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    else {
                        // console.log(result);                                                    
                        xml2js.parseString(result.Result.original, function (err, res) {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            }
                            else {
                                var r = res['S:Envelope']['S:Body'][0]['ns2:checkVtrackingResponse'][0].return[0];
                                console.log(r);
                                // r={ activeDate: [ '2017/02/28 07:25:31' ],
                                // basicBalance: [ '2' ],
                                // description: [ 'SUCCESS' ],
                                // freeSms: [ '30' ],
                                // prepaidPromotionBalance1: [ '0.0' ],
                                // prepaidPromotionBalance2: [ '0.0' ],
                                // promoTionFreeData1: [ '0' ],
                                // promoTionFreeData2: [ '100430' ],
                                // promoTionFreeData3: [ '0' ],
                                // responseCode: [ '0' ],
                                // serviceClassCode: [ 'LT-TRACKING' ] }                    
                                deferred.resolve(r);
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    };
    return App;
}());
exports.default = new App();
//# sourceMappingURL=unitel_api_module.js.map