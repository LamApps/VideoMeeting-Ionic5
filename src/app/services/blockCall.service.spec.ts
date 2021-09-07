///<reference path="../../node_modules/@types/jasmine/index.d.ts" />
/////<reference path="../../node_modules/@types/jquery/index.d.ts" />
/////<reference path="../../node_modules/@types/signalr/index.d.ts" />
import { TestBed, inject } from '@angular/core/testing';
import {
    BlockCallService,
    LocalStorageService,

    SignalrService,
    JsHelperService,
    ConfigService
} from './index';
import {
    BlockedContact,
    JwtToken,
    PagingType,
    BlockedEmailType
} from '../models/index';
import { LocalStorageServiceMock } from './localStorage.service.mock';

//import * as $ from 'jquery';
//import { SignalR } from '../../node_modules/@types/signalr';
//import 'signalr';
let blockedList = new Array<BlockedEmailType>();
for (let i = 1; i < 10; i++) {
    let blocked = new BlockedEmailType();
    blocked.blockDate = new Date();
    blocked.blockedEmailId = i;
    blocked.blockerEmail = "";
    blocked.blockerId = i;
    blocked.deleteDate = null;
    blocked.isDeleted = false;
    blocked.emailBlocked = "mock" + i + "@lvc.com";
    blockedList.push(blocked);
}

let originalTimeout;
let jwtToken: JwtToken;
describe('BlockCallService', () => {
    beforeEach(async () => {
        //SignalR.ConnectionState.Connected

        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

        let configService = new ConfigService();
        let jsHelperService = new JsHelperService();
        let localStorageService = new LocalStorageServiceMock();
        let signalrService = new SignalrService(configService, jsHelperService, <LocalStorageService>localStorageService);

        await signalrService.startConnection();
        let ip = await signalrService.requestIp();
        await signalrService.setIp(ip);
        let proxySecret = await signalrService.requestProxySecret(ip);
        await signalrService.setProxySecret(proxySecret);
        let email = "support@livevideomatch.com";
        let password = "J@ck123";
        jwtToken = await signalrService.requestMemberToken(email, password);

        TestBed.configureTestingModule({
            providers: [
                { provide: LocalStorageService, useClass: LocalStorageServiceMock }, BlockCallService, JsHelperService, SignalrService, ConfigService
            ]
        });
    });

    it(
        'Should find email in block list and return true',
        inject(
            [
                LocalStorageService,
                BlockCallService,
                JsHelperService,
                SignalrService,
                ConfigService
            ],
            async (
                localStorageService: LocalStorageService,
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService,
                configService: ConfigService
            ) => {
                //arrange

                blockCallService.blockedEmails = blockedList;
                let email = "mock2@lvc.com";

                //act
                var result = await blockCallService.isBlockedEmailFromCache(email);

                //assert

                expect(result === true).toBeTruthy();
            })
    )

    it(
        'Should not find email in block list and return false',
        inject(
            [
                LocalStorageService,
                BlockCallService,
                JsHelperService,
                SignalrService,
                ConfigService
            ],
            async (
                localStorageService: LocalStorageService,
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService,
                configService: ConfigService

            ) => {
                //arrange
                blockCallService.blockedEmails = blockedList;
                let email = "mock10@lvc.com";

                //act
                console.log("email: ", email);
                var result = await blockCallService.isBlockedEmailFromCache(email);
                console.log("result: ", result);
                //assert

                expect(result === false).toBeTruthy();
            })
    )

    // NOTE: run this test when needed, because it will add a record to db
    // blockEmail
    xit(
        'Should add an email to block list',
        inject(
            [
                BlockCallService,
                JsHelperService,
                SignalrService
            ],
            async (
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService
            ) => {
                //arrange
                let timestamp = Date.now().toString();
                let emailToBlock = "mock_" + timestamp + "@lvc.com";

                //act
                var result = await blockCallService.blockEmail(emailToBlock, jwtToken.access_token);
                //console.log("blockEmail result:", result);
                //assert

                expect(jsHelperService.isEmpty(result) === false && jsHelperService.isEmpty(result.blockedEmailId) === false && Number(result.blockedEmailId) > 0).toBeTruthy();
            })
    );

    // getAllBlockedEmails
    it(
        'Should get all blocked emails',
        inject(
            [
                BlockCallService,
                JsHelperService,
                SignalrService
            ],
            async (
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService
            ) => {
                //act
                var result = await blockCallService.getAllBlockedEmails(jwtToken.access_token);

                //assert

                expect(jsHelperService.isEmpty(result) === false).toBeTruthy();
                expect(result.length > 0).toBeTruthy();
            })
    )

    // GetBlockedEmails
    it(
        'Should get blocked emails with paging option',
        inject(
            [
                BlockCallService,
                JsHelperService,
                SignalrService
            ],
            async (
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService
            ) => {
                // arrange
                let pagingOptions = new PagingType();
                pagingOptions.skip = 0;
                pagingOptions.take = 3;
                pagingOptions.orderField = "EmailBlocked";
                pagingOptions.orderDirection = "ASC";
                //act
                var result: BlockedEmailType[] = await blockCallService.getBlockedEmails(pagingOptions, jwtToken.access_token);

                //assert

                expect(jsHelperService.isEmpty(result) === false).toBeTruthy();
                expect(result.length === pagingOptions.take).toBeTruthy();
            })
    )

    it(
        'Should not find the email in server block list',
        inject(
            [
                BlockCallService,
                JsHelperService,
                SignalrService
            ],
            async (
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService
            ) => {
                // arrange
                let email = "support@livevideomatch.com";

                //act
                let isBlocked: boolean = await blockCallService.isBlockedEmail(email, jwtToken.access_token);

                //assert
                expect(isBlocked === false).toBeTruthy();
            })
    )

    // NOTE: only run this for manual testing because it will create a record in database
    // isBlockedEmail
    xit(
        'Should find the email is blocked',
        inject(
            [
                BlockCallService,
                JsHelperService,
                SignalrService
            ],
            async (
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService
            ) => {
                // arrange
                let timestamp = Date.now().toString();
                let emailToBlock = "mock_" + timestamp + "@lvc.com";
                let result = await blockCallService.blockEmail(emailToBlock, jwtToken.access_token);

                //act
                let isBlocked: boolean = await blockCallService.isBlockedEmail(result.emailBlocked, jwtToken.access_token);

                //assert
                expect(isBlocked === true).toBeTruthy();
            })
    )

    // NOTE: only run this for manual testing because it will create a record in database
    // unblockedEmail
    xit(
        'Should unblock and email',
        inject(
            [
                BlockCallService,
                JsHelperService,
                SignalrService
            ],
            async (
                blockCallService: BlockCallService,
                jsHelperService: JsHelperService,
                signalrService: SignalrService
            ) => {
                // arrange
                let timestamp = Date.now().toString();
                let emailToBlock = "mock_" + timestamp + "@lvc.com";
                let result: BlockedEmailType = await blockCallService.blockEmail(emailToBlock, jwtToken.access_token);

                //act
                let unblocked: boolean = await blockCallService.unblockEmail(Number(result.blockedEmailId), jwtToken.access_token);
                let isBlocked: boolean = await blockCallService.isBlockedEmail(result.emailBlocked, jwtToken.access_token);

                //assert
                expect(isBlocked === false).toBeTruthy();
            })
    )

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});