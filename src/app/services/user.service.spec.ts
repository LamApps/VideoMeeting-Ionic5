///<reference path="../../../node_modules/@types/jasmine/index.d.ts" />
/////<reference path="../../node_modules/@types/jquery/index.d.ts" />
/////<reference path="../../node_modules/@types/signalr/index.d.ts" />
import { Platform } from '@ionic/angular';
import { TestBed, inject } from '@angular/core/testing';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
//import { Device } from '@ionic-native/device';

import {
    UserService,
    LocalStorageService,

    SignalrService,
    JsHelperService,
    ConfigService,
    PushService
} from './index';
import {
    JwtToken,
    MemberType,
    WebApiResponseStatusType,
    WebApiResponseType,
    BlockedContact,
    Contact,
    PhoneContactType,
    RegisterDto
} from '../models/index';
import { LocalStorageServiceMock } from './localStorage.service.mock';

let originalTimeout;

describe('UserService', () => {
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

        TestBed.configureTestingModule({
            providers: [
                Push, PushService, { provide: LocalStorageService, useClass: LocalStorageServiceMock }, UserService, JsHelperService, SignalrService, ConfigService, Platform
            ]
        });
    });

    it(
        'Should get member profile',
        inject(
            [
                PushService,
                LocalStorageService,
                UserService,
                JsHelperService,
                SignalrService,
                ConfigService,
                Platform,
                Push
            ],
            async (
                pushService: PushService,
                localStorageService: LocalStorageService,
                userService: UserService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService,
                configService: ConfigService

            ) => {
                //arrange
                await signalrService.startConnection();
                let ip = await signalrService.requestIp();
                await signalrService.setIp(ip);
                let proxySecret = await signalrService.requestProxySecret(ip);
                await signalrService.setProxySecret(proxySecret);
                let email = "williamTeddy@lvc.com";
                let password = "J@ck1234";
                let jwtToken: JwtToken = await signalrService.requestMemberToken(email, password);
                //act
                let member: MemberType = await userService.getMyProfile(jwtToken.access_token);

                member.avatarDataUri = "";
                //console.log("got member: ", member);

                //assert
                expect(member).toBeDefined();
                expect(member.email !== "").toBeTruthy();
            })
    );

    // NOTE: this test will add an actual member to the database. only run as needed for testing
    xit(
        'Should register a new member',
        inject(
            [
                LocalStorageService,
                UserService,
                JsHelperService,
                SignalrService,
                ConfigService,
                Platform,
                Push
            ],
            async (
                localStorageService: LocalStorageService,
                userService: UserService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService,
                configService: ConfigService
            ) => {
                //arrange
                let dataUri = "";
                await signalrService.startConnection();
                let ip = await signalrService.requestIp();
                await signalrService.setIp(ip);
                let proxySecret = await signalrService.requestProxySecret(ip);
                await signalrService.setProxySecret(proxySecret);
                let jwtToken: JwtToken = await signalrService.requestGuestToken();
                let suffix = Date.now().toString();
                let email = "testing_" + suffix + "@lvc.com";
                //console.log("email: ", email);
                let newMember = new RegisterDto();
                newMember.email = email;
                newMember.firstName = "jack";
                newMember.lastName = "daniels";
                newMember.password = "jack1234";
                newMember.username = email;
                newMember.avatarDataUri = dataUri;
                newMember.altEmail = "";
                //newMember.isSuspended = false;
                //newMember.isVerified = true;

                //act
                let member: MemberType = await userService.register(newMember, jwtToken.access_token);
                //console.log("got member: ", member);
                //assert
                expect(member).toBeDefined();
            })
    );

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});

var dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAgAElEQVR4nOy92a8lSX7f94k8J89296326qqeXmY408NpSk0BkmVrKMs2YRvm8EWwn6YJCOgnozgvehX5BxjiAIIfbMBuw7BsGLAty7IxMkSpRZGmSbupHpJuTk/PUjXdtXTdqrr7OffcczLDD7H9IjLPXapu9/SSP+DezBMZGRmZJ7/f3xK/iAONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCONNNJII4000kgjjTTSSCNfaHn3e7eW3/3ereWfdz++6KJ+3h1o5IsjFvB/D3gdkOB/B9gG/qXdvgPc/uqvfvf2J9zFL5w0BNDIxy7vfu/WTQLwvbTabYrp9KTTG3L4GKUhgEY+NqkD/tKly2zcuEne64LWQMnh/h7ldMpwe5tiOuXw4IDxwZBiWpx0iYYcnlEaAmjk3OXd7936Jgb433RldcCPtxp0aba+DIY7exTTgvHBiKPxmMn4yJBDUZ7UDUkOt+3fO1/91e9un+OtfualIYBGzk3e/d6tbwG3sMBvtdssXbrM6tVr5N0uMbiPA772BIAWF9DavLHaHBjuHlAUU8YHhxyND5mMJ4yHh6chh7cw5PB9vuDk0BBAI88s737v1usYjX8TDPBXr11n5eo1Wq0Wpwe+PCYuoP0/8Tkpc581QMFw75BiesR4NOHocMTkaMp4OKYo0nMq8hZfIHJoCKCRpxIb0X8do/FvAuS9Hhs3vsT8+toxwBdbr+nTY1bcrq4DbY2FkBKCBpQmsir0mOH+lGIyYjwqODo6MuQwmlKcGHL4/JFDQwCNnEks8H8TA/xlCMBfunTpGK1+GuBb030W8GdqflFX1dSrXFdsZV/1EcODksn4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";