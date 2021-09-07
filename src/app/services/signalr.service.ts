////<reference path="../../../node_modules/@types/jquery/index.d.ts" />
////<reference path="../../../node_modules/@types/signalr/index.d.ts" />
// NOTE: use signalr.service for all requests that requires initial communications with the authorization server
// where the client_id is exchanged. The app will not store the client_id, the client_id is stored on
// the signalr server, which will act as a proxy between the app and the authorization server
import { Injectable } from '@angular/core';
declare let $:any;

import {
    ConfigService,
    JsHelperService,
    LocalStorageService
} from './index';
import {
    JwtToken,
    HubConnection,
    SignalrHttpResponseType,
    HttpStatusCodeEnum,
    AppWebRtcSettingType,
    //AppIceServerType,
    WebApiResponseType,
    WebApiResponseStatusType,
    WebApiType,

    PhoneLineType,
    PhoneLineConnectionType,
    //CallType,
    ObservableMessageType,
    PbxCallQueueDto,
    PbxLineRepDto,
    RequestNetcastStubType,
    HttpTypeEnum,
    AccessTokenErrorCodeEnum
} from '../models/index';
import { BehaviorSubject } from "rxjs";
import { AlertController } from '@ionic/angular';

@Injectable({providedIn:'root'})
export class SignalrService {
    //NOTE: this service is registered in the app.module.ts for injection, it will be like a singleton
    // available as one instance with in the app.module.ts scope

    constructor(
        private configService: ConfigService,
        private jsHelperService: JsHelperService,
        private localStorageService: LocalStorageService,
        private alertCtrl: AlertController,
    ) {
        
        this.connection = $.hubConnection(this.configService.hubUrl, {});
        // this.connection = $.connection(this.configService.hubUrl);
        this.webRtcHub = this.connection.createHubProxy(this.configService.webRtcHubProxyName);
        // this is required to activate the OnConnected(), OnDisconnected()
        // server methods. Here we just register a dummy client method to establish communications with hub
        // so the OnConnected() from signalr hub gets called
        this.webRtcHub.on("dummyConnection", function (message) {
            //console.log(message);
        });

        this.clientIdHub = this.connection.createHubProxy(this.configService.clientIdHubProxyName);
        this.clientIdHub.state.ip = "";

        // signalr connection state listeners
        this.connection.disconnected(() => {
            console.log("signalr.service.ts connection.disconnected");
            this.isReady = false;
        });

        this.connection.starting(() => {
            console.log("signalr.service.ts connection.starting");
        });

        this.connection.received((data: any) => {
            // NOTE: only turn this on for logging
            //console.log("signalr.service.ts connection.received data", data);
        });

        this.connection.connectionSlow(() => {
            console.log("signalr.service.ts connection.connectionSlow");
        });

        this.connection.reconnecting(() => {
            console.log("signalr.service.ts connection.reconnecting");
            this.isReady = false;
        });

        this.connection.reconnected(() => {
            console.log("signalr.service.ts connection.reconnected");
            this.isReady = true;
        });

        this.connection.disconnected(() => {
            console.log("signalr.service.ts connection.disconnected");
            this.isReady = false;
        })

        this.connection.stateChanged((stateChanged: SignalR.StateChanged) => {
            //console.log("signalr.service.ts connection.stateChanged stateChanged: ", stateChanged);
            //console.log(SignalR.ConnectionState.Connected)
            //let connectionState: SignalR.ConnectionStates;

            this.handleSignalrStateChange(stateChanged);


        });

        this.debugId = Date.now().toString();
    }

    debugId: string;

    _isReady: boolean;
    get isReady(): boolean {
        return this._isReady;
    }
    set isReady(value: boolean) {
        this._isReady = value;
    }

    //_proxySecret: string = "";
    async getProxySecret(): Promise<string> {
        //return this._proxySecret;
        return this.localStorageService.getItem(this.configService.keyProxySecret);
    }
    async setProxySecret(value: string): Promise<boolean> {
        //this._proxySecret = value;
        this.clientIdHub.state.proxySecret = value;
        return this.localStorageService.setItem(this.configService.keyProxySecret, value);
    }

    //async setProxySecret(proxySecret: string): Promise<void> {
    //    try {
    //        this.proxySecret = proxySecret;
    //        this.clientIdHub.state.proxySecret = proxySecret;
    //        return;
    //    }
    //    catch (e) {
    //        throw (e);
    //    }
    //}


    //setIp(ip: string): Promise<void> {
    //    // sets the ip for class and for clientIdHub.state.ip
    //    return new Promise<void>((resolve) => {
    //        this.ip = ip;
    //        this.clientIdHub.state.ip = ip;
    //        resolve();
    //    });
    //}

    //_ip: string = "";
    async getIp(): Promise<string> {
        //return this._ip;
        return this.localStorageService.getItem(this.configService.keyIp);
    }
    async setIp(value: string): Promise<boolean> {
        //this._ip = value;
        this.clientIdHub.state.ip = value;
        return this.localStorageService.setItem(this.configService.keyIp, value);
    }

    _connection: SignalR.Hub.Connection;
    get connection(): SignalR.Hub.Connection {
        return this._connection;
    }
    set connection(value: SignalR.Hub.Connection) {
        this._connection = value;
    }


    _webRtcHub: SignalR.Hub.Proxy;
    get webRtcHub(): SignalR.Hub.Proxy {
        // returns the hub proxy so the component can set listeners or invoke methods
        return this._webRtcHub;
    }
    set webRtcHub(value: SignalR.Hub.Proxy) {
        this._webRtcHub = value;
    }

    _clientIdHub: SignalR.Hub.Proxy;
    get clientIdHub(): SignalR.Hub.Proxy {
        return this._clientIdHub;
    }
    set clientIdHub(value: SignalR.Hub.Proxy) {
        this._clientIdHub = value;
    }

    _connectionId: string = "";
    get connectionId(): string {
        return this._connectionId;
    }
    set connectionId(value: string) {
        this._connectionId = value;
    }

    //_jwtToken: JwtToken;
    async getJwtToken(): Promise<JwtToken> {
        try {
            // try to get from permanent storage first, if not then from sessionstorage
            //let jwtToken: JwtToken = null;
            return await this.localStorageService.getItem(this.configService.keyJwtToken);
            //return jwtToken
            //if (this.jsHelperService.isEmpty(jwtToken) === false) {
            //	return jwtToken;
            //}
            //else {
            //	jwtToken = await this.localStorageService.getItem(this.configService.keyAccessTokenFile);
            //	return jwtToken;
            //}
        }
        catch (e) {
            //throw (e);
            console.log("getJwtToken error: ", e);
            return null;
        }

       
    }

    async setJwtToken(value: JwtToken): Promise<boolean> {
        return this.localStorageService.setItem(this.configService.keyJwtToken, value);
    }

   //async set jwtToken(value: JwtToken) {
   //     this._jwtToken = value;
   // }


    handleSignalrStateChange(stateChanged: SignalR.StateChanged): void {

        
        console.log("handling Signalr new StateChange: ", stateChanged);

        switch (stateChanged.newState) {
            case (0): this.isReady = false; break; // connecting
            case (2): this.isReady = false; break; // reconnecting
            case (4): this.isReady = false; break; // disconnected
            case (1): this.isReady = true; break; // connected
            default: this.isReady = false;
        }
    }

    //private async deleteJwtToken(): Promise<boolean> {
    //	return this.localStorageService.removeItem(this.configService.keyAccessTokenFile);
    //}
    

    //private async setSessionJwtToken(value: JwtToken): Promise<boolean> {
    //	return this.localStorageService.setItem(this.configService.keyAccessTokenFile, value, true);
    //}
    //private async deleteSessionJwtToken(): Promise<boolean> {
    //	return this.localStorageService.removeSessionItem(this.configService.keyAccessTokenFile, true);
    //}

    async getRememberMe(): Promise<boolean> {
        return this.localStorageService.getItem(this.configService.keyRememberMe);
    }

    async setRememberMe(value: boolean): Promise<boolean> {
        return this.localStorageService.setItem(this.configService.keyRememberMe, value);
    }

    _localGuid: string;
    get localGuid(): string {
        return this._localGuid;
    }

    set localGuid(value: string) {
        this._localGuid = value;
    }

    setLocalGuid(value: string): void {
        this.webRtcHub.state.connectionGuid = value;
        this.localGuid = value;
    }

    //async getLocalGuid(): Promise<string> {
    //    return this.localStorageService.getItem(this.configService.keyLocalGuid);
    //}
    //async setLocalGuid(value: string): Promise<boolean> {
    //    this.webRtcHub.state.connectionGuid = value;
    //    return this.localStorageService.setItem(this.configService.keyLocalGuid, value);
    //}

    async getMemberId(): Promise<string> {
        let key = this.configService.keyMemberId;
        return this.localStorageService.getItem(key);
    }
    async setMemberId(value: string): Promise<boolean> {
        let key = this.configService.keyMemberId;
        return this.localStorageService.setItem(key, value);
    }

    async getAccessToken(): Promise<string> {
        // this will always return an accessToken
        // will get token and check if its expired and renew if needed and return accessToken
        let jwtToken: JwtToken;
        try {
            jwtToken = await this.getJwtToken();
            console.log("signalrService getAccessToken jwtToken: ", jwtToken);
            if (this.jsHelperService.isEmpty(jwtToken)) {
                try {
                    jwtToken = await this.getNewGuestToken();

                    this.setAccessToken(jwtToken);
                    return jwtToken.access_token;
                }
                catch (e) {
                    //throw ("Unable to request authentication credentials.");
                    console.log("signalr.service.getAccessToken() this.jwtToken is empty,  getNewGuestToken error: ", e);
                    //throw ("Unable to request authentication credentials.");
                    throw (AccessTokenErrorCodeEnum.getNewGuestTokenError);
                }
            }
            else if (this.jsHelperService.isExpiredToken(jwtToken)) {
                try {

                    let memberId = this.jsHelperService.getMemberId(jwtToken.access_token);
                    if (this.jsHelperService.isEmpty(memberId)) {
                        // currently only one guest token can be used
                        // so get a new one
                        try {
                            jwtToken = await this.getNewGuestToken();
                        }
                        catch (e) {
                            console.log("signalr.service.getAccessToken() expired token getNetGuestToken error: ", e);
                            throw (AccessTokenErrorCodeEnum.getNewGuestTokenError);
                        }
                    }
                    else {
                        // member tokens can be renewed
                        try {
                            jwtToken = await this.renewToken(jwtToken);
                        }
                        catch (e) {
                            console.log("signalr.service.getAccessToken() expired token renew member token error: ", e);
                            throw (AccessTokenErrorCodeEnum.renewTokenError);
                        }
                    }
                    this.setAccessToken(jwtToken);
                    return jwtToken.access_token;
                }
                catch (e) {
                    //throw ("Access denied, unable to renew authenication credentials.");
                    console.log("getAccessToken expired token error: ", e)
                    //throw ("Access denied, unable to renew authenication credentials.");
                    throw (e);
                }
            }
            else {
                //let isAccessTokenReady: boolean = await this.isAccessTokenReady();

                //if (isAccessTokenReady === false) {
                //    this.webRtcHub.state.accessToken = jwtToken.access_token;
                //}

                if (this.jsHelperService.isEmpty(this.webRtcHub.state.accessToken)) {
                    this.webRtcHub.state.accessToken = jwtToken.access_token;
                }
                console.log('jwtToken.access_token',jwtToken.access_token)
                return jwtToken.access_token;
            }
        }
        catch (e) {

            console.log("signalr.getAccessToken error: ", e);

            throw (e);

            //console.log("signalr.getAccessToken error: ", e);
            //this.localStorageService.removeAllItems();
            //return null;
            //throw (e);
        }
    }


    async setAccessToken(jwtToken: JwtToken): Promise<boolean> {
        // renamed from setJwtToken to setAccessToken
        //console.log("signalrService setAccessToken jwtToken: ", jwtToken);
        try {
            this.webRtcHub.state.accessToken = jwtToken.access_token;
            //let rememberMe = await this.getRememberMe();
            await this.setJwtToken(jwtToken);

            return true;
        }
        catch (e) {
            throw (e);
        }
    }

    //_email: string;
    async getEmail(): Promise<string> {
        //return this._email;
        return this.localStorageService.getItem(this.configService.keyUserEmail);
    }
    async setEmail(value: string) {
        //this._email = value;
        this.webRtcHub.state.email = value;
        return this.localStorageService.setItem(this.configService.keyUserEmail, value);
    }

    //setEmail(email: string): Promise<void> {
    //    // NOTE: set email is required, members an guests have to set their webRtcHub.state.email as
    //    // soon as the app aquires the users email
    //    return new Promise<void>((resolve) => {
    //        this.webRtcHub.state.email = email;
    //        this.email = email;
    //        resolve();
    //    })
    //}

    async unsetEmail(): Promise<void> {
        
        this.webRtcHub.state.email = "";
        await this.setEmail("");
           
    }

    async init(): Promise<void> {
        try {
            //await this.startConnection();
            let ip = await this.requestIp();
            await this.setIp(ip);
            // console.log("proxySecret: ", ip);
            let proxySecret = await this.requestProxySecret(ip);
            await this.setProxySecret(proxySecret);
            //let jwtToken = await this.getNewGuestToken();
            // console.log("jwtToken: ", proxySecret);
            //this.setAccessToken(jwtToken);
            //console.log("signalr.service.ts after init() webRtcHub: ", this.webRtcHub);
            //console.log("signalr.service.ts after init() clientIdHub: ", this.clientIdHub);
        }
        catch (e) {
            console.log("signlar.init error:", e);
            throw (e);
        }
    }


    async startConnection(): Promise<void> {
        // this class should call startConnection at least once during startup before
        // we can use webRtcHub and clientIdHub
        console.log("signalr.service.ts startConnection()");
        try {
            await this.connection.start();
            //this.connectionId = this.connection.id;
            //return this.ensureConnection();
        }
        catch (e) {
            console.log("signalr startConnection error: ", e);
            throw (e)
        }
    }

    isSignalrConnected(): boolean {
        return this.connection.state === SignalR.ConnectionState.Connected
            || this.connection.state === SignalR.ConnectionState.Connecting
            || this.connection.state === SignalR.ConnectionState.Reconnecting;
    }

    async isProxySecretReady(): Promise<boolean> {
        let proxySecret: string = await this.getProxySecret();
        return this.jsHelperService.isEmpty(this.clientIdHub.state.proxySecret) === false && this.jsHelperService.isEmpty(proxySecret) === false ? true : false;
    }

    async isHubConnectionValid(accessToken: string): Promise<boolean> {
        // checks the database to see if the user has an entry in HubConnection table
        // using the localGuid and the entry is not marked isDeleted
        try {
            if (this.jsHelperService.isEmpty(this.localGuid)) {
                // NOTE: localGuid is an in memory variable. once a page is reloaded it disappears
                return false;
            }
            else {
                let payload = null
                let url = this.configService.webApiBase + `Db/GetHubConnectionByGuid/${this.localGuid.toUpperCase()}/`;
                let hubConnection: HubConnection = await this.jsHelperService.ajaxRequestParsed<HubConnection>(HttpTypeEnum.get, url, payload, accessToken);
                if (this.jsHelperService.isEmpty(hubConnection)) {
                    return false;
                }
                else {
                    return hubConnection.isConnected === true && hubConnection.isDeleted === false;
                }
            }
        }
        catch (e) {
            console.log("isHubConnectionValid error: ", e);
            return false;
        }
    }

    isHubConnectionReady(): boolean {
        return this.jsHelperService.isEmpty(this.webRtcHub.state.connectionGuid) === false && this.jsHelperService.isEmpty(this.localGuid) === false ? true : false;
    }

    async isAccessTokenReady(): Promise<boolean> {
        //return this.jsHelperService.isEmpty(this.webRtcHub.state.accessToken) ? false : true;
        let jwtToken: JwtToken = await this.getJwtToken();
        // console.log('jwtToken:', jwtToken);
        return this.jsHelperService.isEmpty(this.webRtcHub.state.accessToken) === false && this.jsHelperService.isEmpty(jwtToken) === false ? true : false;
    }

    async isEmailReady(): Promise<boolean> {
        //return this.jsHelperService.isEmpty(this.webRtcHub.state.email) ? false : true;
        let email = await this.getEmail();
        return this.jsHelperService.isEmpty(email) === false && this.jsHelperService.isEmpty(this.webRtcHub.state.email) === false ? true : false;
    }

    async getGeneratedEmail(): Promise<string> {
        try {
            let response = await this.clientIdHub.invoke("getGeneratedEmail");
            let signalrHttpResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrHttpResponse) === false && signalrHttpResponse.statusCode === HttpStatusCodeEnum.ok) {
                let email = signalrHttpResponse.content;
                return email;
            }
            else {
                throw (this.jsHelperService.stringify(signalrHttpResponse));
            }
        }
        catch (e) {
        }
    }

    requestIp(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
           this.clientIdHub.invoke("requestIp")
                .then((response) => {
                    //console.log("requestIp response: ", response);
                    let signalrHttpResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response)
                    if (this.jsHelperService.isEmpty(signalrHttpResponse) === false && signalrHttpResponse.statusCode === HttpStatusCodeEnum.ok) {
                        let ip = signalrHttpResponse.content;
                        resolve(ip);
                    }
                    else {
                        reject(this.jsHelperService.stringify(signalrHttpResponse));
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    requestProxySecret(ip: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let verificationSecret = this.jsHelperService.createHash(ip);
            // console.log("verificationSecret:", verificationSecret);
          this.clientIdHub.invoke('requestProxySecret', verificationSecret)
                .then((response) => {
                    // console.log("requestProxySecret response:", response);
                    let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response)
                    if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                        let proxySecret = signalrResponse.content;
                        resolve(proxySecret);
                    }
                    else {
                        reject(response);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }


    requestGuestToken(): Promise<JwtToken> {
        // will try to get guestToken from localStoreage, and get an new one if there isn't one in localstorage
        return new Promise<JwtToken>((resolve, reject) => {
            //use existing guesttoken first
            this.localStorageService.getItem(this.configService.guestTokenFilename)
                .then((jwtToken: JwtToken) => {
                    if (this.isExpiredToken(jwtToken) === true) {
                        //renew token
                        //return this.renewToken(jwtToken);
                        return null
                    }
                    else {
                        //use existing token
                        return jwtToken;
                    }
                })
                .then((jwtToken: JwtToken) => {
                    if (this.jsHelperService.isEmpty(jwtToken)) {
                        return this.getNewGuestToken();
                    }
                    else {
                        return jwtToken;
                    }
                })
                .then((jwtToken: JwtToken) => {
                    resolve(jwtToken);
                })
                .catch(() => {
                    //get a new guest token if any errors occur
                    this.getNewGuestToken()
                        .then((jwtToken) => { resolve(jwtToken); })
                        .catch((error) => { reject(error); })
                });
        });
    }


    getNewGuestToken(): Promise<JwtToken> {
        // will get a new guest token each time
        return new Promise<JwtToken>((resolve, reject) => {
            //console.log("request new guest token");
            this.clientIdHub.invoke("requestGuestToken")
                .then((response) => {
                    //console.log("signalr.service.ts getNewGuestToken() response: ", response);
                    let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
                    if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                        if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                            let jwtToken: JwtToken = this.jsHelperService.jsonToObject<JwtToken>(signalrResponse.content, true);
                            //console.log("signalr.service.ts getNewGuestToken() jwtToken: ", jwtToken);
                            if (this.jsHelperService.isEmpty(jwtToken) === false && this.jsHelperService.isEmpty(jwtToken.access_token) === false) {
                                resolve(jwtToken);
                            }
                            else {
                                reject("unable to parse guest token");
                            }
                        }
                        else {
                            reject("request rejected by server response: " + response);
                        }
                    }
                    else {
                        reject("empty signalr response: " + response);
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    //NOTE: after you renew a token, you need call setAccessToken
    renewToken(jwtToken: JwtToken): Promise<JwtToken> {
        //console.log("signalr.service.ts renewToken() renewing jwtToken: ", jwtToken);
        return new Promise<JwtToken>((resolve, reject) => {
            let refreshToken = jwtToken.refresh_token;
            //console.log("signalr.service.ts renewToken() using refreshToken: ", refreshToken);
            this.clientIdHub.invoke("renewToken", { Id: refreshToken })
                .then((response) => {
                    //console.log("signalr.service.ts renewToken() response: ", response);
                    let singalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response)
                    if (this.jsHelperService.isEmpty(singalrResponse) === false) {
                        if (singalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                            let json = singalrResponse.content;
                            let jwtToken: JwtToken = this.jsHelperService.jsonToObject<JwtToken>(json, true);
                            if (this.jsHelperService.isEmpty(jwtToken) === false && this.jsHelperService.isEmpty(jwtToken.access_token) === false) {
                                resolve(jwtToken);
                            }
                            else {
                                reject("unable to parse jwtToken" + this.jsHelperService.stringify(jwtToken));
                            }
                        }
                        else {
                            reject("signalr.service.ts renewToken() request denied: " + this.jsHelperService.stringify(singalrResponse));
                        }
                    }
                    else {
                        reject("signalr.service.ts renewToken() unable to parse signalr response: " + response);
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    requestMemberToken(email: string, password: string): Promise<JwtToken> {
        return new Promise<JwtToken>((resolve, reject) => {
            this.clientIdHub.invoke("requestMemberToken", { Email: email, Password: password })
                .then((response) => {
                    //console.log("requestMemberToken response: ", response);
                    let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
                    if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                        let jwtToken: JwtToken = this.jsHelperService.jsonToObject<JwtToken>(signalrResponse.content);
                        if (this.jsHelperService.isEmpty(jwtToken) === false && this.jsHelperService.isEmpty(jwtToken.access_token) === false) {
                            //console.log("requestMemberToken got jwtToken: ", jwtToken);
                            resolve(jwtToken);
                        }
                        else {
                            reject("Expected jwtToken is empty or missing accees_token property");
                        }
                    }
                    else {
                        reject(this.jsHelperService.stringify(response));
                    }
                })
                .catch((error) => {
                    reject('Error during clientIdHub.invoke("requestMemberToken")');
                });
        });
    }

    //async tryGetJwtToken(): Promise<JwtToken> {

        
    //    return new Promise<JwtToken>((resolve, reject) => {
    //        let jwtToken = this.jwtToken;
    //        if (this.jsHelperService.isEmpty(jwtToken)) {
    //            reject("Unable to get jwtToken");
    //        }
    //        else {
    //            resolve(jwtToken);
    //        }
    //    });
    //}



    async webrtcHubCheckOut(): Promise<void> {
        // webrtcHubCheckOut
        try {
            //console.log("connectionID: ", this.connection.id);
            //console.log('webRtcHub.invoke("checkout")', this.webRtcHub);
            let response = await this.webRtcHub.invoke("checkout");
            //console.log("webrtcHubCheckOut() response: ", response);
            var signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false
                && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                return;
            }
            else {
                throw ("Unable to parse server response");
            }
        }
        catch (e) {
            throw (e);
        }
    }



    async webrtcHubCheckIn(displayName?: string): Promise<string> {
        // webrtcHubCheckIn
        try {
            displayName = this.jsHelperService.isEmpty(displayName) ? "" : displayName;
            let response = await this.webRtcHub.invoke("checkin", displayName);
            //console.log("webrtcHubCheckIn response: ", response);
            let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                let hubConnection: HubConnection = this.jsHelperService.jsonToObject<HubConnection>(signalrResponse.content, true);
                if (this.jsHelperService.isEmpty(hubConnection) === false && this.jsHelperService.isEmpty(hubConnection.connectionGuid) === false) {
                    let connectionGuid = hubConnection.connectionGuid;
                    return connectionGuid;
                }
                else {
                    throw ("Unable to parse server response");
                }
            }
            else {
                throw ("webRtcHub CheckIn error:" + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async pbxRepCheckIn(pbxLineRepId: string): Promise<Array<PbxCallQueueDto>> {
        try {
            let response = await this.webRtcHub.invoke("PbxRepCheckIn", pbxLineRepId);
            //console.log("pbxRepCheckIn response: ", response);
            let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                let pbxCallQueues: Array<PbxCallQueueDto> = this.jsHelperService.jsonToObject<Array<PbxCallQueueDto>>(signalrResponse.content, true);
                return pbxCallQueues;
            }
            else {
                throw ("Unable to check user into Pbx Line");
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async pbxRepCheckOut(pbxLineRepId: string): Promise<void> {
        try {
            let response = await this.webRtcHub.invoke("PbxRepCheckOut", pbxLineRepId);
            let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                return;
            }
            else {
                throw ("webRtcHub PbxRepCheckOut error:" + response);
            }

            //this.tryGetJwtToken()
            //	.then((jwtToken: JwtToken) => {
            //		return this.webRtcHub.invoke("PbxCheckIn", pbxLineRepId)
            //	})
            //	.then((response) => {
            //		//console.log("checked in: ", response);
            //		let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            //		if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
            //			let pbxLineRepStatusDto: PbxLineRepStatusDto = this.jsHelperService.jsonToObject<PbxLineRepStatusDto>(signalrResponse.content, true);
            //			if (this.jsHelperService.isEmpty(pbxLineRepStatusDto) === false) {
            //				resolve(pbxLineRepStatusDto);
            //			}
            //			else {
            //				reject("Unable to parse response");
            //			}
            //		}
            //		else {
            //			reject("webRtcHub PbxCheckIn error:" + response);
            //		}
            //	})
            //	.catch((error) => {
            //		reject(error);
            //	});
        }
        catch (e) {
            throw (e);
        }
    }

    async pbxOtherRepCheckIn(pbxLineId: number, pbxLineRepId: number): Promise<PbxLineRepDto> {
        try {
            let response = await this.webRtcHub.invoke("PbxOtherRepCheckIn", pbxLineId, pbxLineRepId);
            //console.log("response: ", response);
            let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                let pbxLineRepDto: PbxLineRepDto = this.jsHelperService.jsonToObject<PbxLineRepDto>(signalrResponse.content, true);
                if (this.jsHelperService.isEmpty(pbxLineRepDto) === false) {
                    return pbxLineRepDto;
                }
                else {
                    throw ("Unable to parse response");
                }
            }
            else {
                throw ("webRtcHub PbxOtherRepCheckIn error:" + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async pbxOtherRepCheckOut(pbxLineRepId: number): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("PbxOtherRepCheckOut", pbxLineRepId);
            //console.log("response: ", response);
            let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                let content: string = signalrResponse.content;

                return content;
            }
            else {
                throw ("webRtcHub PbxOtherRepCheckOut error:" + response);
            }
        }
        catch (e) {
        }
    }

    async pbxCustomerCheckIn(pbxLineId: number, name: string): Promise<PbxCallQueueDto> {
        try {
            let response = await this.webRtcHub.invoke("PbxCustomerCheckIn", pbxLineId, name);
            //console.log("response: ", response);
            let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                let pbxCallQueueDto: PbxCallQueueDto = this.jsHelperService.jsonToObject<PbxCallQueueDto>(signalrResponse.content, true);
                if (this.jsHelperService.isEmpty(pbxCallQueueDto) === false) {
                    return pbxCallQueueDto;
                }
                else {
                    throw ("Unable to parse response");
                }
            }
            else {
                throw ("webRtcHub PbxCustomerCheckIn error:" + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async pbxCustomerCheckOut(pbxCallQueueId: number): Promise<string> {
        console.log("customer checkout pbxCallQueueId: ", pbxCallQueueId);
        try {
            let response = await this.webRtcHub.invoke("PbxCustomerCheckOut", pbxCallQueueId);
            console.log("response: ", response);
            let signalrResponse = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false && signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                let content: string = signalrResponse.content;

                return content;
            }
            else {
                throw ("webRtcHub PbxCustomerCheckOut error:" + response);
            }
        }
        catch (e) {
        }
    }

    async pagePbxlineReps(pbxCallQueueId: number, accessToken: string): Promise<void> {
        try {
            let url = this.configService.pbxController + "PagePbxlineReps/" + pbxCallQueueId.toString() + "/";
            let payload = null;
            await this.jsHelperService.ajaxRequestParsed<string>("GET", url, payload, accessToken)
            return;
        } catch (e) {
            throw (e);
        }
    }



  



    unsetLocalGuid(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.webRtcHub.state.connectionGuid = "";
            resolve();
        });
    }

    isExpiredToken(jwtToken: JwtToken, timeDifference?: number) {
        // NOTE: timeDifference is in seconds
        if (this.jsHelperService.isEmpty(timeDifference)) {
            timeDifference = 30;
        }
        let isExpired = true;
        if (!this.jsHelperService.isEmpty(jwtToken)) {
            let expiredString = jwtToken[".expires"];
            if (!this.jsHelperService.isEmpty(expiredString)) {
                let now = new Date();
                let expire = new Date(expiredString);

                let expireTime = Math.abs(expire.getTime() / 1000);
                let nowTime = Math.abs(now.getTime() / 1000);

                let diffSeconds = expireTime - nowTime;

                console.log("signalr.service.ts isExpiredToken() " + jwtToken.refresh_token + ": diffSeconds: ", diffSeconds);

                //console.log("diffSeconds: ", diffSeconds);
                //var timeDiff = Math.abs(expire.getTime() - now.getTime());
                //var diffSeconds = Math.ceil(timeDiff / (1000));
                if (diffSeconds > timeDifference) {
                    isExpired = false;
                }
            }
        }

        return isExpired;
    }

    retrieveWebRtcSettings(id: string, accessToken: string): Promise<AppWebRtcSettingType> {
        let methodName = "retrieveWebRtcSettings";
        return new Promise<AppWebRtcSettingType>((resolve, reject) => {
            let url: string = "https://nofb.org/LNVApi/Member/RetrieveWebRtcSettings";
            let method = "POST";
            //accessToken = this.jsHelperService.isEmpty(accessToken) ? this.jwtToken.access_token : accessToken;
            let payload: any = {
                Id: id
            }

            this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
                .then((response) => {
                    let result: AppWebRtcSettingType = this.jsHelperService.parseWebApiResponse<AppWebRtcSettingType>(response);
                    if (this.jsHelperService.isEmpty(result) === false) {
                        return resolve(result);
                    }
                    else {
                        reject("getBlockedEmails: unable to parse webApiResponseType.");
                    }

                    let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
                    if (this.jsHelperService.isEmpty(apiResponse) === false) {
                        if (apiResponse.status === WebApiResponseStatusType.success) {
                            let result: AppWebRtcSettingType = this.jsHelperService.jsonToObject<AppWebRtcSettingType>(apiResponse.data, true);
                            return resolve(result);
                        }
                        else {
                            let errors: Array<string> = this.jsHelperService.tryParseJson(apiResponse.data);
                            reject(methodName + " errors: " + this.jsHelperService.implode(" |", errors));
                        }
                    }
                    else {
                        reject(methodName + ": unable to parse webApiResponseType.");
                    }
                })
                .catch((error) => {
                    //console.log(error);
                    return reject(methodName + ": ajax request failed.");
                });
        });
    }

    requestWebApiWithClientId(clientId: string, accessToken: string): Promise<WebApiType> {
        let methodName = "isEmailUnique";
        return new Promise<WebApiType>((resolve, reject) => {
            let url: string = "https://nofb.org/LNVApi/Member/RequestWebApiWithClientId";
            let method = "POST";
            //accessToken = this.jsHelperService.isEmpty(accessToken) ? this.jwtToken.access_token : accessToken;
            let payload: any = {
                Id: clientId
            }

            this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
                .then((response) => {
                    let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
                    if (this.jsHelperService.isEmpty(apiResponse) === false) {
                        if (apiResponse.status === WebApiResponseStatusType.success) {
                            let result: WebApiType = this.jsHelperService.jsonToObject<WebApiType>(apiResponse.data, true);
                            return resolve(result);
                        }
                        else {
                            let errors: Array<string> = this.jsHelperService.tryParseJson(apiResponse.data);
                            reject(methodName + ": " + this.jsHelperService.implode(" |", errors));
                        }
                    }
                    else {
                        reject(methodName + ": unable to parse webApiResponseType.");
                    }
                })
                .catch((error) => {
                    //console.log(error);
                    return reject(methodName + ": ajax request failed.");
                });
        });
    }

    async requestNewGuid(): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("requestNewGuid");
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let result: string = signalrResponse.content;
                    return result;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async requestGuid(email: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("requestGuid", email);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let result: string = signalrResponse.content;
                    return result;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
        }
    }

    async sendSystemMessage(remoteGuid: string, message: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("sendSystemMessage", remoteGuid, message);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let systemMessage = signalrResponse.content;
                    // NOTE: systemMessage is suppose to be a predefined json string which needs to be parsed into an object
                    // by the system, the object should identify the system message type
                    // and perform an action based on the message type received
                    return systemMessage;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async requestNetcast(remoteGuid: string, message: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("requestNetcast", remoteGuid, message);
            console.log("requestNetcast response: ", response);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            console.log("requestNetcast signalrResponse: ", signalrResponse);

            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let response = signalrResponse.content;
                    return response;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async requestPCOnly(remoteGuid: string, message: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("requestPCOnly", remoteGuid, message);
            console.log("requestPCOnly response: ", response);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            console.log("requestPCOnly signalrResponse: ", signalrResponse);

            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let response = signalrResponse.content;
                    return response;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async requestPCStream(remoteGuid: string, message: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("requestPCStream", remoteGuid, message);
            console.log("requestPCStream response: ", response);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            console.log("requestPCStream signalrResponse: ", signalrResponse);

            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let response = signalrResponse.content;
                    return response;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }


    async sendBusyResponse(remoteGuid: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendBusyResponse", remoteGuid);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendPrivateSmsMessage(message: string, remoteGuid: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("sendPrivateSmsMessage", message, remoteGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let remoteGuid = signalrResponse.content;
                    return remoteGuid;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendGroupSmsMessage(message: string, phoneLineGuid: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("sendGroupSmsMessage", message, phoneLineGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLineGuid = signalrResponse.content;
                    return phoneLineGuid;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendHangUpNotice(phoneLineGuid: string): Promise<void> {
        try {
            let response = await this.webRtcHub.invoke("sendHangUpNotice", phoneLineGuid);
            //console.log("signalr.service sendHangUpNotice response: ", response);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    signalrResponse.content;
                    return;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendRepHangUpNotice(phoneLineGuid: string): Promise<void> {
        try {
            let response = await this.webRtcHub.invoke("sendRepHangUpNotice", phoneLineGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    signalrResponse.content;
                    return;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendNotAcceptCall(remoteGuid: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendNotAcceptCall", remoteGuid);
            return;
            //this.tryGetJwtToken()
            //	.then((jwtToken: JwtToken) => {
            //		return
            //	})
            //	.then(() => {
            //		resolve();
            //	})
            //	.catch((error) => {
            //		reject(methodName + " error during signalr request." + this.jsHelperService.stringify(error));
            //	});
        }
        catch (e) {
            throw (e);
        }
    }

    async sendReadyForCall(remoteGuid: string): Promise<void> {
        try {
            //console.log("signalrService.ts.sendReadyForCall() start");
            let response = await this.webRtcHub.invoke("sendReadyForCall", remoteGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    //let call: CallType = this.jsHelperService.jsonToObject<CallType>(signalrResponse.content, true);
                    //resolve(call);
                    //let remoteGuid = signalrResponse.content;
                    return;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendNotReadyForCall(errorMessage: string, remoteGuid: string): Promise<void> {
        try {
            let response = await this.webRtcHub.invoke("sendNotReadyForCall", errorMessage, remoteGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    //let remoteGuid = signalrResponse.content;
                    return;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendPutOnHold(remoteGuid: string): Promise<void> {
        try {
            //console.log("signalrService.ts.sendPutOnHold() start");
            let response = await this.webRtcHub.invoke("sendPutOnHold", remoteGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    //let remoteGuid = signalrResponse.content;
                    return;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendRemoveOnHold(remoteGuid: string): Promise<void> {
        try {
            let response = await this.webRtcHub.invoke("sendRemoveOnHold", remoteGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    //let remoteGuid = signalrResponse.content;
                    return;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }



    async cancelCall(email: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("sendCancelInvitation", email);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let remoteGuid: string = signalrResponse.content;
                    return remoteGuid;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendPhoneLineInvitation(phoneLineGuid: string, otherUserEmail: string, callerName: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("sendPhoneLineInvitation", phoneLineGuid, otherUserEmail, callerName);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    //let call: CallType = this.jsHelperService.jsonToObject<CallType>(signalrResponse.content, true);
                    //resolve(call);
                    let remoteGuid = signalrResponse.content;
                    return remoteGuid;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }



    async sendAcceptPhoneLineInvitation(remoteGuid: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("sendAcceptPhoneLineInvitation", remoteGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let remoteGuid = signalrResponse.content;
                    return remoteGuid;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendAreYouReadyForCall(localPhoneLineConnectionId: number, remoteGuid: string): Promise<HubConnection> {
        try {
            let response = await this.webRtcHub.invoke("sendAreYouReadyForCall", localPhoneLineConnectionId, remoteGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let hubConnection: HubConnection = this.jsHelperService.jsonToObject<HubConnection>(signalrResponse.content, true);
                    return hubConnection;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content, true);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendRemoteGuidUpdate(remoteGuid: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendRemoteGuidUpdate", remoteGuid);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendSDP(remoteGuid: string, sdp: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendSDP", remoteGuid, sdp);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async broadcastDisconnectedAsync(message: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("broadcastDisconnected", message);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    broadcastDisconnected(message: string): void {
        try {
            this.webRtcHub.invoke("broadcastDisconnected", message);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendICE(remoteGuid: string, ice: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendICE", remoteGuid, ice);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendDisconnect(remoteGuid: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendDisconnect", remoteGuid);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendPing(remoteGuid: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendPing", remoteGuid);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendPingResponse(remoteGuid: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendPingResponse", remoteGuid);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendKeepAlive(email: string, connectionId): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendKeepAlive", email, connectionId);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendNetcastStub(remoteGuid: string): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendNetcastStub", remoteGuid);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async sendRequestNetcastStub(remoteGuid: string, re: RequestNetcastStubType): Promise<void> {
        try {
            await this.webRtcHub.invoke("sendRequestNetcastStub", remoteGuid, this.jsHelperService.stringify(re));
            return;
        }
        catch (e) {
            throw (e);
        }
    }




    async sendPbxCallQueueNotes(queue: PbxCallQueueDto, remoteGuid: string): Promise<void> {
        // PBX
        try {
            let response = await this.webRtcHub.invoke("sendPbxCallQueueNotes", queue, remoteGuid);
            //console.log("signalrService.sendPbxCallQueueNotes response n queue: ", response, queue);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    return;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async sendPbxPhoneLineInvitation(phoneLineGuid: string, pbxLineRepId: number, otherUserEmail: string, callerName: string): Promise<string> {
        try {
            let response = await this.webRtcHub.invoke("sendPbxPhoneLineInvitation", phoneLineGuid, pbxLineRepId, otherUserEmail, callerName);
            //console.log("signalr.service.ts sendPbxPhoneLineInvitation response: ", response);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    //let call: CallType = this.jsHelperService.jsonToObject<CallType>(signalrResponse.content, true);
                    //resolve(call);
                    let remoteGuid = signalrResponse.content;
                    return remoteGuid;
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw ("Unable to parse response: " + response);
            }
        }
        catch (e) {
            throw (e);
        }
    }


    

    // #region PhoneLine 
    async getPhoneLineById(id: number): Promise<PhoneLineType> {
        try {
            let response = await this.webRtcHub.invoke("getPhoneLineById", id);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLine: PhoneLineType = this.jsHelperService.jsonToObject<PhoneLineType>(signalrResponse.content, true);
                    if (this.jsHelperService.isEmpty(phoneLine) === false) {
                        return phoneLine;
                    }
                    else {
                        throw ("unable to get PhoneLineType from json: " + signalrResponse.content);
                    }
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content, true);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw (response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async getPhoneLineByGuid(guid: string): Promise<PhoneLineType> {
        try {
            let response = await this.webRtcHub.invoke("getPhoneLineByGuid", guid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLine: PhoneLineType = this.jsHelperService.jsonToObject<PhoneLineType>(signalrResponse.content, true);
                    if (this.jsHelperService.isEmpty(phoneLine) === false) {
                        return phoneLine;
                    }
                    else {
                        throw ("unable to get PhoneLineType from json: " + signalrResponse.content);
                    }
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content, true);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw (response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async requestNewPhoneLine(): Promise<PhoneLineType> {
        try {
            let response = await this.webRtcHub.invoke("requestNewPhoneLine");
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLine: PhoneLineType = this.jsHelperService.jsonToObject<PhoneLineType>(signalrResponse.content, true);

                    //console.log("phonline: ", phoneLine);
                    if (this.jsHelperService.isEmpty(phoneLine) === false) {
                        return phoneLine;
                    }
                    else {
                        throw ("Unable to get PhoneLineType from json: " + signalrResponse.content);
                    }
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content, true);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw (response);
            }
        }
        catch (e) {
            throw (e);
        }
    }



    async deletePhoneLine(phoneLineId: number): Promise<PhoneLineType> {
        // should return phonelinetype with isDeleted = true

        try {
            let response = await this.webRtcHub.invoke("deletePhoneLine", phoneLineId);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLine: PhoneLineType = this.jsHelperService.jsonToObject<PhoneLineType>(signalrResponse.content, true);
                    if (this.jsHelperService.isEmpty(phoneLine) === false) {
                        if (phoneLine.isDeleted === true) {
                            return phoneLine;
                        }
                        else {
                            throw ("PhoneLine has not been deleted error: " + signalrResponse.content);
                        }
                    }
                    else {
                        throw ("Unable to parse phonetype error: " + signalrResponse.content);
                    }
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw (response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async requestNewPhoneLineConnection(phoneLineGuid: string): Promise<PhoneLineConnectionType> {
        try {
            let response = await this.webRtcHub.invoke("requestNewPhoneLineConnection", phoneLineGuid);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLineConnection: PhoneLineConnectionType = this.jsHelperService.jsonToObject<PhoneLineConnectionType>(signalrResponse.content, true);
                    if (this.jsHelperService.isEmpty(phoneLineConnection) === false) {
                        return phoneLineConnection;
                    }
                    else {
                        throw ("unable to get PhoneLineConnectionType from json: " + signalrResponse.content);
                    }
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw (response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async deletePhoneLineConnection(phoneLineConnectionId: number): Promise<PhoneLineConnectionType> {
        // should return phonelineconnectiontype with isDeleted = true
        try {
            let response = await this.webRtcHub.invoke("deletePhoneLineConnection", phoneLineConnectionId);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLineConnection: PhoneLineConnectionType = this.jsHelperService.jsonToObject<PhoneLineConnectionType>(signalrResponse.content, true);
                    if (this.jsHelperService.isEmpty(phoneLineConnection) === false) {
                        if (phoneLineConnection.isDeleted === true) {
                            return phoneLineConnection;
                        }
                        else {
                            throw ("PhoneLineConnection has not been deleted error: " + signalrResponse.content);
                        }
                    }
                    else {
                        throw ("Unable to parse phonelineConnectiontype error: " + signalrResponse.content);
                    }
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw (response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async getPhoneLineConnectionById(id: number): Promise<PhoneLineConnectionType> {
        try {
            let response = await this.webRtcHub.invoke("getPhoneLineConnectionById", id);
            let signalrResponse: SignalrHttpResponseType = this.jsHelperService.parseSignalrResponse(response);
            if (this.jsHelperService.isEmpty(signalrResponse) === false) {
                if (signalrResponse.statusCode === HttpStatusCodeEnum.ok) {
                    let phoneLineConnection: PhoneLineConnectionType = this.jsHelperService.jsonToObject<PhoneLineConnectionType>(signalrResponse.content, true);
                    if (this.jsHelperService.isEmpty(phoneLineConnection) === false) {
                        return phoneLineConnection;
                    }
                    else {
                        throw ("unable to get PhoneLineConnectionType from json: " + signalrResponse.content);
                    }
                }
                else {
                    let errors: Array<string> = this.jsHelperService.jsonToObject<Array<string>>(signalrResponse.content);
                    throw (this.jsHelperService.implode("| ", errors));
                }
            }
            else {
                throw (response);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    // #endregion PhoneLine

    //  #region phone listeners 

    private _receiveCancelInvitation = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePhoneLineInvitation = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveAcceptPhoneLineInvitation = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveAreYouReadyForCall = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveReadyForCall = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveNotReadyForCall = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveSDP = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveICE = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveBusyResponse = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveNotAcceptCall = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveRemoteLogout = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePutOnHold = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveRemoveOnHold = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveGroupSmsMessage = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePrivateSmsMessage = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveHangUpNotice = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveRepHangUpNotice = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePing = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePingResponse = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveSystemMessage = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveRequestNetcast = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveRequestPCOnly = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveRequestPCStream = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveDisconnect = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());

    private _someoneDisconnected = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveNetcastStub = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());

    private _receiveRequestNetcastStub = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());

    private _receivePbxPhoneLineInvitation = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePbxRepPhoneLineInvitation = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePbxCallQueueNotes = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receivePbxCallQueueOccupants = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());
    private _receiveNewPbxLineRep = new BehaviorSubject<ObservableMessageType>(new ObservableMessageType());

    // #endregion

    // #region BehaviorSubject getters
    get receiveCancelInvitation(): BehaviorSubject<ObservableMessageType> {
        return this._receiveCancelInvitation;
    }
    get receivePhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this._receivePhoneLineInvitation;
    }

    get receiveAcceptPhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this._receiveAcceptPhoneLineInvitation;
    }
    get receiveAreYouReadyForCall(): BehaviorSubject<ObservableMessageType> {
        return this._receiveAreYouReadyForCall;
    }
    get receiveReadyForCall(): BehaviorSubject<ObservableMessageType> {
        return this._receiveReadyForCall;
    }
    get receiveNotReadyForCall(): BehaviorSubject<ObservableMessageType> {
        return this._receiveNotReadyForCall;
    }
    get receiveSDP(): BehaviorSubject<ObservableMessageType> {
        return this._receiveSDP;
    }
    get receiveICE(): BehaviorSubject<ObservableMessageType> {
        return this._receiveICE;
    }
    get receiveBusyResponse(): BehaviorSubject<ObservableMessageType> {
        return this._receiveBusyResponse;
    }
    get receiveNotAcceptCall(): BehaviorSubject<ObservableMessageType> {
        return this._receiveNotAcceptCall;
    }
    get receiveRemoteLogout(): BehaviorSubject<ObservableMessageType> {
        return this._receiveRemoteLogout;
    }
    get receivePutOnHold(): BehaviorSubject<ObservableMessageType> {
        return this._receivePutOnHold;
    }
    get receiveRemoveOnHold(): BehaviorSubject<ObservableMessageType> {
        return this._receiveRemoveOnHold;
    }
    get receiveGroupSmsMessage(): BehaviorSubject<ObservableMessageType> {
        return this._receiveGroupSmsMessage;
    }
    get receivePrivateSmsMessage(): BehaviorSubject<ObservableMessageType> {
        return this._receivePrivateSmsMessage;
    }
    get receiveHangUpNotice(): BehaviorSubject<ObservableMessageType> {
        return this._receiveHangUpNotice;
    }
    get receiveRepHangUpNotice(): BehaviorSubject<ObservableMessageType> {
        return this._receiveRepHangUpNotice;
    }
    get receivePing(): BehaviorSubject<ObservableMessageType> {
        return this._receivePing;
    }
    get receivePingResponse(): BehaviorSubject<ObservableMessageType> {
        return this._receivePingResponse;
    }
    get receiveSystemMessage(): BehaviorSubject<ObservableMessageType> {
        return this._receiveSystemMessage;
    }
    get receiveRequestNetcast(): BehaviorSubject<ObservableMessageType> {
        return this._receiveRequestNetcast;
    }
    get receiveRequestPCOnly(): BehaviorSubject<ObservableMessageType> {
        return this._receiveRequestPCOnly;
    }
    get receiveRequestPCStream(): BehaviorSubject<ObservableMessageType> {
        return this._receiveRequestPCStream
    }

    get receiveDisconnect(): BehaviorSubject<ObservableMessageType> {
        return this._receiveDisconnect
    }

    get receiveNetcastStub(): BehaviorSubject<ObservableMessageType> {
        return this._receiveNetcastStub;
    }

    get receiveRequestNetcastStub(): BehaviorSubject<ObservableMessageType> {
        return this._receiveRequestNetcastStub;
    }



    get receivePbxPhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this._receivePbxPhoneLineInvitation;
    }
    get receivePbxRepPhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this._receivePbxRepPhoneLineInvitation;
    }
    get receivePbxCallQueueNotes(): BehaviorSubject<ObservableMessageType> {
        return this._receivePbxCallQueueNotes;
    }
    get receivePbxCallQueueOccupants(): BehaviorSubject<ObservableMessageType> {
        return this._receivePbxCallQueueOccupants;
    }

    get receiveNewPbxLineRep(): BehaviorSubject<ObservableMessageType> {
        return this._receiveNewPbxLineRep;
    }

    get someoneDisconnected(): BehaviorSubject<ObservableMessageType> {
        return this._someoneDisconnected;
    }


    // #endregion

    startWebRtcHubListeners(): void {
        // Put all the webRtcHub listeners here

        // End any existing webRtcHub listeners
        // before starting listeners.
        this.endWebRtcHubListeners();

        let webRtcHub = this.webRtcHub;

        webRtcHub.on("receiveCancelInvitation", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            //console.log("signalr.service.ts receiveCancelInvitation message:", message);
            this._receiveCancelInvitation.next(message);
            this._receiveCancelInvitation.next(new ObservableMessageType());

            //this._receiveAcceptPhoneLineInvitation.next("");
        });

        webRtcHub.on("receivePhoneLineInvitation", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            //console.log("signalr.service.ts receivePhoneLineInvitation message:", message);
            this._receivePhoneLineInvitation.next(message);
            this._receivePhoneLineInvitation.next(new ObservableMessageType());
            //console.trace();
            //this._receivePhoneLineInvitation.next("");
        });

        webRtcHub.on("receiveAcceptPhoneLineInvitation", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            //console.log("signalr.service.ts receiveAcceptPhoneLineInvitation message:", message);
            this._receiveAcceptPhoneLineInvitation.next(message);
            this._receiveAcceptPhoneLineInvitation.next(new ObservableMessageType());

            //this._receiveAcceptPhoneLineInvitation.next("");
        });

        webRtcHub.on("receiveAreYouReadyForCall", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveAreYouReadyForCall.next(message);
            this._receiveAreYouReadyForCall.next(new ObservableMessageType());
            //this._receiveAreYouReadyForCall.next("");
        });

        webRtcHub.on("receiveReadyForCall", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receiveReadyForCall.next(message);
            this._receiveReadyForCall.next(new ObservableMessageType());
            //this._receiveReadyForCall.next("");
        });

        webRtcHub.on("receiveNotReadyForCall", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveNotReadyForCall.next(message);
            this._receiveNotReadyForCall.next(new ObservableMessageType());
            //this._receiveNotReadyForCall.next("");
        });

        webRtcHub.on("receiveSDP", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveSDP.next(message);
            this._receiveSDP.next(new ObservableMessageType());
            //this._receiveSDP.next("");
        });

        webRtcHub.on("receiveICE", (json: string) => {
            //console.log("phone.service.ts receivedICE: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveICE.next(message);
            this._receiveICE.next(new ObservableMessageType());
            //this._receiveICE.next("");
        });

        webRtcHub.on("receiveBusyResponse", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receiveBusyResponse.next(message);
            this._receiveBusyResponse.next(new ObservableMessageType());
            //this._receiveBusyResponse.next("");
        });

        webRtcHub.on("receiveNotAcceptCall", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receiveNotAcceptCall.next(message);
            this._receiveNotAcceptCall.next(new ObservableMessageType());
            //this._receiveNotAcceptCall.next("");
        });

        webRtcHub.on("receiveRemoteLogout", (connectionId: string) => {
            let message = new ObservableMessageType();
            message.message = connectionId;

            //let alert = this.alertCtrl.create({
            //    title: "Debugging",
            //    message: "signalr.service.ts receiveRemoteLogout: " + message.message + ": " + this.debugId,
            //    buttons: ['OK']

            //});

            //alert.present();

            this._receiveRemoteLogout.next(message);
            this._receiveRemoteLogout.next(new ObservableMessageType());
            //this._receiveRemoteLogout.next("");
        });

        webRtcHub.on("receivePutOnHold", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receivePutOnHold.next(message);
            this._receivePutOnHold.next(new ObservableMessageType());
            //this._receivePutOnHold.next("");
        });

        webRtcHub.on("receiveRemoveOnHold", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receiveRemoveOnHold.next(message);
            this._receiveRemoveOnHold.next(new ObservableMessageType());
            //this._receiveRemoveOnHold.next("");
        });

        webRtcHub.on("receivePrivateSmsMessage", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receivePrivateSmsMessage.next(message);
            this._receivePrivateSmsMessage.next(new ObservableMessageType());
            //this._receivePrivateSmsMessage.next("");
        });

        webRtcHub.on("receiveGroupSmsMessage", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveGroupSmsMessage.next(message);
            this._receiveGroupSmsMessage.next(new ObservableMessageType());
            //this._receiveGroupSmsMessage.next("");
        });

        webRtcHub.on("receiveHangUpNotice", (json: string) => {
            console.log("signalr.service.ts receiveHangUpNotice json: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveHangUpNotice.next(message);
            this._receiveHangUpNotice.next(new ObservableMessageType());
            //this._receiveGroupSmsMessage.next("");
        });

        webRtcHub.on("receiveRepHangUpNotice", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveRepHangUpNotice.next(message);
            this._receiveRepHangUpNotice.next(new ObservableMessageType());
        });

        webRtcHub.on("receivePing", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receivePing.next(message);
            this._receivePing.next(new ObservableMessageType());
        });

        webRtcHub.on("receivePingResponse", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receivePingResponse.next(message);
            this._receivePingResponse.next(new ObservableMessageType());
        });

        webRtcHub.on("receiveSystemMessage", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveSystemMessage.next(message);
            this._receiveSystemMessage.next(new ObservableMessageType());
        });

        webRtcHub.on("receiveRequestNetcast", (json: string) => {
            console.log("receiveRequestNetcast json: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveRequestNetcast.next(message);
            this._receiveRequestNetcast.next(new ObservableMessageType());
        });

        webRtcHub.on("receiveRequestPCOnly", (json: string) => {
            console.log("receiveRequestPCOnly json: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveRequestPCOnly.next(message);
            this._receiveRequestPCOnly.next(new ObservableMessageType());
        });

        webRtcHub.on("receiveRequestPCStream", (json: string) => {
            console.log("receiveRequestPCStream json: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveRequestPCStream.next(message);
            this._receiveRequestPCStream.next(new ObservableMessageType());
        });


        // PBX

        webRtcHub.on("receivePbxPhoneLineInvitation", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            //console.log("signalr.service.ts receivePbxPhoneLineInvitation message:", message);
            this._receivePbxPhoneLineInvitation.next(message);
            this._receivePbxPhoneLineInvitation.next(new ObservableMessageType());
            //console.trace();
            //this._receivePhoneLineInvitation.next("");
        });

        webRtcHub.on("receivePbxRepPhoneLineInvitation", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            //console.log("signalr.service.ts receivePbxRepPhoneLineInvitation message:", message);
            this._receivePbxRepPhoneLineInvitation.next(message);
            this._receivePbxRepPhoneLineInvitation.next(new ObservableMessageType());
            //console.trace();
            //this._receivePhoneLineInvitation.next("");
        });

        webRtcHub.on("receivePbxCallQueueNotes", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receivePbxCallQueueNotes.next(message);
            this._receivePbxCallQueueNotes.next(new ObservableMessageType());
            //this._receiveGroupSmsMessage.next("");
        });

        //webRtcHub.on("receiveAddPbxCustomer", (json: string) => {
        //	let message = new ObservableMessageType();
        //	message.message = json;
        //	this._receiveAddPbxCustomer.next(message);
        //	this._receiveAddPbxCustomer.next(new ObservableMessageType());
        //});

        //webRtcHub.on("receiveRemovePbxCustomer", (json: string) => {
        //	let message = new ObservableMessageType();
        //	message.message = json;
        //	this._receiveRemovePbxCustomer.next(message);
        //	this._receiveRemovePbxCustomer.next(new ObservableMessageType());
        //});

        webRtcHub.on("receiveNewPbxLineRep", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveNewPbxLineRep.next(message);
            this._receiveNewPbxLineRep.next(new ObservableMessageType());
        });

        webRtcHub.on("receivePbxCallQueueOccupants", (json: string) => {
            //console.log("signalr.receivePbxCallQueueOccupants json: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this._receivePbxCallQueueOccupants.next(message);
            this._receivePbxCallQueueOccupants.next(new ObservableMessageType());
        });

        webRtcHub.on("someoneDisconnected", (json: string) => {
            console.log("signalr.someoneDisconnected json: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this.someoneDisconnected.next(message);
            this.someoneDisconnected.next(new ObservableMessageType());
        });

        webRtcHub.on("receiveDisconnect", (json: string) => {
            console.log("signalr.someoneDisconnected json: ", json);
            let message = new ObservableMessageType();
            message.message = json;
            this.receiveDisconnect.next(message);
            this.receiveDisconnect.next(new ObservableMessageType());
        });

        webRtcHub.on("receiveNetcastStub", (remoteGuid: string) => {
            let message = new ObservableMessageType();
            message.message = remoteGuid;
            this._receiveNetcastStub.next(message);
            this._receiveNetcastStub.next(new ObservableMessageType());
        });

        webRtcHub.on("receiveRequestNetcastStub", (json: string) => {
            let message = new ObservableMessageType();
            message.message = json;
            this._receiveRequestNetcastStub.next(message);
            //this._receiveSDP.complete();
            this._receiveRequestNetcastStub.next(new ObservableMessageType());
            //this._receiveSDP.next("");
        });


        //webRtcHub.on("receivePbxCallQueueLineRepUpdate", (json: string) => {
        //	let message = new ObservableMessageType();
        //	message.message = json;
        //	this._receivePbxCallQueueLineRepUpdate.next(message);
        //	this._receivePbxCallQueueLineRepUpdate.next(new ObservableMessageType());
        //	//this._receiveGroupSmsMessage.next("");
        //});

        //console.log("phone.service.ts startWebRtcHubListeners() started");
    }

    endWebRtcHubListeners(): void {
        let webRtcHub = this.webRtcHub;

        webRtcHub.off("receiveCancelInvitation", null);

        webRtcHub.off("receivePhoneLineInvitation", null);

        webRtcHub.off("receiveAcceptPhoneLineInvitation", null);

        webRtcHub.off("receiveAreYouReadyForCall", null);

        webRtcHub.off("receiveReadyForCall", null);

        webRtcHub.off("receiveNotReadyForCall", null);

        webRtcHub.off("receiveSDP", null);

        webRtcHub.off("receiveICE", null);

        webRtcHub.off("receiveBusyResponse", null);

        webRtcHub.off("receiveNotAcceptCall", null);

        webRtcHub.off("receiveRemoteLogout", null);

        webRtcHub.off("receivePutOnHold", null);

        webRtcHub.off("receiveRemoveOnHold", null);

        webRtcHub.off("receivePrivateSmsMessage", null);

        webRtcHub.off("receiveGroupSmsMessage", null);

        webRtcHub.off("receiveHangUpNotice", null);

        webRtcHub.off("receiveRepHangUpNotice", null);

        webRtcHub.off("receivePing", null);

        webRtcHub.off("receivePingResponse", null);

        webRtcHub.off("receiveSystemMessage", null);

        webRtcHub.off("receiveRequestNetcast", null);

        webRtcHub.off("receiveRequestPCOnly", null);

        webRtcHub.off("receiveRequestPCStream", null);

        // PBX
        webRtcHub.off("receivePbxPhoneLineInvitation", null);

        webRtcHub.off("receivePbxRepPhoneLineInvitation", null);

        webRtcHub.off("receivePbxCallQueueNotes", null);

        webRtcHub.off("receiveAddPbxCustomer", null);

        webRtcHub.off("receiveRemovePbxCustomer", null);

        webRtcHub.off("receiveNewPbxLineRep", null);

        webRtcHub.off("receiveDisconnect", null);

        webRtcHub.off("someoneDisconnected", null);

        webRtcHub.off("receiveNetcastStub", null);

        webRtcHub.off("receiveRequestNetcastStub", null);

        //webRtcHub.off("receivePbxCallQueueOccupants", null);

        //webRtcHub.off("receivePbxCallQueueLineRepUpdate", null);

        //console.log("phone.service.ts endWebRtcHubListeners() stopped");
    }


}
