import * as uuidV4 from 'uuid';
import * as Q from 'q';
import * as crypto from 'crypto';
import * as  soap from 'soap';
import * as xml2js from 'xml2js';
class App {
    checkStartEndPromotion(msisdn: string) {
        var deferred = Q.defer();
        const url = 'http://183.182.100.133:8999/BCCSGateway?wsdl';
        const args = {
            Input: {
                username: "a19bfa2be1695b1d6be5284fbd49f940",
                password: "8af183e295b15cd9118219dbb26911bd",
                wscode: "checkVtracking",
                param: [
                    { attributes: { name: 'username', value: 'vtracking' } },
                    { attributes: { name: 'password', value: 'Vtracking2244@Qwer' } },
                    { attributes: { name: 'msisdn', value: msisdn } },
                    { attributes: { name: 'typeCheck', value: '1' } },
                ]
                ,
                rawData: ''
            }
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            } else {
                //client.gwOperation.Input=args;
                //console.log(client.gwOperation.toString());
                client.gwOperation(args, (err: any, result: any, opt: any, extraHeader: any) => {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    } else {
                        // console.log(result);                                                    
                        xml2js.parseString(result.Result.original, (err, res) => {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            } else {
                                let r = res['S:Envelope']['S:Body'][0]['ns2:checkVtrackingResponse'][0].return[0];
                                console.log(r);
                                // r={ description: [ 'SUCCESS' ],
                                // endPromotion: [ '11/11/2019' ],
                                // msisdn: [ '8562097299830' ],
                                // responseCode: [ '0' ],
                                // startPromotion: [ '11/11/2018' ],
                                // typeCheck: [ '1' ] };                                               
                                deferred.resolve(r)
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    }
    checkSubscriberChargeDetails(msisdn: string) {
        var deferred = Q.defer();
        const url = 'http://183.182.100.133:8999/BCCSGateway?wsdl';
        const args = {
            Input: {
                username: "a19bfa2be1695b1d6be5284fbd49f940",
                password: "8af183e295b15cd9118219dbb26911bd",
                wscode: "checkVtracking",
                param: [
                    { attributes: { name: 'username', value: 'vtracking' } },
                    { attributes: { name: 'password', value: 'Vtracking2244@Qwer' } },
                    { attributes: { name: 'msisdn', value: msisdn } },
                    { attributes: { name: 'typeCheck', value: '2' } },
                ]
                ,
                rawData: ''
            }
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            } else {
                //client.gwOperation.Input=args;
                //console.log(client.gwOperation.toString());
                client.gwOperation(args, (err: any, result: any, opt: any, extraHeader: any) => {
                    // console.log(err);
                    // console.log(result);
                    // console.log(opt);
                    // console.log(extraHeader);
                    // console.log('last request: ', client.lastRequest) ;
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    } else {
                        // console.log(result);                                                    
                        xml2js.parseString(result.Result.original, (err, res) => {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            } else {
                                let r = res['S:Envelope']['S:Body'][0]['ns2:checkVtrackingResponse'][0].return[0];
                                //console.log(r);   
                                // r={ description: [ 'SUCCESS' ],
                                // responseCode: [ '0' ],  
                                // result:[''],
                                // typeCheck:['2']    
                                // }     
                                // ==> result
                                if(r.responseCode[0]==='0'){
                                    xml2js.parseString(r.result[0], (errx, rx) => {
                                        if (errx) {
                                            console.log(errx);
                                            deferred.reject(errx);
                                        } else {
                                            r.result = rx;
                                            // rx={ checkVtracking:
                                            //     { msisdn: [ '8562097299830' ],
                                            //       smsfreeBefore: [ '30' ],
                                            //       smsfreeAfter: [ '30' ],
                                            //       data2FreeBefore: [ '100570' ],
                                            //       data2FreeAfter: [ '100430' ],
                                            //       dateCharge: [ '2019-06-19 11:31:14.0' ] } 
                                            //     }
                                            console.log(JSON.stringify(r));
                                            deferred.resolve(r);
                                        }
                                    });
                                }else{
                                    console.log(r);
                                    deferred.resolve(r);
                                }
                                
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    }
    checkBalanceData(msisdn: string) {
        var deferred = Q.defer();
        const url = 'http://183.182.100.133:8999/BCCSGateway?wsdl';
        const args = {
            Input: {
                username: "a19bfa2be1695b1d6be5284fbd49f940",
                password: "8af183e295b15cd9118219dbb26911bd",
                wscode: "checkVtracking",
                param: [
                    { attributes: { name: 'username', value: 'vtracking' } },
                    { attributes: { name: 'password', value: 'Vtracking2244@Qwer' } },
                    { attributes: { name: 'msisdn', value: msisdn } },
                    { attributes: { name: 'typeCheck', value: "3" } },
                ]
                ,
                rawData: ''
            }
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            } else {
                //client.gwOperation.Input=args;
                //console.log(client.gwOperation.toString());
                client.gwOperation(args, (err: any, result: any, opt: any, extraHeader: any) => {
                    // console.log(err);
                    // console.log(result);
                    // console.log(opt);
                    // console.log(extraHeader);
                    // console.log('last request: ', client.lastRequest) ;
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    } else {
                        // console.log(result);                                                    
                        xml2js.parseString(result.Result.original, (err, res) => {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            } else {
                                let r = res['S:Envelope']['S:Body'][0]['ns2:checkVtrackingResponse'][0].return[0];
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
                                deferred.resolve(r)
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    }
    
    _responseCode = [
        { code: "-1", description: "Login information is not correct." },
        { code: "-2", description: "Internal IP address  not allowed " },
        { code: "11", description: "Not information subscriber " },
        { code: "00000", description: "Error get balance " },
        { code: "77", description: "Not exist isdn " },
        { code: "33", description: "No history charge detail" },
        { code: "-99", description: "Unhandled error, please contact administrator " },
        { code: "0", description: "Success" }];
    _errorCode = [
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


export default new App();
