///<reference path="../../node_modules/@types/jasmine/index.d.ts" />
/////<reference path="../../node_modules/@types/jquery/index.d.ts" />
/////<reference path="../../node_modules/@types/signalr/index.d.ts" />
//import { SignalrService } from './signalr.service';
//import { LocalStorageService } from './localStorage.service';
import { LocalStorageService, ConfigService, JsHelperService, SignalrService } from './index';
import { TestBed, inject } from '@angular/core/testing';
import { JwtToken, PhoneLineType, PhoneLineConnectionType } from '../models/index';
import { LocalStorageServiceMock } from './localStorage.service.mock';
//declare var cordova: any;

//import * as $ from 'jquery';
//import { SignalR } from '../../node_modules/@types/signalr';
//import 'signalr';

let jwtToken: JwtToken;

describe('SignalrService', () => {
    beforeEach(async () => {
        //let configService = new ConfigService();
        //let jsHelperService = new JsHelperService();
        //let localStorageService = new LocalStorageService();
        //let signalrService = new SignalrService(configService, jsHelperService, localStorageService);

        //await signalrService.startConnection();
        //let ip = await signalrService.requestIp();
        //await signalrService.setIp(ip);
        //let proxySecret = await signalrService.requestProxySecret(ip);
        //await signalrService.setProxySecret(proxySecret);
        //let email = "support@livevideomatch.com";
        //let password = "J@ck1234";
        //jwtToken = await signalrService.requestMemberToken(email, password);

        TestBed.configureTestingModule({
            providers: [
                { provide: LocalStorageService, useClass: LocalStorageServiceMock }, SignalrService, ConfigService, JsHelperService
            ]
        });
    });

    it('Should return true for expired token',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService) => {
            let expiredTimestamp = new Date().getTime() - (1000 * 31); // 31 seconds in the past
            let expired = new Date(expiredTimestamp);
            let jwtToken = new JwtToken();
            jwtToken[".expires"] = expired.toString();
            let result = await signalrService.isExpiredToken(jwtToken);
            expect(result === true).toBeTruthy();
        })
    );

    it('Should return false for none expired token',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService) => {
            let expiredTimestamp = new Date().getTime() + (1000 * 31); // 31 seconds in the future
            let expired = new Date(expiredTimestamp);
            let jwtToken = new JwtToken();
            jwtToken[".expires"] = expired.toString();
            let result = await signalrService.isExpiredToken(jwtToken);
            expect(result === false).toBeTruthy();
        })
    );

    it('Should init',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService) => {
            await signalrService.startConnection();
            await signalrService.init();

            console.log("should init proxySecret: ", signalrService.proxySecret);
            expect(typeof signalrService.proxySecret !== "undefined" && signalrService.proxySecret != "").toBeTruthy();
        })
    );

    //console.log("started test console output");

    it('Should have a connection id',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService) => {
            await signalrService.startConnection();
            //let connectionId = signalrService.connectionId;
            let connectionId = signalrService.connection.id;
            console.log("connectionId: " + connectionId);
            expect(connectionId !== "").toBeTruthy();
        })
    );

    it('Should NOT have a connection id',
        inject([SignalrService, ConfigService, JsHelperService], (signalrService) => {
            let connectionId = signalrService.connectionId;
            expect(connectionId === "").toBeTruthy();
        })
    );

    it('Should get an ip',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService) => {
            await signalrService.startConnection();
            let ip = await signalrService.requestIp();

            //let ip = signalrService.ip;
            console.log("got ip: ", ip);
            expect(ip !== "").toBeTruthy();
        })
    );

    it('Should get proxySecret',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService) => {
            //arrange
            await signalrService.startConnection();
            let ip = await signalrService.requestIp();
            await signalrService.setIp(ip);
            //let ip = signalrService.ip;
            //console.log("requestProxySecret ip: ", ip);
            let proxySecret = await signalrService.requestProxySecret(ip);
            //let proxySecret = signalrService.proxySecret;
            console.log("got proxySecret ", proxySecret);

            //assert
            expect(proxySecret !== "").toBeTruthy();
        })
    );

    // NOTE: only test as needed
    xit('Should get a phoneLine',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService, configService, jsHelperService) => {
            //arrange
            await signalrService.startConnection();
            let ip = await signalrService.requestIp();
            await signalrService.setIp(ip);
            let proxySecret = await signalrService.requestProxySecret(ip);
            await signalrService.setProxySecret(proxySecret);
            let email = "support@livevideomatch.com";
            await signalrService.setEmail(email);
            let password = "J@ck1234";
            let jwtToken: JwtToken = await signalrService.requestMemberToken(email, password);
            await signalrService.setAccessToken(jwtToken);
            let localGuid = await signalrService.webrtcHubCheckIn("jackie daniels");
            await signalrService.setLocalGuid(localGuid);
            //act
            let phoneLine: PhoneLineType = await signalrService.requestNewPhoneLine();
            //console.log("got jwtToken: ", jwtToken);
            //assert
            expect(phoneLine).toBeDefined();
            expect(phoneLine.phoneLineId > 0).toBeTruthy();
        })
    );

    // NOTE: only test as needed
    xit('Should get a phoneLineConnection',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService, configService, jsHelperService) => {
            //arrange
            await signalrService.startConnection();
            let ip = await signalrService.requestIp();
            await signalrService.setIp(ip);
            let proxySecret = await signalrService.requestProxySecret(ip);
            await signalrService.setProxySecret(proxySecret);
            let email = "support@livevideomatch.com";
            await signalrService.setEmail(email);
            let password = "J@ck1234";
            let jwtToken: JwtToken = await signalrService.requestMemberToken(email, password);
            await signalrService.setAccessToken(jwtToken);
            let localGuid = await signalrService.webrtcHubCheckIn("jackie daniels");
            await signalrService.setLocalGuid(localGuid);
            let phoneLine: PhoneLineType = await signalrService.requestNewPhoneLine();
            //act
            let phoneLineConnection: PhoneLineConnectionType = await signalrService.requestNewPhoneLineConnection(phoneLine.phoneLineGuid);
            console.log("got phoneLineConnection: ", phoneLineConnection);
            //assert
            expect(phoneLineConnection).toBeDefined();
            expect(phoneLineConnection.phoneLineConnectionId > 0).toBeTruthy();
        })
    );

    //// NOTE: only test when needed because it will create records in database
    //xit('Should make a call',
    //	inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService, configService, jsHelperService) => {
    //		//arrange
    //		let otherUserEmail = "support@liveVideoMatch.com";
    //		let callerName = "Jackie Daniels";
    //		await signalrService.startConnection();
    //		let ip = await signalrService.requestIp();
    //		await signalrService.setIp(ip);
    //		let proxySecret = await signalrService.requestProxySecret(ip);
    //		await signalrService.setProxySecret(proxySecret);
    //		let email = "support@livevideoconnector.com";
    //		await signalrService.setEmail(email);
    //		let jwtToken: JwtToken = await signalrService.requestGuestToken();
    //		await signalrService.setAccessToken(jwtToken);
    //		let localGuid = await signalrService.webrtcHubCheckIn(callerName);
    //		await signalrService.setLocalGuid(localGuid);
    //		let phoneLine: PhoneLineType = await signalrService.requestNewPhoneLine();
    //		let phoneLineConnection: PhoneLineConnectionType = await signalrService.requestNewPhoneLineConnection(phoneLine.phoneLineGuid);
    //		//act
    //		let result = await signalrService.makeCall(phoneLine.phoneLineGuid, otherUserEmail, callerName);
    //		console.log("makeCall results: ", result);
    //		//assert
    //		expect(jsHelperService.isEmpty(result)).toBeFalsy();
    //	})
    //);

    //// NOTE: only test when needed because it will create records in database
    //xit('Should send accept call',
    //	inject([SignalrService, ConfigService, JsHelperService], async (signalrService: SignalrService, configService, jsHelperService) => {
    //		//arrange

    //		let callerName = "Jackie Daniels";
    //		await signalrService.startConnection();
    //		let ip = await signalrService.requestIp();
    //		await signalrService.setIp(ip);
    //		let proxySecret = await signalrService.requestProxySecret(ip);
    //		await signalrService.setProxySecret(proxySecret);
    //		let email = "support@livevideomatch.com";
    //		await signalrService.setEmail(email);
    //		let password = "J@ck1234";
    //		let jwtToken: JwtToken = await signalrService.requestMemberToken(email, password);
    //		await signalrService.setAccessToken(jwtToken);
    //		let localGuid = await signalrService.webrtcHubCheckIn(callerName);
    //		await signalrService.setLocalGuid(localGuid);
    //		let phoneLine: PhoneLineType = await signalrService.requestNewPhoneLine();
    //		let phoneLineConnection: PhoneLineConnectionType = await signalrService.requestNewPhoneLineConnection(phoneLine.phoneLineGuid);
    //		// note sending accept to self for testing
    //		let remoteGuid = localGuid;
    //		//act
    //		let result = await signalrService.sendAcceptCall(phoneLine.phoneLineGuid, remoteGuid, callerName);
    //		console.log("send accept call results: ", result);
    //		//assert
    //		expect(result == remoteGuid).toBeTruthy();
    //	})
    //);

    // NOTE: only test as needed
    xit('Should get jwtToken',
        inject([SignalrService, ConfigService, JsHelperService], async (signalrService, configService, jsHelperService) => {
            //arrange
            await signalrService.startConnection();
            let ip = await signalrService.requestIp();
            await signalrService.setIp(ip);
            let proxySecret = await signalrService.requestProxySecret(ip);
            await signalrService.setProxySecret(proxySecret);
            let email = "williamTeddy@lvc.com";
            let password = "J@ck123";

            //act
            let jwtToken: JwtToken = await signalrService.requestMemberToken(email, password);
            //console.log("got jwtToken: ", jwtToken);
            //assert
            expect(jsHelperService.isEmpty(jwtToken.access_token) === false).toBeTruthy();
        })
    );

    xit('Should ouput fail error message',
        inject([SignalrService, ConfigService, JsHelperService], (signalrService) => {
            fail("this is an error test");
        })
    );

    xit(
        'Should not return null or undefined for clientIdHub',
        inject([SignalrService, ConfigService, JsHelperService], (signalrService) => {
            let clientIdHub = signalrService.clientIdHub;
            expect(clientIdHub !== null).toBeTruthy();
            expect(clientIdHub !== 'undefined').toBeTruthy();
            //expect(clientIdHub instanceof SignalR.Hub.Proxy).toBeTruthy();
        })
    );

    xit(
        'Should get clientIdHub',
        inject([SignalrService, ConfigService, JsHelperService], (signalrService) => {
        })
    );

    xit('should return a webRtcHub', () => {
        inject([SignalrService, ConfigService, JsHelperService], (signalrService) => {
            let webRtcHub = signalrService.webRtcHub;
            expect(webRtcHub).toBeNull();
            let clientIdHub = signalrService.clientIdHub;
            expect(clientIdHub).toBeTruthy();
            signalrService.startConnection()
                .then(function () {
                    let webRtcHub = signalrService.webRtcHub;
                    expect(webRtcHub).toBeDefined();
                })
                .catch(function () {
                    expect(false).toBeTruthy();
                });
        })
    }
    );
});