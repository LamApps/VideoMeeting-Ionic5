///<reference path="../../node_modules/@types/jasmine/index.d.ts" />
import { Platform } from 'ionic-angular';
import { TestBed, inject } from '@angular/core/testing';
import { JwtToken } from '../models/index';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
//import { Device } from '@ionic-native/device';
import { ConfigService, PushService, LocalStorageService, JsHelperService, SignalrService } from './index';
import { LocalStorageServiceMock } from './localStorage.service.mock';
describe('PushService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                Platform, Push, PushService, ConfigService, { provide: LocalStorageService, useClass: LocalStorageServiceMock }, JsHelperService, SignalrService
            ]
        });
    });

    xit(
        'Should get a push registration id',
        inject(
            [
                PushService,
                ConfigService,
                LocalStorageService,
                JsHelperService,
                SignalrService,
                Push,
                Platform
            ],
            async (
                pushService: PushService
            ) => {
                expect(pushService).toBeDefined();
            })
    );

    it(
        'Should get the members email',
        inject(
            [
                PushService,
                ConfigService,
                LocalStorageService,
                JsHelperService,
                SignalrService,
                Push,
                Platform
            ],
            async (
                pushService,
                configService,
                localStorageService,
                jsHelperService,
                signalrService
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
                let memberEmail: string = await pushService.getMyEmail(jwtToken.access_token);

                //assert
                expect(memberEmail == email).toBeTruthy();
            })
    )
});