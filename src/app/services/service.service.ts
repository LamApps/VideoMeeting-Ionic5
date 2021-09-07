import { Injectable } from '@angular/core';
//import { ModalController, Modal } from 'ionic-angular';
import { Observable, BehaviorSubject, Subject } from "rxjs";
//import { Subscription } from "rxjs/Subscription";
import {
    FlashMessageService,
    ConfigService,
    JsHelperService,
    LocalStorageService,
    SignalrService,
    UserService,
    PbxService,
    BlockCallService,
    CapturePhotoService,
    ContactService,
    LocalContactService,
    MaterialsHelperService,
    PushService,
    SettingsService,
    VideoHelperService,
    FormsErrorService,
    PermissionsService,
    PlatformHelperService,
    CameraService,
    MeetingService,
    NetcastService,
} from './index';
import {
    JwtToken,
    HubConnection,
    SignalrHttpResponseType,
    //HttpStatusCodeEnum,
    AppWebRtcSettingType,
    //AppIceServerType,
    WebApiType,
    PhoneLineType,
    PhoneLineConnectionType,
    CallType,
    ObservableMessageType,
    CompanyProfileDto,
    //WebApiResponseType,
    //WebApiResponseStatusType,
    IdDto,
    SearchTermDto,
    LocationSearchDto,
    CompanyEmployeeDto,
    LongIdDto, //EmailDto,
    CompanyEmployeeInviteDto,
    CompanyLocationDto,
    CompanyVideoDto,
    CompanyPhotoDto,
    PbxLineDto,
    PbxLineRepDto,
    PbxLineRepStatusDto,
    PbxCallQueueDto,
    PagingOrderByDto,
    CountryDto,
    MemberType,
    GuestProfileType,
    RegisterDto,
    SendInviteDto,
    //GuestLogin,
    BlockedEmailType,
    PagingType,
    PhoneContactType,
    PushSubscriptionType,
    UnsubscribePushNotificationDto,
    GetPushIdDto,
    MaterialAlertMessageType,
    MaterialActionAlertMessageType,
    //MaterialSnackBarMessageType,
    FormsErrorMessageType,
    GuestLoginType,
    CurrentCallAttemptType,
    PropertyTrackingEnum,
    ParsedTokenType,
    ContactUsDto,
    //GenericUserType,
    //TextMessageType,
    SendCopyOfMessageDto,
    MeetingDto,
    MeetingAttendeeDto,
    StringIdDto,
    RequestNetcastStubType,
    LoginOptionsEnum,
    MemberLoginType,
    NetcastGenreDto,
    NetcastGenreViewModel,
    NetcastDto,
    NetcastViewModel,
    SqlSearchPredicateDto,
    GenericUserType,
} from '../models/index';
//import {
//	OutgoingCallDialogComponent,
//	PrivateMessagingComponent
//} from '../components/index';
//import { Overlay } from 'ionic-angular/navigation/overlay';

import { AlertController } from '@ionic/angular';
import { MapperService } from './mapper.service';


@Injectable({providedIn:'root'})
export class Service {
    ;
    constructor(
        //private modalCtrl: ModalController,
        private configService: ConfigService,
        private jsHelperService: JsHelperService,
        private localStorageService: LocalStorageService,
        private userService: UserService,
        private pbxService: PbxService,
        private blockCallService: BlockCallService,
        private capturePhotoService: CapturePhotoService,
        private contactService: ContactService,
        private signalrService: SignalrService,
        private flashMessageService: FlashMessageService,
        private materialHelperService: MaterialsHelperService,
        private pushService: PushService,
        private settingsService: SettingsService,
        private videoHelperService: VideoHelperService,
        private formsErrorService: FormsErrorService,
        private permissionsService: PermissionsService,
        private platformHelperService: PlatformHelperService,
        private localContactService: LocalContactService,
        private meetingService: MeetingService,
        private netcastService: NetcastService,
        private cameraService: CameraService,
        private mapperService: MapperService,
        private alertCtrl: AlertController,
       
    ) {
    }

    // #region FormsErrorService
    getFormErrorMessages(errors: Array<FormsErrorMessageType>): Array<string> {
        return this.formsErrorService.getErrorMessages(errors);
    }

    getFormErrorMessage(errorType: string, displayValue: string): string {
        return this.formsErrorService.getErrorMessage(errorType, displayValue);
    }
    mapFormDisplayError(param: any): string {
        return this.formsErrorService.mapErrors(param);
    }

    // #endregion

    // #region JsHelperService
    get toLocalTimeReviver() {
        return this.jsHelperService.toLocalTimeReviver;
    }

    async delay(ms: number): Promise<void> {
        return this.jsHelperService.delay(ms);
    }

    extractMemberId(token: string): string {
        return this.jsHelperService.getMemberId(token);
    }

    parseJwt(token: string): ParsedTokenType {
        return this.jsHelperService.parseJwt(token);
    }

    sanitizeEmail(email: string): string {
        return this.jsHelperService.sanitizeEmail(email);
    }

    toQueryString(body: Object): string {
        return this.jsHelperService.toQueryString(body);
    }

    stringify(obj: any): string {
        return this.jsHelperService.stringify(obj);
    }

    createQueryString(payload: any, seperator?: string): string {
        return this.jsHelperService.createQueryString(payload, seperator);
    }

    isEmpty(obj: any): boolean {
        return this.jsHelperService.isEmpty(obj);
    }

    isValidEmail(email: string): boolean {
        return this.jsHelperService.isValidEmail(email);
    }

    ajaxRequest(method: string, url: string, payload: any, bearerToken: string): Promise<string> {
        return this.jsHelperService.ajaxRequest(method, url, payload, bearerToken);
    }

    base64Encode(data: string): string {
        return this.jsHelperService.base64Encode(data);
    }

    base64Decode(data: string): string {
        return this.jsHelperService.base64Decode(data);
    }

    isDomElement(obj: any): boolean {
        return this.jsHelperService.isDomElement(obj);
    }

    tryParseJson = (json: string, reviver?: any): any => {
        return this.jsHelperService.tryParseJson(json, reviver);
    }

    jsonToObject<T>(json: string, toCamel?: boolean, reviver?: any): T {
        return this.jsHelperService.jsonToObject<T>(json, toCamel, reviver);
    }

    parseWebApiResponse<T>(json: string): T {
        return this.jsHelperService.parseWebApiResponse<T>(json);
    }

    extractWebApiResponseErrors(json: string): Array<string> {
        return this.jsHelperService.extractWebApiResponseErrorMessages(json);
    }

    parseWebApiResponseAsync<T>(data: string): Promise<T> {
        return this.jsHelperService.parseWebApiResponseAsync<T>(data);
    }

    parseSignalrResponse(response: string): SignalrHttpResponseType {
        return this.jsHelperService.parseSignalrResponse(response);
    }

    createHash(key: string): string {
        return this.jsHelperService.createHash(key);
    }

    objectPropertiesToCamel(obj: any): any {
        return this.jsHelperService.objectPropertiesToCamel(obj);
    }

    objectPropertiesToPascal(obj: any): any {
        return this.jsHelperService.objectPropertiesToPascal(obj);
    }

    formatWebApiPayload(obj: any): any {
        return this.jsHelperService.formatWebApiPayload(obj)
    }

    implode(glue: string, pieces: string[]): string {
        return this.jsHelperService.implode(glue, pieces);
    }

    setCookie(name, value, expireDays): boolean {
        return this.jsHelperService.setCookie(name, value, expireDays);
    }

    getCookie(cname): string {
        return this.jsHelperService.getCookie(cname);
    }

    dataUriToBlob(dataUri: string): Blob {
        return this.jsHelperService.dataUriToBlob(dataUri);
    }

    blobToDataUri(blob: Blob): Promise<string> {
        return this.jsHelperService.blobToDataUri(blob);
    }

    trackArrayProperty<T>(property: Array<T>, dto: T, idProperty: string, trackingType: PropertyTrackingEnum): void {
        this.jsHelperService.trackArrayProperty<T>(property, dto, idProperty, trackingType);
    }

    nameof<T>(key: keyof T, instance?: T): keyof T {
        return key;
    }

    isExpiredToken(jwtToken: JwtToken, timeDifference?: number): boolean {
        return this.jsHelperService.isExpiredToken(jwtToken, timeDifference);
    }

    // #endregion

    // #region LocalStorageService
    async setItem(key: string, value: any): Promise<boolean> {
        return this.localStorageService.setItem(key, value);
    }

    async getItem(key: string): Promise<any> {
        return this.localStorageService.getItem(key);
    }

    async removeItem(key: string): Promise<boolean> {
        return this.localStorageService.removeItem(key);
    }

    async removeAllItems(): Promise<boolean> {
        return this.localStorageService.removeAllItems();
    }

    //async setSessionItem(key: string, value: any): Promise<boolean> {
    //	return this.localStorageService.setSessionItem(key, value);
    //}

    //async getSessionItem<T>(key: string): Promise<T> {
    //	return this.localStorageService.getSessionItem<T>(key);
    //}

    //async removeSessionItem(key: string): Promise<boolean> {
    //	return this.localStorageService.removeSessionItem(key);
    //}

    //async removeAllSessionItems(): Promise<boolean> {
    //	return this.localStorageService.removeAllSessionItems();
    //}

    // #endregion

    // #region PbxService CompanyProfile
    getCountryIsoCodes(accessToken: string): Promise<Array<CountryDto>> {
        return this.pbxService.getCountryIsoCodes(accessToken);
    }

    getCompanyProfileById(id: number, accessToken: string): Promise<CompanyProfileDto> {
        return this.pbxService.getCompanyProfileById(id, accessToken);
    }

    getCompanyProfilesByMemberId(id: IdDto, accessToken: string): Promise<Array<CompanyProfileDto>> {
        return this.pbxService.getCompanyProfilesByMemberId(id, accessToken);
    }

    searchCompanyProfilesByName(term: SearchTermDto, accessToken: string): Promise<Array<CompanyProfileDto>> {
        return this.pbxService.searchCompanyProfilesByName(term, accessToken);
    }

    searchCompanyProfilesByLocation(location: LocationSearchDto, accessToken: string): Promise<Array<CompanyProfileDto>> {
        return this.pbxService.searchCompanyProfilesByLocation(location, accessToken);
    }
    // #endregion

    // #region PbxService CompanyEmployee

    getCompanyEmployeeById(id: number, accessToken: string): Promise<CompanyEmployeeDto> {
        return this.pbxService.getCompanyEmployeeById(id, accessToken);
    }

    getCompanyEmployeesByCompanyProfileId(idDto: IdDto, accessToken: string): Promise<Array<CompanyEmployeeDto>> {
        return this.pbxService.getCompanyEmployeesByCompanyProfileId(idDto, accessToken);
    }

    getCompanyEmployeeByMemberId(companyProfileId: number, memberId: number, accessToken: string): Promise<CompanyEmployeeDto> {
        return this.pbxService.getCompanyEmployeeByMemberId(companyProfileId, memberId, accessToken);
    }

    getCompanyEmployeeByEmail(email: string, companyProfileId: number, accessToken: string): Promise<CompanyEmployeeDto> {
        return this.pbxService.getCompanyEmployeeByEmail(email, companyProfileId, accessToken);
    }

    searchCompanyEmployeesByEmail(emailSearch: SearchTermDto, companyProfileId: number, accessToken: string): Promise<Array<CompanyEmployeeInviteDto>> {
        return this.pbxService.searchCompanyEmployeesByEmail(emailSearch, companyProfileId, accessToken);
    }

    searchCompanyEmployeeByFirstName(term: SearchTermDto, companyProfileId: number, accessToken: string): Promise<CompanyEmployeeDto> {
        return this.pbxService.searchCompanyEmployeeByFirstName(term, companyProfileId, accessToken);
    }

    searchCompanyEmployeeByLastName(term: SearchTermDto, companyProfileId: number, accessToken: string): Promise<CompanyEmployeeDto> {
        return this.pbxService.searchCompanyEmployeeByLastName(term, companyProfileId, accessToken);
    }

    // #endregion

    // #region PbxService Utilities
    getMemberById(memberId: number, accessToken: string): Promise<MemberType> {
        return this.pbxService.getMemberById(memberId, accessToken);
    }

    async getHubConnectionEmailByGuid(guid: string, accessToken: string): Promise<string> {
        return this.pbxService.getHubConnectionEmailByGuid(guid, accessToken);
    }
    // #endregion

    // #region PbxService CompanyLocation
    getCompanyLocationById(companyLocationId: number, accessToken: string): Promise<CompanyLocationDto> {
        return this.pbxService.getCompanyLocationById(companyLocationId, accessToken);
    }

    getCompanyLocationsByCompanyProfileId(companyProfileId: IdDto, accessToken: string): Promise<Array<CompanyLocationDto>> {
        return this.pbxService.getCompanyLocationsByCompanyProfileId(companyProfileId, accessToken);
    }

    searchCompanyLocationsByLocation(locationSearch: LocationSearchDto, companyProfileId: number, accessToken: string): Promise<Array<CompanyLocationDto>> {
        return this.pbxService.searchCompanyLocationsByLocation(locationSearch, companyProfileId, accessToken);
    }

    // #endregion

    // #region PbxService CompanyVideo
    getCompanyVideoById(companyVideoId: number, accessToken: string): Promise<CompanyVideoDto> {
        return this.pbxService.getCompanyVideoById(companyVideoId, accessToken);
    }

    getCompanyVideosByCompanyProfileId(companyProfileId: IdDto, accessToken: string): Promise<Array<CompanyVideoDto>> {
        return this.pbxService.getCompanyVideosByCompanyProfileId(companyProfileId, accessToken);
    }

    // #endregion

    // #region PbxService CompanyPhoto
    getCompanyPhotoById(companyPhotoId: number, accessToken: string): Promise<CompanyPhotoDto> {
        return this.pbxService.getCompanyPhotoById(companyPhotoId, accessToken);
    }

    getCompanyPhotosByCompanyProfileId(companyProfileId: IdDto, accessToken: string): Promise<Array<CompanyPhotoDto>> {
        return this.pbxService.getCompanyPhotosByCompanyProfileId(companyProfileId, accessToken);
    }

    // #endregion

    // #region PbxService PbxLine
    getPbxLineById(id: number, accessToken: string): Promise<PbxLineDto> {
        return this.pbxService.getPbxLineById(id, accessToken);
    }

    getPbxLinesByCompanyProfileId(companyProfileId: IdDto, accessToken: string): Promise<Array<PbxLineDto>> {
        return this.pbxService.getPbxLinesByCompanyProfileId(companyProfileId, accessToken);
    }

    getMemberPbxLines(dto: PagingOrderByDto, accessToken: string): Promise<Array<PbxLineDto>> {
        return this.pbxService.getMemberPbxLines(dto, accessToken);
    }

    getEmployeePbxLines(dto: IdDto, memberId: number, accessToken: string): Promise<Array<PbxLineDto>> {
        return this.pbxService.getEmployeePbxLines(dto, memberId, accessToken);
    }

    searchPbxLinesByLineName(lineNameSearch: SearchTermDto, companyProfileId: number, accessToken: string): Promise<Array<PbxLineDto>> {
        return this.pbxService.searchPbxLinesByLineName(lineNameSearch, companyProfileId, accessToken);
    }

    // #endregion

    // #region PbxService PbxLineRep
    getPbxLineRepById(id: number, accessToken: string): Promise<PbxLineRepDto> {
        return this.pbxService.getPbxLineRepById(id, accessToken);
    }

    getPbxLineRepByEmployeeId(companyEmployeeId: number, pbxLineId: number, accessToken: string): Promise<PbxLineRepDto> {
        return this.pbxService.getPbxLineRepByEmployeeId(companyEmployeeId, pbxLineId, accessToken);
    }

    getPbxLineRepsByCompanyProfileId(companyProfileId: IdDto, accessToken: string): Promise<Array<PbxLineRepDto>> {
        return this.pbxService.getPbxLineRepsByCompanyProfileId(companyProfileId, accessToken);
    }

    getPbxLineRepsByPbxLineId(pbxLineId: LongIdDto, accessToken: string): Promise<Array<PbxLineRepDto>> {
        return this.pbxService.getPbxLineRepsByPbxLineId(pbxLineId, accessToken);
    }

    searchPbxLineRepsByEmployeeFirstName(term: SearchTermDto, accessToken: string): Promise<Array<PbxLineRepDto>> {
        return this.pbxService.searchPbxLineRepsByEmployeeFirstName(term, accessToken);
    }

    // #endregion

    // #region PbxService PbxLineRepStatus
    getPbxLineRepStatusById(pbxLineRepStatusId: number, accessToken: string): Promise<PbxLineRepStatusDto> {
        return this.pbxService.getPbxLineRepStatusById(pbxLineRepStatusId, accessToken);
    }

    getPbxLineRepStatusByPbxLineRepId(pbxLineRepId: LongIdDto, accessToken: string): Promise<Array<PbxLineRepStatusDto>> {
        return this.pbxService.getPbxLineRepStatusByPbxLineRepId(pbxLineRepId, accessToken);
    }

    getPbxLineRepStatusByConnectionGuid(guid: string, accessToken: string): Promise<PbxLineRepStatusDto> {
        return this.pbxService.getPbxLineRepStatusByConnectionGuid(guid, accessToken);
    }

    isRepOnline(pbxLineRepId: number, accessToken: string): Promise<boolean> {
        return this.pbxService.isRepOnline(pbxLineRepId, accessToken);
    }

    // #endregion

    // #region PbxService PbxCallQueue
    createPbxCallQueue(pbxCallQueue: PbxCallQueueDto, accessToken: string): Promise<PbxCallQueueDto> {
        return this.pbxService.createPbxCallQueue(pbxCallQueue, accessToken);
    }

    updatePbxCallQueue(pbxCallQueue: PbxCallQueueDto, accessToken: string): Promise<PbxCallQueueDto> {
        return this.pbxService.updatePbxCallQueue(pbxCallQueue, accessToken);
    }

    deletePbxCallQueue(pbxCallQueue: PbxCallQueueDto, accessToken: string): Promise<string> {
        return this.pbxService.deletePbxCallQueue(pbxCallQueue, accessToken);
    }

    getPbxCallQueueById(pbxCallQueueId: number, accessToken: string): Promise<PbxCallQueueDto> {
        return this.pbxService.getPbxCallQueueById(pbxCallQueueId, accessToken);
    }

    getPbxCallQueuesByPbxLineRepId(pbxlineRepId: IdDto, accessToken: string): Promise<Array<PbxCallQueueDto>> {
        return this.pbxService.getPbxCallQueuesByPbxLineRepId(pbxlineRepId, accessToken);
    }

    // #endregion

    // #region PbxService ContactUs
    async createContactUs(model: ContactUsDto): Promise<ContactUsDto> {
        return this.pbxService.createContactUs(model);
    }

    async getContactUsById(contactUsId: number): Promise<ContactUsDto> {
        return this.pbxService.getContactUsById(contactUsId);
    }
    // #endregion

    // #region ConfigService
    get pbxController(): string { return this.configService.pbxController; }
    get netcastController(): string { return this.configService.netcastController; }
    get netcasteeBaseUrl(): string { return this.configService.netcasteeBaseUrl; }
    get netcastImageUrl(): string { return this.configService.netcastImageUrl; }

    //get accessTokenFileName(): string { return this.configService.keyAccessTokenFile; }
    get defaultAvatar(): string { return this.configService.defaultAvatar; }
    //get settingsFile(): string { return this.configService.settingsFile; }
    get contactAvatarBaseUrl(): string { return this.configService.contactAvatarBaseUrl; }
    get avatarBaseUrl(): string { return this.configService.avatarBaseUrl; }
    get blockedEmailsFilename(): string { return this.configService.blockedEmailsFilename; }
    get pushApplicationName(): string { return this.configService.pushApplicationName; }
    get memberProfile(): string { return this.configService.memberProfile; }
    //get memberTokenFilename(): string { return this.configService.memberTokenFilename; }
    //get guestTokenFilename(): string { return this.configService.guestTokenFilename; }
    get webRtcHubProxyName(): string { return this.configService.webRtcHubProxyName; }
    get clientIdHubProxyName(): string { return this.configService.clientIdHubProxyName; }
    get senderId(): string { return this.configService.senderId; }
    get pushId(): string { return this.configService.pushId; }
    get subscribePushNotificationEndPoint(): string { return this.configService.subscribePushNotificationEndPoint; }
    get hubUrl(): string { return this.configService.hubUrl; }
    get contactList(): string { return this.configService.contactList; }
    get webApiBase(): string { return this.configService.webApiBase; }
    get pbxContentUrl(): string { return this.configService.pbxContentUrl; }
    get employeeImageFolder(): string { return this.configService.employeeImageFolder; }
    get pbxLineImageFolder(): string { return this.configService.pbxLineImageFolder; }
    get companyLocationImageFolder(): string { return this.configService.companyLocationImageFolder; }
    get companyVideoImageFolder(): string { return this.configService.companyVideoImageFolder; }
    get companyPhotoImageFolder(): string { return this.configService.companyPhotoImageFolder; }
    get domainName(): string { return this.configService.domainName; }
    // #endregion

    // #region UserService
    get redirectUrl(): string {
        return this.userService.redirectUrl;
    }
    set redirectUrl(value: string) {
        this.userService.redirectUrl = value;
    }

    async getIsLoggedIn(): Promise<boolean> {
        return this.userService.getIsLoggedIn();
    }

    async setIsLoggedIn(value: boolean): Promise<boolean> {
        return this.userService.setIsLoggedIn(value);
    }

    async getProfile(): Promise<MemberType> {
        return this.userService.getProfile();
    }
    async setProfile(value: MemberType): Promise<boolean> {
        //console.log("service setProfile: ", value);
        return this.userService.setProfile(value);
    }

    async getGuestProfile(): Promise<GuestProfileType> {
        return this.userService.getGuestProfile();
    }
    async setGuestProfile(value: GuestProfileType): Promise<boolean> {
        return this.userService.setGuestProfile(value);
    }

    get onProfileUpdated(): Observable<MemberType> {
        return this.userService.onProfileUpdated;
    }

    async getMyProfile(accessToken: string): Promise<MemberType> {
        return this.userService.getMyProfile(accessToken);
    }

    register(register: RegisterDto, accessToken: string): Promise<MemberType> {
        return this.userService.register(register, accessToken);
    }

    addMemberProfileImage(dataUri: string, accessToken: string): Promise<MemberType> {
        return this.userService.addMemberProfileImage(dataUri, accessToken);
    }

    deleteMemberProfileImage(accessToken: string): Promise<MemberType> {
        return this.userService.deleteMemberProfileImage(accessToken);
    }

    requestMemberId(email: string, accessToken: string): Promise<string> {
        return this.userService.requestMemberId(email, accessToken);
    }

    requestAvatarFilename(email: string, accessToken: string): Promise<string> {
        return this.userService.requestAvatarFilename(email, accessToken);
    }

    updateMyProfile(member: MemberType, accessToken: string): Promise<MemberType> {
        return this.userService.updateMyProfile(member, accessToken);
    }

    requestMemberAvatarDataUri(email: string, accessToken: string): Promise<string> {
        return this.userService.requestMemberAvatarDataUri(email, accessToken);
    }

    getMemberByEmail(email: string, accessToken: string): Promise<MemberType> {
        return this.userService.getMemberByEmail(email, accessToken);
    }

    sendInvite(invite: SendInviteDto, accessToken: string): Promise<boolean> {
        return this.userService.sendInvite(invite, accessToken);
    }

    clearRefreshToken(refreshTokenId: string, accessToken: string): Promise<boolean> {
        return this.userService.clearRefreshToken(refreshTokenId, accessToken);
    }

    verifyPassword(password: string, accessToken: string): Promise<boolean> {
        return this.userService.verifyPassword(password, accessToken);
    }

    changePassword(password: string, accessToken: string): Promise<MemberType> {
        return this.userService.changePassword(password, accessToken);
    }

    sendPasswordResetRequest(email: string, accessToken: string): Promise<void> {
        return this.userService.sendPasswordResetRequest(email, accessToken);
    }

    updateEmail(email: string, accessToken: string): Promise<MemberType> {
        return this.userService.updateEmail(email, accessToken);
    }

    updateUsername(username: string, accessToken: string): Promise<MemberType> {
        return this.userService.updateUsername(username, accessToken);
    }

    isEmailUnique(email: string, accessToken: string): Promise<string> {
        return this.userService.isEmailUnique(email, accessToken);
    }

    isUsernameUnique(username: string, accessToken: string): Promise<string> {
        return this.userService.isUsernameUnique(username, accessToken);
    }

    async canGuestLogin(email: string, accessToken: string): Promise<boolean> {
        return this.userService.canGuestLogin(email, accessToken);
    }

    // #endregion

    // #region PhoneService
    _acceptedCall: CallType;
    set acceptedCall(value: CallType) {
        this._acceptedCall = value;
    }
    get acceptedCall(): CallType {
        return this._acceptedCall;
    }

    _phoneLine: PhoneLineType;
    get phoneLine(): PhoneLineType {
        return this._phoneLine;
    }
    set phoneLine(value: PhoneLineType) {
        this._phoneLine = value;
    }

    _localPhoneLineConnection: PhoneLineConnectionType;
    get localPhoneLineConnection(): PhoneLineConnectionType {
        return this._localPhoneLineConnection;
    }
    set localPhoneLineConnection(value: PhoneLineConnectionType) {
        this._localPhoneLineConnection = value;
    }

    _phoneLineOnHold: PhoneLineType;
    get phoneLineOnHold(): PhoneLineType {
        return this._phoneLineOnHold;
    }
    set phoneLineOnHold(value: PhoneLineType) {
        this._phoneLineOnHold = value;
    }

    _localPhoneLineConnectionOnHold: PhoneLineConnectionType;
    get localPhoneLineConnectionOnHold(): PhoneLineConnectionType {
        return this._localPhoneLineConnectionOnHold;
    }
    set localPhoneLineConnectionOnHold(value: PhoneLineConnectionType) {
        this._localPhoneLineConnectionOnHold = value;
    }
    _currentCallAttempt: CurrentCallAttemptType;
    get currentCallAttempt(): CurrentCallAttemptType {
        return this._currentCallAttempt;
    }
    set currentCallAttempt(value: CurrentCallAttemptType) {
        this._currentCallAttempt = value;
    }

    //async getLocalGuid(): Promise<string> {
    //    return this.signalrService.getLocalGuid();
    //}

    //async setLocalGuid(value: string): Promise<boolean> {
    //    return this.signalrService.setLocalGuid(value);
    //}

    get localGuid(): string {
        return this.signalrService.localGuid;
    }

    //set localGuid(value: string) {
    //    this.signalrService.localGuid = value;
    //}



    setLocalGuid(localGuid: string): void {
        return this.signalrService.setLocalGuid(localGuid);
    }

    unsetLocalGuid(): Promise<void> {
        return this.signalrService.unsetLocalGuid();
    }

    _localMediaStream: MediaStream;
    get localMediaStream(): MediaStream {
        return this._localMediaStream;
    }
    set localMediaStream(value: MediaStream) {
        this._localMediaStream = value;
    }

    async isPhoneBusy(): Promise<boolean> {
        //return this.phoneService.isPhoneBusy();
        let isUserBusy = true;

        //console.log("service.isPhoneBusy() this.phoneLine: ", this.phoneLine);

        if (this.isEmpty(this.phoneLine)) {
            // user doesn't have a phoneline, so they are not busy

            isUserBusy = false;
        }
        else {
            // user has a phoneline, we need to check it to see if their is anyone else in the phoneline other than the user
            if (this.isEmpty(this.phoneLine.phoneLineConnections)) {
                // there are no phoneLineConnetions so the user isn't busy in another call
                isUserBusy = false;
            }
            else {
                // there is atleast one phonelineConnection, so check see if any is not the user's phoneline connection
                // this will indicate the user is in a conversation with another user
                //let localGuid = await this.getLocalGuid();
                let index = this.phoneLine.phoneLineConnections.findIndex((value) => {
                    return value.hubConnection.connectionGuid != this.localGuid;
                });

                if (index < 0) {
                    isUserBusy = false;
                }
            }
        }
        //console.log("service.isPhoneBusy() isUserBusy: ", isUserBusy);
        return isUserBusy;
    }

    async initPhoneService(name: string): Promise<void> {
        //return this.phoneService.init();
        try {
            let isHubConnectionReady: boolean = await this.isHubConnectionReady();

            if (isHubConnectionReady === false) {
                //console.log("phone.service.ts init() webRtcHub.state", this.signalrService.webRtcHub.state);
                //reject("phoneService.init() failed. signalrService.webRtcHub.state.connectionGuid not set. You can get the connectionGuid aka localGuid by performing a signalrService.webrtcHubCheckIn");

                //console.log(this.webRtcHub);

                let localGuid: string = await this.webrtcHubCheckIn(name);
                if (this.isEmpty(localGuid)) {
                    throw ("There is no connection to the video communctions hub.");
                }
                await this.setLocalGuid(localGuid);
                return;
            }
            else {
                //this.localGuid = this.signalrService.webRtcHub.state.connectionGuid;
                return;
            }
        }
        catch (e) {
            throw (e);
        }
    }

    getPhoneLineConnectionFromCacheByRemoteGuid(remoteGuid: string): PhoneLineConnectionType {
        //return this.phoneService.getPhoneLineConnectionFromCacheByRemoteGuid(remoteGuid);
        let phoneLineConnection: PhoneLineConnectionType = this.phoneLine.phoneLineConnections.find((value) => {
            return value.hubConnection.connectionGuid == remoteGuid && value.hubConnection.isDeleted == false;
        });
        return phoneLineConnection;
    }

    async tryGetPhoneLine(): Promise<PhoneLineType> {
        //return this.phoneService.tryGetPhoneLine();
        try {
            if (this.isEmpty(this.phoneLine)) {
                // get a new phoneline
                let phoneLine: PhoneLineType;
                try {
                    phoneLine = await this.requestNewPhoneLine();
                }
                catch (e) {
                    throw ("Unable to establish phone line");
                }

                this.phoneLine = phoneLine;
                return phoneLine;
            }
            else {
                return this.phoneLine;
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async getLocalMediaStream(): Promise<MediaStream> {
        try {
            let hasSpeakers: boolean = false;
            let hasMicroPhone: boolean = false;
            let hasCamera: boolean = false;
            let mediaDeviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
            if (this.isEmpty(mediaDeviceInfos) || mediaDeviceInfos.length < 0) {
                throw ("No media devices found.");
            }

            let audioOutputIndex: number = mediaDeviceInfos.findIndex((mediaDeviceInfo: MediaDeviceInfo) => {
                return mediaDeviceInfo.kind === "audiooutput" && this.isEmpty(mediaDeviceInfo.groupId) === false;
            });

            if (audioOutputIndex > -1) {
                hasSpeakers = true;
            }

            let audioInputIndex: number = mediaDeviceInfos.findIndex((mediaDeviceInfo: MediaDeviceInfo) => {
                return mediaDeviceInfo.kind === "audioinput";
            });

            if (audioInputIndex > -1) {
                hasMicroPhone = true;
            }

            let videoDeviceIndex: number = mediaDeviceInfos.findIndex((mediaDeviceInfo: MediaDeviceInfo) => {
                return mediaDeviceInfo.kind === "videoinput";
            });

            if (videoDeviceIndex > -1) {
                hasCamera = true;
            }

            if (hasCamera === false) {
                throw ("No cameras found.");
            }

            // TODO: put together the constraints and grab the LocalMediaStream
            // get the active AudioDeviceId from settings
            //let audioDeviceId = this.activeAudioDeviceId;
            let videoDeviceId = this.activeVideoDeviceId;
            let constraints: MediaStreamConstraints = {};
            let mediaStream: MediaStream;

            //console.log("audioDeviceId: ", audioDeviceId);
            //console.log("videoDeviceId: ", videoDeviceId);

            if (this.isEmpty(videoDeviceId) === false) {
                //console.log("using device id")
                // let videoConstraints: MediaTrackConstraints = {
                //   deviceId: { exact: videoDeviceId },
                //   frameRate: 15,
                //   width: 320,
                //   height: 240
                // }

                let videoConstraints: MediaTrackConstraints = {
                    deviceId: { exact: videoDeviceId }
                }

                constraints.video = videoConstraints;
                constraints.audio = (hasSpeakers && hasMicroPhone) ? true : false;
            }
            else {
                //console.log("no device ids")
                constraints.video = true;
                constraints.audio = (hasSpeakers && hasMicroPhone) ? true : false;
            }

            //console.log("constraints: ", constraints);

            mediaStream = await this.getUserMedia(constraints);

            return mediaStream;
        }
        catch (e) {
            //console.log("e: ", e);
            throw (e);
        }

        /*
          //return this.phoneService.getLocalMediaStream();
          try {
            // TODO: put together the constraints and grab the LocalMediaStream
            // get the active AudioDeviceId from settings
            //let audioDeviceId = this.activeAudioDeviceId;
            let videoDeviceId = this.activeVideoDeviceId;
            let constraints: MediaStreamConstraints = {};
            let mediaStream: MediaStream;
    
            //console.log("audioDeviceId: ", audioDeviceId);
            //console.log("videoDeviceId: ", videoDeviceId);
    
            if (this.isEmpty(videoDeviceId) === false) {
              //console.log("using device id")
              let videoConstraints: MediaTrackConstraints = {
                deviceId: { exact: videoDeviceId },
                frameRate: 15,
                width: 320,
                height: 240
              }
    
              constraints.video = videoConstraints;
              constraints.audio = true;
            }
            else {
              //console.log("no device ids")
              constraints.video = true;
              constraints.audio = true;
            }
    
            //console.log("constraints: ", constraints);
    
            try {
              mediaStream = await this.getUserMedia(constraints)
            }
            catch (e) {
              throw (e);
            }
    
            if (this.isEmpty(mediaStream)) {
              throw ("Unable to get video stream");
            }
    
            return mediaStream;
          }
          catch (e) {
            //console.log("e: ", e);
            throw (e);
          }
          */
    }

    stopMediaStream(stream: MediaStream): void {
        if (this.jsHelperService.isEmpty(stream) === false) {
            let tracks: MediaStreamTrack[] = stream.getTracks();
            tracks.forEach((t) => {
                if (this.isIos()) {
                    t.enabled = false;
                }
                else {
                    t.enabled = false;
                    t.stop();
                }

            });

            return;
        }

    }

    updateMediaStreamVideo(stream: MediaStream, videoEnabled = true): void {
        let tracks: MediaStreamTrack[] = stream.getTracks();
        tracks.forEach((t: MediaStreamTrack) => {
            console.log("MediaStreamTrack: ", t);
            if (t.kind.toLowerCase() == "video") {
                t.enabled = videoEnabled;
            }
        });
    }

    updateMediaStreamAudio(stream: MediaStream, audioEnabled = true): void {
        let tracks: MediaStreamTrack[] = stream.getTracks();
        tracks.forEach((t: MediaStreamTrack) => {
            console.log("MediaStreamTrack: ", t);
            if (t.kind.toLowerCase() == "audio") {
                t.enabled = audioEnabled;
            }
        });
    }

    // for testing only
    async getDefaultMediaStream(): Promise<MediaStream> {
        try {
            let constraints: MediaStreamConstraints = {};
            // NOTE: currently we always set the audio device to true
            constraints.audio = true;
            constraints.video = true;
            try {
                let mediaStream: MediaStream = await this.videoHelperService.getUserMedia(constraints);
                return mediaStream;
            }
            catch (error) {
                throw (error);
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async tryGetLocalPhoneLineConnection(): Promise<PhoneLineConnectionType> {
        //return this.phoneService.tryGetLocalPhoneLineConnection();
        try {
            if (this.isEmpty(this.localPhoneLineConnection)) {
                // get a new phoneline
                let phoneLineConnection: PhoneLineConnectionType;
                try {
                    phoneLineConnection = await this.requestNewPhoneLineConnection(this.phoneLine.phoneLineGuid);
                }
                catch (e) {
                    throw (e);
                }
                try {
                    this.setLocalPhoneLineConnection(phoneLineConnection);
                }
                catch (e) {
                    throw (e);
                }

                return this.localPhoneLineConnection;
            }
            else {
                //check if the existing phoneLineConnection.phoneLineId matches the set phoneLine
                if (this.localPhoneLineConnection.phoneLineId === this.phoneLine.phoneLineId) {
                    //console.log("phone.service.ts.tryGetLocalPhoneLineConnection() using old phoneLineConnection: ", this.localPhoneLineConnection);
                    return this.localPhoneLineConnection;
                }
                else {
                    let phoneLineConnection: PhoneLineConnectionType;
                    try {
                        phoneLineConnection = await this.requestNewPhoneLineConnection(this.phoneLine.phoneLineGuid);
                    }
                    catch (e) {
                        throw (e);
                    }
                    try {
                        this.setLocalPhoneLineConnection(phoneLineConnection);
                    }
                    catch (e) {
                        throw (e);
                    }

                    return this.localPhoneLineConnection;
                }
            }
        }
        catch (e) {
            throw (e);
        }
    }

    setLocalPhoneLineConnection(phoneLineConnection: PhoneLineConnectionType): void {
        //return this.phoneService.setLocalPhoneLineConnection(phoneLineConnection);
        if (this.isEmpty(this.phoneLine) === false) {
            if (this.phoneLine.phoneLineId === phoneLineConnection.phoneLineId) {
                this.localPhoneLineConnection = phoneLineConnection;
                return;
            }
            else {
                throw ("Invalid phone line connection provided");
            }
        }
        else {
            throw ("No phoneline to establish phone line connection");
        }
    }

    addPhoneLineConnectionToPhoneLine(phoneLineConnection: PhoneLineConnectionType): void {
        //return this.phoneService.addPhoneLineConnectionToPhoneLine(phoneLineConnection);
        if (this.isEmpty(this.phoneLine) === false) {
            if (phoneLineConnection.phoneLineId === this.phoneLine.phoneLineId && phoneLineConnection.isDeleted === false) {
                if (this.isEmpty(this.phoneLine.phoneLineConnections)) {
                    //console.log("empty phoneline.phoneLineConnetions", this.phoneLine)
                    this.phoneLine.phoneLineConnections = new Array<PhoneLineConnectionType>();
                    this.phoneLine.phoneLineConnections.push(phoneLineConnection);
                    return;
                }
                else {
                    let index: number = this.phoneLine.phoneLineConnections.findIndex((value) => {
                        // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
                        return value.hubConnection.email == phoneLineConnection.hubConnection.email;
                    })

                    // if the phoneLineConnection is not already in the phoneLine.phoneLineConnections array then add it, else skip adding it and just resolve()
                    if (index < 0) {
                        this.phoneLine.phoneLineConnections.push(phoneLineConnection);
                    }
                    return
                }
            }
            else {
                throw ("Invalid phone line connection");
            }
        }
        else {
            throw ("No phone line.");
        }
    }

    removePhoneLineConnectionFromPhoneLine(phoneLineConnection: PhoneLineConnectionType): void {
        if (this.isEmpty(this.phoneLine) === false) {
            if (phoneLineConnection.phoneLineId === this.phoneLine.phoneLineId && phoneLineConnection.isDeleted === false) {
                if (this.isEmpty(this.phoneLine.phoneLineConnections)) {
                    // there are no phoneLineConnections to remove
                    return;
                }
                else {
                    let index: number = this.phoneLine.phoneLineConnections.findIndex((value) => {
                        // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
                        return value.phoneLineConnectionId == phoneLineConnection.phoneLineConnectionId;
                    })

                    // if the phoneLineConnection is in the array, remove it from the array
                    if (index < 0) {
                        this.phoneLine.phoneLineConnections.splice(index, 1);
                    }
                    return;
                }
            }
            else {
                throw ("Invalid phone line connection");
            }
        }
        else {
            // there is no phoneLine. so there are no phoneLineConnections to remove
            return;
        }
    }

    removePhoneLineConnectionFromPhoneLineUsingRemoteGuid(remoteGuid: string): void {
        if (this.isEmpty(this.phoneLine) === false) {
            let phoneLineConnection = this.getPhoneLineConnectionFromCacheByRemoteGuid(remoteGuid);
            if (this.isEmpty(phoneLineConnection) === false) {
                if (phoneLineConnection.phoneLineId === this.phoneLine.phoneLineId && phoneLineConnection.isDeleted === false) {
                    if (this.isEmpty(this.phoneLine.phoneLineConnections)) {
                        // there are no phoneLineConnections to remove
                        return;
                    }
                    else {
                        let index: number = this.phoneLine.phoneLineConnections.findIndex((value) => {
                            // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
                            return value.phoneLineConnectionId == phoneLineConnection.phoneLineConnectionId;
                        })

                        // if the phoneLineConnection is in the array, remove it from the array
                        if (index > -1) {
                            this.phoneLine.phoneLineConnections.splice(index, 1);
                        }

                        return;
                    }
                }
                else {
                    throw ("removePhoneLineConnectionFromPhoneLineUsingRemoteGuid() -> error attempting to remove a phoneLineConnection with phoneLineId that is not matching the current phoneLine.");
                }
            }
            else {
                // TODO: maybe reject this, for now we resolve and console log it
                //console.log("removePhoneLineConnectionFromPhoneLineUsingRemoteGuid() -> error there is no phoneLineConnection with the remoteGuid: " + remoteGuid);
                return;
            }
        }
        else {
            // there is no phoneLine. so there are no phoneLineConnections to remove
            return;
        }
    }

    createRtcPeerConnection(): RTCPeerConnection {
        try {
            // NOTE: you must instantiate the iceServer into an instance object, then use the instance
            // object as a value for the iceServers array becuase RTCIceServer interface is missing the property urls
            // inorder to add more properties to the interface at runtime we need to create instance of iceServer,
            // then assign it to the RTCIceServer array. It has todo with TypeScript handling interfaces
            //let iceServer1: RTCIceServer = {
            //	urls: "turn:52.26.140.197:3478",
            //	username: "username1",
            //	credential: "password1",
            //	credentialType: "password"
            //};

            let iceServer1: RTCIceServer = {
                urls: "turn:52.26.140.197:3478",
                username: "username1",
                credential: "password1"
                //credentialType: "password"
            }
            //iceServer1.credentialType = "password";

            let iceServers = new Array(iceServer1);

            let config: RTCConfiguration = {
                iceServers: iceServers
            }

            let pc = new RTCPeerConnection(config);
            return pc;
        }
        catch (e) {
            throw (e);
        }
    }

    async phoneSendPbxPhoneLineInvitation(email: string, pbxLineRepId: number): Promise<string> {
        //return this.phoneService.sendPbxPhoneLineInvitation(email, pbxLineRepId);
        try {
            await this.tryGetPhoneLine();
            await this.tryGetLocalPhoneLineConnection();
            let remoteGuid: string = await this.signalrService.sendPbxPhoneLineInvitation(this.phoneLine.phoneLineGuid, pbxLineRepId, email, this.localPhoneLineConnection.hubConnection.name);

            return remoteGuid;
        }
        catch (e) {
            throw (e);
        }
    }

    async acceptPbxPhoneLineInvitation(phoneLineGuid: string, remoteGuid: string): Promise<void> {
        //return this.phoneService.sendAcceptPhoneLineInvitation(phoneLineGuid, remoteGuid);
        //console.log("acceptedPbxPhoneLineInvitation: ", remoteGuid, phoneLineGuid);
        try {
            let phoneLine: PhoneLineType;
            try {
                phoneLine = await this.getPhoneLineByGuid(phoneLineGuid);
            }
            catch (e) {
                throw (e);
            }

            if (this.isEmpty(phoneLine)) {
                throw ("Unable to start a phone line.")
            }

            this.phoneLineOnHold = Object.assign({}, this.phoneLine);
            this.localPhoneLineConnectionOnHold = Object.assign({}, this.localPhoneLineConnection);

            this.phoneLine = phoneLine;

            await this.tryGetLocalPhoneLineConnection();

            await this.addPhoneLineConnectionToPhoneLine(this.localPhoneLineConnection);

            await this.sendAcceptPhoneLineInvitation(remoteGuid);
            await this.sendAreYouReadyForCallToGroup(); //hubConnections

            return;
            //.then((hubConnections: Array<HubConnection>) => {
            //	// TODO: use the array of hubConnection to display the users we are going to connect to
            //	// for now just resolve()
            //	console.log("phoneService.ts.sendAcceptPhoneLineInvitation() hubConnections: ", hubConnections);
            //	resolve();
            //})
            //.catch((error) => {
            //	reject(error);
            //})
        }
        catch (e) {
            console.log("service.acceptedPhoneLineInvitation e: ", e);
            throw (e);
        }
    }

    async phoneSendPhoneLineInvitation(email: string): Promise<string> {
        //return this.phoneService.sendPhoneLineInvitation(email);
        try {
            await this.tryGetPhoneLine();
            console.log("service.phoneSendPhoneLineInvitation got phoneLine: ", this.phoneLine);
            await this.tryGetLocalPhoneLineConnection();
            console.log("service.phoneSendPhoneLineInvitation got localPhoneLineConnection: ", this.localPhoneLineConnection);
            await this.addPhoneLineConnectionToPhoneLine(this.localPhoneLineConnection);
            let remoteGuid: string;
            try {
                remoteGuid = await this.sendPhoneLineInvitation(this.phoneLine.phoneLineGuid, email, this.localPhoneLineConnection.hubConnection.name);
            }
            catch (e) {
                throw (e);
            }

            if (this.isEmpty(remoteGuid)) {
                throw ("Unable to establish connection");
            }

            return remoteGuid;
        }
        catch (e) {
            throw (e);
        }
    }

    async acceptPhoneLineInvitation(phoneLineGuid: string, remoteGuid: string): Promise<void> {
        //return this.phoneService.sendAcceptPhoneLineInvitation(phoneLineGuid, remoteGuid);
        //console.log("acceptedPhoneLineInvitation: ", remoteGuid, phoneLineGuid);
        try {
            let phoneLine: PhoneLineType;
            try {
                phoneLine = await this.getPhoneLineByGuid(phoneLineGuid);
            }
            catch (e) {
                throw (e);
            }

            if (this.isEmpty(phoneLine)) {
                throw ("Unable to start a phone line.")
            }
            this.phoneLine = phoneLine;

            await this.tryGetLocalPhoneLineConnection();

            await this.addPhoneLineConnectionToPhoneLine(this.localPhoneLineConnection);

            await this.sendAcceptPhoneLineInvitation(remoteGuid);
            await this.sendAreYouReadyForCallToGroup(); //hubConnections

            return;
            //.then((hubConnections: Array<HubConnection>) => {
            //	// TODO: use the array of hubConnection to display the users we are going to connect to
            //	// for now just resolve()
            //	console.log("phoneService.ts.sendAcceptPhoneLineInvitation() hubConnections: ", hubConnections);
            //	resolve();
            //})
            //.catch((error) => {
            //	reject(error);
            //})
        }
        catch (e) {
            console.log("service.acceptedPhoneLineInvitation e: ", e);
            throw (e);
        }
    }

    async sendAreYouReadyForCallToGroup(): Promise<Array<HubConnection>> {
        //return this.phoneService.sendAreYouReadyForCallToGroup();
        //let localGuid = await this.getLocalGuid();
        let localGuid = this.localGuid;
        try {
            let hubConnections = new Array<HubConnection>();
            this.currentCallAttempt = new CurrentCallAttemptType();
            this.currentCallAttempt.maxWaitTime = 10000 * this.phoneLine.phoneLineConnections.length;
            for (let i = 0; i < this.phoneLine.phoneLineConnections.length; i++) {
                let phoneLineConnection = this.phoneLine.phoneLineConnections[i];
                if (phoneLineConnection.hubConnection.connectionGuid !== localGuid && phoneLineConnection.isDeleted === false) {
                    this.currentCallAttempt.phoneLineConnetions.push(phoneLineConnection);
                }
            }
            for (let i = 0; i < this.currentCallAttempt.phoneLineConnetions.length; i++) {
                let phoneLineConnection = this.currentCallAttempt.phoneLineConnetions[i];
                if (phoneLineConnection.hubConnection.connectionGuid !== localGuid && phoneLineConnection.hubConnection.isConnected === true) {
                    try {
                        let hubConnection: HubConnection = await this.signalrService.sendAreYouReadyForCall(this.localPhoneLineConnection.phoneLineConnectionId, phoneLineConnection.hubConnection.connectionGuid);
                        hubConnections.push(hubConnection);
                        //console.log("phone.service.ts sendAreYouReadyForCall() hubConnection: ", hubConnection);
                    }
                    catch (e) {
                        console.log("phone.service.ts sendAreYouReadyForCall() error: ", e);
                    }
                }
            }
            return hubConnections;
        }
        catch (e) {
            throw (e);
        }
    }

    //phoneServiceSendReadyForCall(remoteGuid: string): Promise<void> {
    //	return this.signalrService.sendReadyForCall(remoteGuid);
    //}

    //phoneServiceSendNotReadyForCall(errorMessage: string, remoteGuid: string): Promise<void> {
    //	return this.signalrService.sendNotReadyForCall(errorMessage, remoteGuid);
    //}

    //phoneServiceSendNotAcceptCall(remoteGuid: string): Promise<void> {
    //	return this.signalrService.sendNotAcceptCall(remoteGuid);
    //}

    //phoneServiceSendBusyResponse(remoteGuid: string): Promise<void> {
    //	return this.signalrService.sendBusyResponse(remoteGuid);
    //}

    //phoneServiceSendPrivateSmsMessage(message: string, remoteGuid: string): Promise<string> {
    //	return this.signalrService.sendPrivateSmsMessage(message, remoteGuid);
    //}

    //phoneServiceSendGroupSmsMessage(message: string, phoneLineGuid: string): Promise<string> {
    //	return this.signalrService.sendGroupSmsMessage(message, phoneLineGuid);
    //}

    //phoneServiceSendHangUpNotice(phoneLineGuid: string): Promise<void> {
    //	return this.signalrService.sendHangUpNotice(phoneLineGuid);
    //}

    async hangUp(): Promise<void> {
        //return this.phoneService.hangUp();
        try {
            if (this.isEmpty(this.phoneLine) === false) {
                try {
                    await this.sendHangUpNotice(this.phoneLine.phoneLineGuid);
                }
                catch (e) {
                    throw (e);
                }

                this.localPhoneLineConnection = null;

                this.phoneLine = null;

                return;
            }
            else {
                // there are no phonelines to hangup, so just resolve()
                return;
            }
        }
        catch (e) {
            throw (e);
        }
    }

    async initCall(isMember: boolean, call: CallType): Promise<boolean> {
        //return this.phoneService.initCall(isMember, call);

        try {
            if (this.isEmpty(call) === false
                && this.isEmpty(call.profile) === false
                && this.isEmpty(call.profile.email) === false
                && this.isEmpty(call.remoteGuid) === false
            ) {
                //if the user is currently in a call, they can not accept any more calls
                let isBusy = await this.isPhoneBusy();
                if (isBusy === false) {
                    console.log("phone.service.ts initCall not busy");
                    let isBlocked = false;
                    if (isMember) {
                        // loop through all the emails in the call.callers object to see if any are in the block list
                        let index = call.callers.findIndex((value) => {
                            return this.isBlockedEmailFromCache(value.profile.email)
                        });
                        isBlocked = (index > -1);
                    }
                    if (isBlocked) {
                        console.log("phone.service.ts initCall blocked:", isBlocked);
                        //this.sendNotAcceptCall(call.remoteGuid);
                        //reject(call.remoteGuid);
                        return false;
                    }
                    else {
                        //console.log("phone.service.ts initCall not blocked, displayincoming:", isBlocked);
                        //resolve(call);
                        return true;
                    }
                }
                else {
                    // TODO: since the user is in a conversation already, they can not accept this call, maybe in the future we will the
                    // user the option to end the current call and accept this call.
                    console.log("phone.service.ts initCall user is busy");
                    //this.sendBusyResponse(call.remoteGuid);
                    //reject(call.remoteGuid);
                    //throw("Unable to receive call, because user is currently busy in an existing call.")
                    return false;
                }
            }
            else {
                //// receive call with invalid data, such as missing entire profile or email
                console.log("phone.service.ts initCall invalid call object call:", call);
                //this.sendNotAcceptCall(call.remoteGuid);
                //reject(call.remoteGuid);
                //throw ("Unable to read caller information");
                return false;
            }
        }
        catch (e) {
            throw (e);
        }
    }

    putCurrentPhoneLineOnHold(): void {
        //return this.phoneService.putCurrentPhoneLineOnHold();
        this.localPhoneLineConnectionOnHold = this.localPhoneLineConnection;
        // store the old phoneLine in temp location for later retrieval
        this.phoneLineOnHold = this.phoneLine;
        // set the phoneLine to null and the localPhoneLineConnection to null so we can use it for the paged call
        this.phoneLine = null;
        this.localPhoneLineConnection = null;
    }

    async callContact(email): Promise<void> {
        //console.log("calling contact: ", email);
        try {
            if (!this.isEmpty(email)) {
                let remoteGuid: string;
                try {
                    remoteGuid = await this.phoneSendPhoneLineInvitation(email);
                }
                catch (e) {
                    throw ("Unable to make call at this time. Please try your request again.")
                }

                if (this.isEmpty(remoteGuid)) {
                    let alert = new MaterialAlertMessageType;
                    alert.title = 'call failed';
                    alert.message = `${email} does appear to be online`;
                    this.openAlert(alert);
                }
                else {
                    console.log('remote guide from the one im claling', remoteGuid)
                    //await this.displayOutgoingCall(email);

                    return;
                }
            }
            else {
                throw ("Email is required to make a call.")
            }
        }
        catch (e) {
            console.log("callContact Error: ", e);
            throw (e);
        }
    }

    //default timeout duration is 30 seconds
    //async displayOutgoingCall(email, duration = 60): Promise<void> {
    //	//console.log("displayingOutgoing");
    //	try {
    //		//let callingTimer: NodeJS.Timer;

    //		let accessToken: string;
    //		try {
    //			accessToken = await this.getAccessToken();
    //		}
    //		catch (e) {
    //			throw ("Access denied");
    //		}

    //		let member: MemberType;
    //		try {
    //			member = await this.getMemberByEmail(email, accessToken);
    //		}
    //		catch (e) {
    //			throw ("Unable to request identity of user to call.");
    //		}

    //		if (this.isEmpty(member)) {
    //			throw ("The email, " + email + " is not a member of our network.");
    //		}

    //		let outgoingCallDialog: Modal = this.modalCtrl.create(OutgoingCallDialogComponent, { member: member, duration: duration })
    //		outgoingCallDialog.onDidDismiss((remoteGuid: string) => {
    //			if (this.isEmpty(remoteGuid)) {
    //				try {
    //					this.cancelCall(email);
    //				}
    //				catch (e) {
    //					console.log("Cancel Call error: ", e);
    //				}
    //			}
    //		})

    //		outgoingCallDialog.present();

    //	}
    //	catch (e) {
    //		throw (e);
    //	}
    //}

    // move to view
    //async openPrivateSmsInterface(users: Array<GenericUserType>, selectedUser?: GenericUserType): Promise<string> {
    //	return new Promise<string>((resolve) => {
    //		if (this.isEmpty(users) === false) {
    //			// remove self from users
    //			let failedUsers: Array<GenericUserType>;
    //			let successUsers: Array<GenericUserType>;

    //			let modal = this.modalCtrl.create(PrivateMessagingComponent, {
    //				currentUser: this.isEmpty(selectedUser) ? null : selectedUser,
    //				users: users
    //			});

    //			modal.present();

    //		}
    //		else {
    //			let alert = new MaterialAlertMessageType();
    //			alert.title = "Please Check";
    //			alert.message = "You must be connected to atleast one other user to send a private message";
    //			this.openAlert(alert);
    //			resolve(null);
    //		}
    //	});
    //}

    // #endregion

    // #region SignalrService

    get webRtcHub(): SignalR.Hub.Proxy {
        return this.signalrService.webRtcHub;
    }

    async getJwtToken(): Promise<JwtToken> {
        return this.signalrService.getJwtToken();
    }

    async getRememberMe(): Promise<boolean> {
        return this.signalrService.getRememberMe();
    }
    async setRememberMe(value: boolean): Promise<boolean> {
        return this.signalrService.setRememberMe(value);
    }

    async getMemberId(): Promise<string> {
        return this.signalrService.getMemberId();
    }
    async setMemberId(value: string): Promise<boolean> {
        return this.signalrService.setMemberId(value);
    }

    async getEmail(): Promise<string> {
        return this.signalrService.getEmail();
    }
    async setEmail(value: string): Promise<boolean> {
        return this.signalrService.setEmail(value);
    }

    unsetEmail(): Promise<void> {
        return this.signalrService.unsetEmail();
    }

    get connection(): SignalR.Hub.Connection {
        return this.signalrService.connection;
    }
    getAccessToken(): Promise<string> {
        return this.signalrService.getAccessToken();
    }
    // Observable
    get receiveCancelInvitation(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveCancelInvitation;
    }
    get receivePhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePhoneLineInvitation;
    }

    get receiveAcceptPhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveAcceptPhoneLineInvitation;
    }
    get receiveAreYouReadyForCall(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveAreYouReadyForCall;
    }
    get receiveReadyForCall(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveReadyForCall;
    }
    get receiveNotReadyForCall(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveNotReadyForCall;
    }
    get receiveSDP(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveSDP;
    }
    get receiveICE(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveICE;
    }
    get receiveBusyResponse(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveBusyResponse;
    }
    get receiveNotAcceptCall(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveNotAcceptCall;
    }
    get receiveRemoteLogout(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveRemoteLogout;
    }
    get receivePutOnHold(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePutOnHold;
    }
    get receiveRemoveOnHold(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveRemoveOnHold;
    }
    get receiveGroupSmsMessage(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveGroupSmsMessage;
    }
    get receivePrivateSmsMessage(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePrivateSmsMessage;
    }
    get receiveHangUpNotice(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveHangUpNotice;
    }
    get receiveRepHangUpNotice(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveRepHangUpNotice;
    }
    get receivePing(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePing;
    }

    get receivePingResponse(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePingResponse;
    }
    get receiveSystemMessage(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveSystemMessage;
    }

    get receiveRequestNetcast(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveRequestNetcast;
    }
    get receiveRequestPCOnly(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveRequestPCOnly;
    }
    get receiveRequestPCStream(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveRequestPCStream;
    }
    // PBX
    get receivePbxPhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePbxPhoneLineInvitation;
    }
    get receivePbxRepPhoneLineInvitation(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePbxRepPhoneLineInvitation;
    }

    get receivePbxCallQueueNotes(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePbxCallQueueNotes;
    }
    get receivePbxCallQueueOccupants(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receivePbxCallQueueOccupants;
    }

    get someoneDisconnected(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.someoneDisconnected;
    }

    get receiveNetcastStub(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveNetcastStub;
    }

    get receiveRequestNetcastStub(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveRequestNetcastStub;
    }

    get receiveDisconnect(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveDisconnect;
    }

    //get receivePbxCallQueueLineRepUpdate(): BehaviorSubject<ObservableMessageType> {
    //	return this.signalrService.receivePbxCallQueueLineRepUpdate;
    //}
    //get receivePbxWaitUpdate(): BehaviorSubject<ObservableMessageType> {
    //	return this.signalrService.receivePbxWaitUpdate;
    //}

    //get receiveAddPbxCustomer(): BehaviorSubject<ObservableMessageType> {
    //	return this.signalrService.receiveAddPbxCustomer;
    //}

    //get receiveRemovePbxCustomer(): BehaviorSubject<ObservableMessageType> {
    //	return this.signalrService.receiveRemovePbxCustomer;
    //}

    get receiveNewPbxLineRep(): BehaviorSubject<ObservableMessageType> {
        return this.signalrService.receiveNewPbxLineRep;
    }

    isSignalrConnected(): boolean {
        return this.signalrService.isSignalrConnected();
    }

    async isProxySecretReady(): Promise<boolean> {
        return this.signalrService.isProxySecretReady();
    }

    async isHubConnectionReady(): Promise<boolean> {
        return this.signalrService.isHubConnectionReady();
    }

    async isAccessTokenReady(): Promise<boolean> {
        return this.signalrService.isAccessTokenReady();
    }

    async isEmailReady(): Promise<boolean> {
        return this.signalrService.isEmailReady();
    }

    initSignalrService(): Promise<void> {
        return this.signalrService.init();
    }

    startConnection(): Promise<void> {
        return this.signalrService.startConnection();
    }

    getGeneratedEmail(): Promise<string> {
        return this.signalrService.getGeneratedEmail();
    }

    requestIp(): Promise<string> {
        return this.signalrService.requestIp();
    }

    requestProxySecret(ip: string): Promise<string> {
        return this.signalrService.requestProxySecret(ip);
    }

    requestGuestToken(): Promise<JwtToken> {
        return this.signalrService.requestGuestToken();
    }

    getNewGuestToken(): Promise<JwtToken> {
        return this.signalrService.getNewGuestToken();
    }

    renewToken(jwtToken: JwtToken): Promise<JwtToken> {
        return this.signalrService.renewToken(jwtToken);
    }

    requestMemberToken(email: string, password: string): Promise<JwtToken> {
        return this.signalrService.requestMemberToken(email, password);
    }

    webrtcHubCheckOut(): Promise<void> {
        return this.signalrService.webrtcHubCheckOut();
    }

    webrtcHubCheckIn(displayName?: string): Promise<string> {
        return this.signalrService.webrtcHubCheckIn(displayName);
    }

    pbxRepCheckIn(pbxLineRepId: string): Promise<Array<PbxCallQueueDto>> {
        return this.signalrService.pbxRepCheckIn(pbxLineRepId);
    }

    pbxRepCheckOut(pbxLineRepId: string): Promise<void> {
        return this.signalrService.pbxRepCheckOut(pbxLineRepId);
    }

    pbxOtherRepCheckIn(pbxLineId: number, pbxLineRepId: number): Promise<PbxLineRepDto> {
        return this.signalrService.pbxOtherRepCheckIn(pbxLineId, pbxLineRepId);
    }

    pbxOtherRepCheckOut(pbxLineRepId: number): Promise<string> {
        return this.signalrService.pbxOtherRepCheckOut(pbxLineRepId);
    }

    PbxCustomerCheckIn(pbxLineId: number, name: string): Promise<PbxCallQueueDto> {
        return this.signalrService.pbxCustomerCheckIn(pbxLineId, name);
    }

    PbxCustomerCheckOut(pbxCallQueueId: number): Promise<string> {
        return this.signalrService.pbxCustomerCheckOut(pbxCallQueueId);
    }

    // sends an email and text message to all the pbxline reps
    async pagePbxlineReps(pbxCallQueueId: number, accessToken: string): Promise<void> {
        return this.signalrService.pagePbxlineReps(pbxCallQueueId, accessToken);
    }

    async setProxySecret(proxySecret: string): Promise<boolean> {
        return this.signalrService.setProxySecret(proxySecret);
    }

    async setAccessToken(jwtToken: JwtToken): Promise<boolean> {
        return this.signalrService.setAccessToken(jwtToken);
    }

    async setIp(ip: string): Promise<boolean> {
        return this.signalrService.setIp(ip);
    }

   
    

    retrieveWebRtcSettings(id: string, accessToken: string): Promise<AppWebRtcSettingType> {
        return this.signalrService.retrieveWebRtcSettings(id, accessToken);
    }

    requestWebApiWithClientId(clientId: string, accessToken: string): Promise<WebApiType> {
        return this.signalrService.requestWebApiWithClientId(clientId, accessToken);
    }

    requestNewGuid(): Promise<string> {
        return this.signalrService.requestNewGuid();
    }

    requestGuid(email: string): Promise<string> {
        return this.signalrService.requestGuid(email);
    }

    async sendSystemMessage(remoteGuid: string, message: string): Promise<string> {
        return this.signalrService.sendSystemMessage(remoteGuid, message);
    }

    async requestNetcast(remoteGuid: string, message: string): Promise<string> {
        return this.signalrService.requestNetcast(remoteGuid, message);
    }

    async requestPCOnly(remoteGuid: string, message: string): Promise<string> {
        return this.signalrService.requestPCOnly(remoteGuid, message);
    }

    async requestPCStream(remoteGuid: string, message: string): Promise<string> {
        return this.signalrService.requestPCStream(remoteGuid, message);
    }


    sendBusyResponse(remoteGuid: string): Promise<void> {
        return this.signalrService.sendBusyResponse(remoteGuid);
    }

    sendPrivateSmsMessage(message: string, remoteGuid: string): Promise<string> {
        return this.signalrService.sendPrivateSmsMessage(message, remoteGuid);
    }

    sendGroupSmsMessage(message: string, phoneLineGuid: string): Promise<string> {
        return this.signalrService.sendGroupSmsMessage(message, phoneLineGuid);
    }

    sendHangUpNotice(phoneLineGuid: string): Promise<void> {
        return this.signalrService.sendHangUpNotice(phoneLineGuid);
    }

    sendNotAcceptCall(remoteGuid: string): Promise<void> {
        return this.signalrService.sendNotAcceptCall(remoteGuid);
    }

    sendReadyForCall(remoteGuid: string): Promise<void> {
        return this.signalrService.sendReadyForCall(remoteGuid);
    }

    sendNotReadyForCall(errorMessage: string, remoteGuid: string): Promise<void> {
        return this.signalrService.sendNotReadyForCall(errorMessage, remoteGuid);
    }

    sendPutOnHold(remoteGuid: string): Promise<void> {
        return this.signalrService.sendPutOnHold(remoteGuid);
    }

    sendRemoveOnHold(remoteGuid: string): Promise<void> {
        return this.signalrService.sendRemoveOnHold(remoteGuid);
    }

    cancelCall(email: string): Promise<string> {
        return this.signalrService.cancelCall(email);
    }

    sendPhoneLineInvitation(phoneLineGuid: string, otherUserEmail: string, callerName: string): Promise<string> {
        return this.signalrService.sendPhoneLineInvitation(phoneLineGuid, otherUserEmail, callerName);
    }

    sendPbxPhoneLineInvitation(phoneLineGuid: string, pbxLineRepId: number, otherUserEmail: string, callerName: string): Promise<string> {
        return this.signalrService.sendPbxPhoneLineInvitation(phoneLineGuid, pbxLineRepId, otherUserEmail, callerName);
    }

    sendAcceptPhoneLineInvitation(remoteGuid: string): Promise<string> {
        return this.signalrService.sendAcceptPhoneLineInvitation(remoteGuid);
    }

    sendAreYouReadyForCall(localPhoneLineConnectionId: number, remoteGuid: string): Promise<HubConnection> {
        return this.signalrService.sendAreYouReadyForCall(localPhoneLineConnectionId, remoteGuid);
    }

    sendRemoteGuidUpdate(remoteGuid: string): Promise<void> {
        return this.signalrService.sendRemoteGuidUpdate(remoteGuid);
    }

    sendSDP(remoteGuid: string, sdp: string): Promise<void> {
        return this.signalrService.sendSDP(remoteGuid, sdp);
    }

    sendICE(remoteGuid: string, ice: string): Promise<void> {
        return this.signalrService.sendICE(remoteGuid, ice);
    }

    sendDisconnect(remoteGuid: string): Promise<void> {
        return this.signalrService.sendDisconnect(remoteGuid);
    }

    broadcastDisconnectedAsync(message: string): Promise<void> {
        return this.signalrService.broadcastDisconnectedAsync(message);
    }

    broadcastDisconnected(message: string): void {
        return this.signalrService.broadcastDisconnected(message);
    }

    sendNetcastStub(remoteGuid: string): Promise<void> {
        return this.signalrService.sendNetcastStub(remoteGuid);
    }

    sendRequestNetcastStub(remoteGuid: string, re: RequestNetcastStubType): Promise<void> {
        return this.signalrService.sendRequestNetcastStub(remoteGuid, re);
    }

    sendPing(remoteGuid: string): Promise<void> {
        return this.signalrService.sendPing(remoteGuid);
    }

    sendPingResponse(remoteGuid: string): Promise<void> {
        return this.signalrService.sendPingResponse(remoteGuid);
    }

    sendKeepAlive(email: string, connectionId): Promise<void> {
        return this.signalrService.sendKeepAlive(email, connectionId);
    }

    sendPbxCallQueueNotes(queue: PbxCallQueueDto, remoteGuid: string): Promise<void> {
        return this.signalrService.sendPbxCallQueueNotes(queue, remoteGuid);
    }

    //setEmail(email: string): Promise<void> {
    //    return this.signalrService.setEmail(email);
    //}

    

    getPhoneLineById(id: number): Promise<PhoneLineType> {
        return this.signalrService.getPhoneLineById(id);
    }

    getPhoneLineByGuid(guid: string): Promise<PhoneLineType> {
        return this.signalrService.getPhoneLineByGuid(guid);
    }

    requestNewPhoneLine(): Promise<PhoneLineType> {
        return this.signalrService.requestNewPhoneLine();
    }

    deletePhoneLine(phoneLineId: number): Promise<PhoneLineType> {
        return this.signalrService.deletePhoneLine(phoneLineId);
    }

    requestNewPhoneLineConnection(phoneLineGuid: string): Promise<PhoneLineConnectionType> {
        return this.signalrService.requestNewPhoneLineConnection(phoneLineGuid);
    }

    deletePhoneLineConnection(phoneLineConnectionId: number): Promise<PhoneLineConnectionType> {
        return this.signalrService.deletePhoneLineConnection(phoneLineConnectionId);
    }

    getPhoneLineConnectionById(id: number): Promise<PhoneLineConnectionType> {
        return this.signalrService.getPhoneLineConnectionById(id);
    }

    startWebRtcHubListeners(): void {
        return this.signalrService.startWebRtcHubListeners();
    }

    endWebRtcHubListeners(): void {
        return this.signalrService.endWebRtcHubListeners();
    }
    // #endregion

    // #region BlockCallService
    //initBlockCallService(accessToken: string): Promise<void> {
    //	return this.blockCallService.init(accessToken);
    //}

    setLocalBlockedEmails(blockedEmails: Array<BlockedEmailType>): void {
        return this.blockCallService.setLocalBlockedEmails(blockedEmails);
    }

    unsetLocalBlockedEmails(): void {
        return this.blockCallService.unsetLocalBlockedEmails();
    }

    blockEmail(email: string, accessToken: string): Promise<BlockedEmailType> {
        return this.blockCallService.blockEmail(email, accessToken);
    }

    unblockEmail(blockedEmailId: number, accessToken: string): Promise<boolean> {
        return this.blockCallService.unblockEmail(blockedEmailId, accessToken);
    }

    getBlockedEmails(options: PagingType, accessToken: string): Promise<Array<BlockedEmailType>> {
        return this.blockCallService.getBlockedEmails(options, accessToken);
    }

    getAllBlockedEmails(accessToken: string): Promise<Array<BlockedEmailType>> {
        return this.blockCallService.getAllBlockedEmails(accessToken);
    }

    isBlockedEmailFromCache(email: string): boolean {
        return this.blockCallService.isBlockedEmailFromCache(email);
    }

    isBlockedEmail(email: string, accessToken: string): Promise<boolean> {
        return this.blockCallService.isBlockedEmail(email, accessToken);
    }

    get blockedEmails(): Array<BlockedEmailType> {
        return this.blockCallService.blockedEmails;
    }
    // #endregion

    // #region CapturePhotoService
    initCapturePhotoService(_video: HTMLVideoElement, _photo: HTMLImageElement): void {
        return this.capturePhotoService.init(_video, _photo);
    }

    startCaptureService(): void {
        return this.capturePhotoService.start();
    }

    stopCaptureService(): void {
        return this.capturePhotoService.stop();
    }

    captureServiceTakePicture(): any {
        return this.capturePhotoService.takePicture();
    }
    // #endregion

    // #region ContactService
    async getContacts(): Promise<Array<PhoneContactType>> {
        return this.contactService.getContacts();
    }

    getContactList(accessToken: string): Promise<Array<PhoneContactType>> {
        return this.contactService.getContactList(accessToken);
    }

    addContact(contact: PhoneContactType, accessToken: string): Promise<PhoneContactType> {
        return this.contactService.addContact(contact, accessToken);
    }

    addContacts(contacts: PhoneContactType[], accessToken: string): Observable<PhoneContactType> {
        return this.contactService.addContacts(contacts, accessToken);
    }

    deleteContact(contact: PhoneContactType, accessToken: string): Promise<void> {
        return this.contactService.deleteContact(contact, accessToken);
    }

    updateContact(contact: PhoneContactType, accessToken: string): Promise<PhoneContactType> {
        return this.contactService.updateContact(contact, accessToken);
    }

    requestPhoneContactAvatarDataUri(email: string, accessToken: string): Promise<string> {
        return this.contactService.requestPhoneContactAvatarDataUri(email, accessToken);
    }

    requestPhoneContactAvatarFileName(email: string, accessToken: string): Promise<string> {
        return this.contactService.requestPhoneContactAvatarFileName(email, accessToken);
    }

    getPhoneContactEmails(accessToken: string): Promise<Array<string>> {
        return this.contactService.getPhoneContactEmails(accessToken);
    }

    getPhoneContact(phoneContactId: number, accessToken: string): Promise<PhoneContactType> {
        return this.contactService.getPhoneContact(phoneContactId, accessToken);
    }

    getUsersPhoneContactByEmail(email: string, accessToken: string): Promise<PhoneContactType> {
        return this.contactService.getUsersPhoneContactByEmail(email, accessToken);
    }

    isExistingPhoneContact(email: string, accessToken: string): Promise<boolean> {
        return this.contactService.isExistingPhoneContact(email, accessToken);
    }

    // #endregion

    // #region LocalContactService
    getLocalContacts(): Promise<PhoneContactType[]> {
        return this.localContactService.getContacts();
    }

    // #endregion LocalContactService

    // #region FlashMessageService
    get flashMessageTitle(): string {
        return this.flashMessageService.title;
    }
    set flashMessageTitle(value: string) {
        this.flashMessageService.title = value;
    }
    get flashMessage(): string {
        return this.flashMessageService.message;
    }
    set flashMessage(value: string) {
        this.flashMessageService.message = value;
    }
    get flashMessageType(): string {
        return this.flashMessageService.type;
    }
    set flashMessageType(value: string) {
        this.flashMessageService.type = value;
    }
    clearFlashMessage(): void {
        this.flashMessageService.clear();
    }
    // #endregion

    // #region PushService
    initPushService(): Promise<string> {
        return this.pushService.initPushService();
    }
    hasPushPermission(): Promise<boolean> {
        return this.pushService.hasPermission();
    }
    subscribePushNotification(email: string, accessToken: string): Promise<PushSubscriptionType> {
        return this.pushService.subscribePushNotification(email, accessToken);
    }
    unsubscribePushNotification(unpush: UnsubscribePushNotificationDto, accessToken: string): Promise<PushSubscriptionType> {
        return this.pushService.unsubscribePushNotification(unpush, accessToken);
    }
    getPushId(getPushIdDto: GetPushIdDto, accessToken: string): Promise<PushSubscriptionType> {
        return this.pushService.getPushId(getPushIdDto, accessToken);
    }
    storePushSubscrition(value: PushSubscriptionType): Promise<void> {
        return this.pushService.storePushSubscrition(value);
    }
    getMyEmail(accessToken: string = ""): Promise<string> {
        return this.pushService.getMyEmail(accessToken);
    }
    // #endregion

    // #region SettingsService
    get activeVideoDeviceId(): string {
        return this.settingsService.activeVideoDeviceId;
    }
    set activeVideoDeviceId(value: string) {
        this.settingsService.activeVideoDeviceId = value;
    }
    get activeAudioDeviceId(): string {
        return this.settingsService.activeAudioDeviceId;
    }
    set activeAudioDeviceId(value: string) {
        this.settingsService.activeAudioDeviceId = value;
    }
    // #endregion

    // #region VideoHelperService
    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
        return this.videoHelperService.getUserMedia(constraints);
    }
    attachMediaStream(videoElement: HTMLVideoElement, stream: MediaStream, id?: string): Promise<void> {
        return this.videoHelperService.attachMediaStream(videoElement, stream, id);
    }
    getAllMediaSources(): Promise<Array<MediaDeviceInfo>> {
        return this.videoHelperService.getAllMediaSources();
    }
    getCameraSources(): Promise<Array<MediaDeviceInfo>> {
        return this.videoHelperService.getCameraSources();
    }
    getFirstVideoDevice(): Promise<MediaDeviceInfo> {
        return this.videoHelperService.getFirstVideoDevice();
    }
    getMicSources(): Promise<Array<MediaDeviceInfo>> {
        return this.videoHelperService.getMicSources();
    }
    clearMediaStream(videoElement: HTMLVideoElement): Promise<void> {
        return this.videoHelperService.clearMediaStream(videoElement);
    }
    getSupportedMediaTrackConstraints(): Promise<MediaTrackSupportedConstraints> {
        return this.videoHelperService.getSupportedMediaTrackConstraints();
    }
    // #endregion

    // #region MaterialHelperService
    getMaterialHelperSubject() {
        return this.materialHelperService.getSubject();
    }
    openAlert(data: MaterialAlertMessageType): void {
        this.materialHelperService.openAlert(data);
    }
    openActionAlert(data: MaterialActionAlertMessageType): Promise<boolean> {
        return this.materialHelperService.openActionAlert(data);
    }

    //openSnackBar(data: MaterialSnackBarMessageType) {
    //	return this.materialHelperService.openSnackBar(data);
    //}

    // #endregion

    // #region PermissionService
    checkCameraPermissions(): Promise<boolean> {
        return this.permissionsService.checkCameraPermissions();
    }
    checkMicrophonePermissions(): Promise<boolean> {
        return this.permissionsService.checkMicrophonePermissions();
    }
    // #endregion

    // #region PlatformHelperService
    isIos(): boolean {
        return this.platformHelperService.isIos();
    }

    isWindows(): boolean {
        return this.platformHelperService.isWindows();
    }

    isAndroid(): boolean {
        return this.platformHelperService.isAndroid();
    }
    // #endregion PlatformHelperService

    // #region MeetingService

    canEnterMeetingTime(meeting: MeetingDto): boolean {
        return this.meetingService.canEnterMeetingTime(meeting);
    }

    async createMeeting(dto: MeetingDto, accessToken: string): Promise<MeetingDto> {
        return this.meetingService.createMeeting(dto, accessToken);
    }

    async updateMeeting(dto: MeetingDto, accessToken: string): Promise<MeetingDto> {
        return this.meetingService.updateMeeting(dto, accessToken);
    }

    async getMeetingsByMemberId(dto: IdDto, accessToken: string): Promise<Array<MeetingDto>> {
        return this.meetingService.getMeetingsByMemberId(dto, accessToken);
    }

    async getMeetingsByAttendeeEmail(dto: StringIdDto, accessToken: string): Promise<Array<MeetingDto>> {
        return this.meetingService.getMeetingsByAttendeeEmail(dto, accessToken);
    }

    async getMeetingById(meetingId: number, accessToken: string): Promise<MeetingDto> {
        return this.meetingService.getMeetingById(meetingId, accessToken);
    }

    async deleteMeeting(meetingId: number, accessToken: string): Promise<string> {
        return this.meetingService.deleteMeeting(meetingId, accessToken);
    }

    async createMeetingAttendee(dto: MeetingAttendeeDto, accessToken: string): Promise<MeetingAttendeeDto> {
        return this.meetingService.createMeetingAttendee(dto, accessToken);
    }

    async updateMeetingAttendee(dto: MeetingAttendeeDto, accessToken: string): Promise<MeetingAttendeeDto> {
        return this.meetingService.updateMeetingAttendee(dto, accessToken);
    }

    async getMeetingAttendeesByMeetingId(dto: LongIdDto, accessToken: string): Promise<Array<MeetingAttendeeDto>> {
        return this.meetingService.getMeetingAttendeesByMeetingId(dto, accessToken);
    }

    async getMeetingAttendeeById(meetingAttendeeId: number, accessToken: string): Promise<MeetingAttendeeDto> {
        return this.meetingService.getMeetingAttendeeById(meetingAttendeeId, accessToken);
    }
    async getMeetingAttendeesByMemberId(dto: IdDto, accessToken: string): Promise<Array<MeetingAttendeeDto>> {
        return this.meetingService.getMeetingAttendeesByMemberId(dto, accessToken);
    }

    async getMeetingAttendeesByEmail(dto: StringIdDto, accessToken: string): Promise<Array<MeetingAttendeeDto>> {
        return this.meetingService.getMeetingAttendeesByEmail(dto, accessToken);
    }

    async getMeetingsByAttendeeEmailIgnoreRsvp(dto: StringIdDto, accessToken: string): Promise<Array<MeetingDto>> {
        return this.meetingService.getMeetingsByAttendeeEmailIgnoreRsvp(dto, accessToken);
    }

    async getUpcomingMeetings(dto: StringIdDto, accessToken: string): Promise<Array<MeetingDto>> {
        return this.meetingService.getUpcomingMeetings(dto, accessToken);
    }

    async getPastMeetings(dto: StringIdDto, accessToken: string): Promise<Array<MeetingDto>> {
        return this.meetingService.getPastMeetings(dto, accessToken);
    }

    async deleteMeetingAttendee(dto: MeetingAttendeeDto, accessToken: string): Promise<string> {
        return this.meetingService.deleteMeetingAttendee(dto, accessToken);
    }
    // #endregion MeetingService

    // #region NetcastService
    async getNetcasts(): Promise<Array<NetcastDto>> {
        return this.netcastService.getNetcasts();
    }

    async setNetcasts(value: NetcastDto[]): Promise<boolean> {
        return this.netcastService.setNetcasts(value);
    }

    async getNnetcastGenres(): Promise<NetcastGenreDto[]> {
        return this.netcastService.getNetcastGenres();
    }

    async setNetcastGenres(value: NetcastGenreDto[]): Promise<boolean> {
        return this.netcastService.setNetcastGenres(value);
    }

    async getAllNetcastGenres(sqlSearchPredicates: SqlSearchPredicateDto, accessToken: string): Promise<NetcastGenreDto[]> {
        return this.netcastService.getAllNetcastGenres(sqlSearchPredicates, accessToken);
    }

    async createNetcast(netcastDto: NetcastDto, accessToken: string): Promise<NetcastDto> {
        return this.netcastService.createNetcast(netcastDto, accessToken);
    }

    async addNetcastImage(dataUri: string, netcastId: number, accessToken: string): Promise<NetcastDto> {
        return this.netcastService.addNetcastImage(dataUri, netcastId, accessToken);
    }

    async deleteNetcastImage(netcastId: number, accessToken: string): Promise<NetcastDto> {
        return this.netcastService.deleteNetcastImage(netcastId, accessToken);
    }

    async updateNetcast(netcastDto: NetcastDto, accessToken: string): Promise<NetcastDto> {
        return this.netcastService.updateNetcast(netcastDto, accessToken);
    }

    async deleteNetcast(netcastDto: NetcastDto, accessToken: string): Promise<string> {
        return this.netcastService.deleteNetcast(netcastDto, accessToken);
    }

    async getNetcastById(netcastId: number, accessToken: string): Promise<NetcastDto> {
        return this.netcastService.getNetcastById(netcastId, accessToken);
    }

    async getRemoteGuidByNetcastId(netcastId: number, accessToken: string): Promise<string> {
        return this.netcastService.getRemoteGuidByNetcastId(netcastId, accessToken);
    }

    async getNetcastsByMemberId(idDto: IdDto, accessToken: string): Promise<NetcastDto[]> {
        return this.netcastService.getNetcastsByMemberId(idDto, accessToken);
    }

    async getNetcastsByGenreId(idDto: IdDto, accessToken: string): Promise<NetcastDto[]> {
        return this.netcastService.getNetcastsByGenreId(idDto, accessToken);
    }

    async searchNetcastsByTitle(searchTermDto: SearchTermDto, accessToken: string): Promise<NetcastDto[]> {
        return this.netcastService.searchNetcastsByTitle(searchTermDto, accessToken);
    }

    async searchNetcastsByTags(searchTermDto: SearchTermDto, accessToken: string): Promise<NetcastDto[]> {
        return this.netcastService.searchNetcastsByTags(searchTermDto, accessToken);
    }

    async searchNetcastsByDescription(searchTermDto: SearchTermDto, accessToken: string): Promise<NetcastDto[]> {
        return this.netcastService.searchNetcastsByDescription(searchTermDto, accessToken);
    }

    async startNetcast(netcastId: number, connectionGuid: string, accessToken: string): Promise<boolean> {
        return this.netcastService.startNetcast(netcastId, connectionGuid, accessToken);
    }

    async endNetcast(accessToken: string): Promise<void> {
        this.netcastService.endNetcast(accessToken);
    }
    // #endregion NetcastService

    // #region MapperService
    mapToNetcastGenreViewModel(dto: NetcastGenreDto): NetcastGenreViewModel {
        return this.mapperService.mapToNetcastGenreViewModel(dto);
    }

    mapToNetcastViewModel(dto: NetcastDto): NetcastViewModel {
        return this.mapperService.mapToNetcastViewModel(dto);
    }
	// #endregion MapperService

    // #region Utilities that use the other services
    async promptForLogin(): Promise<boolean> {
        return true;
    }

    promptResetLostJwtToken(rejectOnError?: boolean): Promise<string> {
        // if rejectOnError is true, then the method will resolve with success message string or reject with error message
        // if rejectOnError is false, then the method will reolve on success with message string or will log the user out
        // set to true if you want to manually handle both situations, set to false, if you want to handle success only
        // set to false if you don't care and will just let the method handle it

        rejectOnError = this.isEmpty(rejectOnError) ? false : true;
        return new Promise<string>((resolve, reject) => {
            let actionAlertMessage = new MaterialActionAlertMessageType();
            actionAlertMessage.title = "Error";
            actionAlertMessage.message = "Sorry it appears your session credentials has been lost. Please click the reset button to try to reset your session or cancel to go back.";
            this.openActionAlert(actionAlertMessage)
                .then((doAction) => {
                    if (doAction) {
                        this.initSignalrService()
                            .then(() => {
                                //this.toastr.success('"Your credentials have been reset. Please try your request again."', 'SUCCESS')
                                if (rejectOnError === false) {
                                    let alert = new MaterialAlertMessageType();
                                    alert.title = "SUCCESS";
                                    alert.message = "Your credentials have been reset. Please try your request again.";
                                    this.openAlert(alert);
                                }

                                resolve("Your credentials have been reset. Please try your request again.");
                            })
                            .catch((error) => {
                                //console.log("login.component.ts login() signalrService.init() error: ", error);
                                //this.toastr.error('Sorry we were unable to reset your credentials. This could be due to network errors. Please try again a little later.', 'Error')
                                if (rejectOnError === false) {
                                    let alert = new MaterialAlertMessageType();
                                    alert.title = "ERROR";
                                    alert.message = "Sorry we were unable to reset your credentials. This could be due to network errors. Please try again a little later.";
                                    this.openAlert(alert);
                                    resolve("Sorry we were unable to reset your credentials.This could be due to network errors.Please try again a little later.");
                                }
                                else {
                                    reject("Sorry we were unable to reset your credentials. This could be due to network errors. Please try again a little later.");
                                }
                            });
                    }
                    else {
                        if (rejectOnError === false) {
                            this.flashMessageTitle = "ERROR";
                            this.flashMessage = "To protect your privacy and the privacy of other users, this app requires your permission to run. Restart the app to give it permission to run.";
                            //this.router.navigate(['/logout'], { relativeTo: this.activatedRoute });
                        }
                        else {
                            reject("Sorry we were unable to reset your credentials. Your credentials are required for the request. Please restart the app to get new credentials.");
                        }
                        //let alert = new MaterialAlertMessageType();
                        //alert.title = "ERROR";
                        //alert.message = "Sorry we were unable to reset your credentials. Your credentials are required for the request. Please restart the app to get new credentials.";
                        //this.openAlert(alert);
                    }
                })
                .catch((error) => {
                    // error
                    if (rejectOnError === false) {
                        this.flashMessageTitle = "ERROR";
                        this.flashMessage = "To protect your privacy and the privacy of other users, this app requires your permission to run. Restart the app to give it permission to run.";
                        //this.router.navigate(['/logout'], { relativeTo: this.activatedRoute });
                    }
                    else {
                        reject("Sorry we were unable to reset your credentials. This could be due to network errors. Please try your request again a little later.");
                    }
                    //let alert = new MaterialAlertMessageType();
                    //alert.title = "ERROR";
                    //alert.message = "Sorry we were unable to reset your credentials. This could be due to network errors. Please try your request again a little later.";
                    //this.openAlert(alert);
                });
        })
    }

    checkAndDisplayFlashMessage(): void {
        if (!this.isEmpty(this.flashMessage)) {
            if (this.flashMessageType === 'error') {
                //this.toastr.error(this.flashMessageService.message, this.flashMessageService.title)
                // TODO: need to make this an alert with red text or background so user will
                // know its an error alert
                let alert = new MaterialAlertMessageType();
                alert.title = this.flashMessageTitle;
                alert.message = this.flashMessage;
                setTimeout(() => { this.openAlert(alert); });
            } else {
                //this.toastr.show(this.flashMessageService.message, this.flashMessageService.title)
                let alert = new MaterialAlertMessageType();
                alert.title = this.flashMessageTitle;
                alert.message = this.flashMessage;
                setTimeout(() => { this.openAlert(alert); });
            }
            this.clearFlashMessage();
        }
    }
    private isMemberChanged = new Subject<any>();
    private isLoggedInChanged = new Subject<any>();
    private memberEmailChanged = new Subject<any>();
    private userNameChanged = new Subject<any>();
    private memberImgSrcChanged = new Subject<any>();
    private receiveRemoteLogoutSubject = new Subject<any>();
    private receivePhoneLineInvitationSubject = new Subject<any>();

    getObservable(type:string):Subject<any>{
        switch(type){
            case 'isMember':
                return this.isMemberChanged;
            case 'isLoggedIn':
                return this.isLoggedInChanged;
            case 'memberEmail':
                return this.memberEmailChanged;
            case 'userName':
                return this.userNameChanged;
            case 'memberImgSrc':
                return this.memberImgSrcChanged;
            case 'receiveRemoteLogout':
                return this.receiveRemoteLogoutSubject;
            case 'receivePhoneLineInvitation':
                return this.receivePhoneLineInvitationSubject;
        }
    }
    unsubscribeObservable(){
        this.isMemberChanged.unsubscribe();
        this.isLoggedInChanged.unsubscribe();
        this.memberEmailChanged.unsubscribe();
        this.userNameChanged.unsubscribe();
        this.memberImgSrcChanged.unsubscribe();
        this.receivePhoneLineInvitationSubject.unsubscribe();
        this.receiveRemoteLogoutSubject.unsubscribe();
    }
    async memberLogIn(email: string, password: string, rememberMe: boolean): Promise<Array<string>> {
        //console.log("memberLogin: ", email, password);
        let warnings: Array<string> = new Array<string>();
        try {
            let jwtToken: JwtToken;
            // try to request token with email and password combination
            try {
                jwtToken = await this.requestMemberToken(email, password);
            }
            catch (e) {
                throw ("Login Failed. Please check your email and password combination to make sure it's correct.");
            }

            if (this.isEmpty(jwtToken) === false) {
                //console.log("service.service.ts remeberMe: ", rememberMe);
                await this.setRememberMe(rememberMe);
                //console.log("service.service.ts this.rememberMe: ", this.rememberMe);

                await this.setEmail(email);
                await this.setAccessToken(jwtToken);
            }
            else {
                throw ("Login failed. Email and/or password is incorrect.");
            }

            let accessToken: string;
            let member: MemberType;
            try {
                accessToken = await this.getAccessToken();
                //console.log("service memberLogin accessToken: ", accessToken);
            }
            catch (e) {
                throw ("Unable to get access.")
            }
            let memberId: string;
            if (this.isEmpty(accessToken) === false) {
                memberId = await this.extractMemberId(accessToken);
                //console.log("memberId: ", memberId);
                await this.setMemberId(memberId);
            }
            else {
                throw ("Missing credentials for access.");
            }

            try {
                member = await this.getMyProfile(accessToken);
            }
            catch (e) {
                //console.log("getMyProfile error: ", e);
                throw ("Unable to request user profile");
            }

            if (this.isEmpty(member) === false) {
                await this.setProfile(member);
            }
            else {
                throw ("Access denied, user profile missing.")
            }
            let localGuid: string;
            try {
                localGuid = await this.webrtcHubCheckIn(member.firstName + " " + member.lastName);
            }
            catch (e) {
                console.log("webrtcHubCheckIn error: ", e);
                throw ("Access denied. Unable to request unique identifier for user.")
            }

            if (this.isEmpty(localGuid) === false) {
                await this.setLocalGuid(localGuid);
            }
            else {
                throw ("Access denied. Unable to get unique identifier for user.")
            }

            try {
                await this.startWebRtcHubListeners();
            }
            catch (e) {
                warnings.push("Unable to establish communications with video service. Video services might not work properly. Please try logging out and log back in again. If the problem persists, please contact us");
            }

           
            try {
               
                await this.pushService.subscribePushNotification(email, accessToken); //let pushSubscription: PushSubscriptionType =
            }
            catch (e) {
                //warnings.push("Unable to establish Notification services. You will not beable to get push messages. Please try loging out and then logging back in. If the problem persists, please contact us. ")
                console.log("Unable to establish Notification services. You will not beable to get push messages. Please try loging out and then logging back in. If the problem persists, please contact us. ")
            }

            await this.setIsLoggedIn(true);

            // notify other components that user is loggedin
            this.isMemberChanged.next(true);
            this.isLoggedInChanged.next(true);
            this.memberEmailChanged.next(email);
            this.userNameChanged.next(member.firstName + " " + member.lastName);

            let imgSrc: string = this.jsHelperService.isEmpty(member.avatarFileName) ? this.defaultAvatar
                : this.avatarBaseUrl + member.avatarFileName + "?" + Date.now().toString();
            this.memberImgSrcChanged.next(imgSrc);
            return warnings;
        }
        catch (e) {
            await this.logMemberOut();
            throw (e);
        }
    }

    // this for members
    async tryLoginFromRemembered(): Promise<Array<string>> {
        try {
            //console.log("service.service.ts tryLoginFromRemembered()");

            let warnings: Array<string> = new Array<string>();

            let memberId: string;

            let jwtToken = await this.getJwtToken();
            if (this.isEmpty(jwtToken) === false) {
                this.setAccessToken(jwtToken);
            }
            else {
                throw ("Trying to start from previous state failed. Unable to grab access credentials. For your security, please log back in to re-establish your credentials.");
            }
            // get an access token
            let accessToken = await this.getAccessToken();
            //console.log("got accessToken: ", accessToken);
            if (this.isEmpty(accessToken) === false) {
                memberId = await this.extractMemberId(accessToken);
                //console.log("got memberId: ", memberId);
            }
            else {
                throw ("Access denied. Unable to retrieve credentials.")
            }

            if (this.isEmpty(memberId)) {
                throw ("Access denied. Member credentials required.")
            }

            let member: MemberType;

            try {
                member = await this.getMyProfile(accessToken);
                //console.log("got memberType: ", member);
            }
            catch (e) {
                throw ("Unable to request user profile");
            }

            if (this.isEmpty(member)) {
                throw ("Access denied, user profile missing.");
            }

            try {
                await this.setProfile(member);
                await this.setEmail(member.email);
            }
            catch (e) {
                throw ("Access Denied, Unable to set user identity marker.");
            }

            let localGuid: string;

            try {
                localGuid = await this.webrtcHubCheckIn(member.firstName + " " + member.lastName);
            }
            catch (e) {
                //console.log("service.service.ts webrtchubCheckIn() error: ", e);
                throw ("Access denied. Unable to request unique identifier for user.");
            }

            if (this.isEmpty(localGuid) === false) {
                await this.setLocalGuid(localGuid);
            }
            else {
                throw ("Access denied. Unable to get unique identifier for user.");
            }

            try {
                await this.startWebRtcHubListeners();
            }
            catch (e) {
                console.log("service.service.ts this.startWebRtcHubListeners error: ", e);
                warnings.push("Unable to establish communications with video service. Video services might not work properly. Please try logging out and log back in again. If the problem persists, please contact us");
            }

            try {
                await this.pushService.subscribePushNotification(member.email, accessToken); //let pushSubscription: PushSubscriptionType =
            }
            catch (e) {
                //warnings.push("Unable to establish Notification services. You will not beable to get push messages. Please try loging out and then logging back in. If the problem persists, please contact us. ")
                console.log("Unable to establish Notification services. You will not beable to get push messages. Please try loging out and then logging back in. If the problem persists, please contact us. ")
            }

            await this.setIsLoggedIn(true);
            this.isMemberChanged.next(true);
            this.isLoggedInChanged.next(true);
            this.memberEmailChanged.next(member.email);
            this.userNameChanged.next(member.firstName + " " + member.lastName);

            let imgSrc: string = this.jsHelperService.isEmpty(member.avatarFileName) ? this.defaultAvatar
                : this.avatarBaseUrl + member.avatarFileName + "?" + Date.now().toString();
            this.memberImgSrcChanged.next(imgSrc);

            return warnings;
        }
        catch (e) {
            throw (e);
        }
    }

    async isMember(): Promise<boolean> {
        try {
            let accessToken = await this.getAccessToken();
            if (this.isEmpty(accessToken)) {
                return false;
            }
            else {
                let memberId = await this.extractMemberId(accessToken);
                return this.isEmpty(memberId) ? false : true;
            }
        }
        catch (e) {
            return false;
        }
    }

    // this is for previously logged in guests
    async tryStartAsGuest(): Promise<Array<string>> {
        let warnings: Array<string> = new Array<string>();
        try {
            let jwtToken = await this.getNewGuestToken();

            if (this.isEmpty(jwtToken) === false) {
                this.setAccessToken(jwtToken);
            }
            else {
                throw ("Request for access denied. Please try again later.");
            }
            //console.log("tryStartAsGuest()");
            let guestProfile: GuestProfileType = await this.getGuestProfile();
            //console.log("service.service.ts tryStartAsGuest() guestProfile: ", this.guestProfile);

            if (this.jsHelperService.isEmpty(guestProfile)) {
                throw ("Unable to start as guest user");
            }

            try {
                await this.signalrService.setEmail(guestProfile.email);
            }
            catch (e) {
                throw ("Access Denied, unable to identify user email");
            }

            let name = this.jsHelperService.isEmpty(guestProfile.name) ? guestProfile.email : guestProfile.name;

            let localGuid: string;
            try {
                localGuid = await this.webrtcHubCheckIn(name);
            }
            catch (e) {
                throw ("Access denied. Request to get unique unique identifier for user failed.");
            }

            if (this.isEmpty(localGuid) === false) {
                await this.setLocalGuid(localGuid);
            }
            else {
                throw ("Access denied. Unable to request unique identifier for user. If you are a guest user, this could mean someone else is logged in with your guest email.")
            }

            try {
                await this.startWebRtcHubListeners();
            }
            catch (e) {
                warnings.push("Unable to establish communications with video service. Video services might not work properly. Please try logging out and log back in again. If the problem persists, please contact us");
            }

            await this.setIsLoggedIn(true);
            this.isMemberChanged.next(false);
            this.isLoggedInChanged.next(true);
            this.memberEmailChanged.next(guestProfile.email);
            this.userNameChanged.next(name);

            let imgSrc: string = this.jsHelperService.isEmpty(guestProfile.avatarDataUri) ? this.defaultAvatar
                : guestProfile.avatarDataUri;
            this.memberImgSrcChanged.next(imgSrc);

            return warnings;
        }
        catch (e) {
            console.log("e: ", e);
            throw (e);
        }
    }

    async instantGuestLogin(): Promise<void> {
        try {
            console.log("trying instantGuestLogin()");

            let email: string;
            try {
                email = await this.getGeneratedEmail();
                console.log("got generated email", email);
            }
            catch (e) {
                throw ("Unable to request identifier for guest user.")
            }
            let guestProfile: GuestProfileType = null;
            let name: string = "";
            if (this.isEmpty(email) === false) {
                guestProfile = new GuestProfileType();
                guestProfile.email = email;
                guestProfile.name = "";
                //guestProfile.avatarDataUri = "";
                //guestProfile.avatarFilename = "";

                try {
                    await this.setEmail(email);
                    await this.setGuestProfile(guestProfile);
                }
                catch (e) {
                    throw ("Access Denied, unable to create identity for guest user: " + e.toString());
                }

                name = this.jsHelperService.isEmpty(guestProfile.name) ? guestProfile.email : guestProfile.name;

                //console.log("this.connection: ", this.connection);

                let localGuid: string;
                try {
                    localGuid = await this.webrtcHubCheckIn(name);
                }
                catch (e) {
                    throw ("Access denied. Unable to request unique identifier for user: " + e.toString())
                }
                if (this.isEmpty(localGuid) === false) {
                    console.log("got localGuid: ", localGuid);
                    await this.setLocalGuid(localGuid);
                }
                else {
                    throw ("Access denied. Unable to get unique identifier for user. Please try again.")
                }

                try {
                    await this.startWebRtcHubListeners();
                }
                catch (e) {
                    throw ("startWebRtcHubListeners error: " + e.toString());
                }
            }
            else {
                throw ("Unable to read identifier for guest user.");
            }

            await this.setIsLoggedIn(true);

            this.isMemberChanged.next(false);
            this.isLoggedInChanged.next(true);
            this.memberEmailChanged.next(guestProfile.email);
            this.userNameChanged.next(name);

            let imgSrc: string = this.jsHelperService.isEmpty(guestProfile.avatarDataUri) ? this.defaultAvatar
                : guestProfile.avatarDataUri;
            this.memberImgSrcChanged.next(imgSrc);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async guestLogin(guestLogin: GuestLoginType): Promise<Array<string>> {
        let warnings: Array<string> = new Array<string>();
        try {
            // NOTE: the guest email can not belong to a member, and the email can not already be
            // checked into webrtc (existing hubConnection record)

            let accessToken: string;
            try {
                accessToken = await this.signalrService.getAccessToken();
            }
            catch (e) {
                throw ("Access Denied, unable to request access.");
            }
            let guestProfile = new GuestProfileType();
            guestProfile.email = guestLogin.email;
            guestProfile.name = this.jsHelperService.isEmpty(guestLogin.name) ? "" : guestLogin.name;
            //guestProfile.avatarDataUri = "";
            guestProfile.avatarFilename = "";
            // NOTE: guest users can choose to save an avatar from settings if they want
            let canLogin = await this.canGuestLogin(guestProfile.email, accessToken);
            if (canLogin) {
                // if guest email can login, then create the new guest profile
                try {
                    await this.signalrService.setEmail(guestProfile.email);
                }
                catch (e) {
                    throw ("Access Denied, unable to identify user email");
                }
                await this.setGuestProfile(guestProfile);
                let name = this.jsHelperService.isEmpty(guestProfile.name) ? guestProfile.email : guestProfile.name;
                let localGuid: string;
                try {
                    localGuid = await this.webrtcHubCheckIn(name);
                    //await this.setLocalGuid(localGuid);
                }
                catch (e) {
                    throw ("Access denied. Unable to request unique identifier for user. ")
                }

                if (this.isEmpty(localGuid) === false) {
                    await this.setLocalGuid(localGuid);
                }
                else {
                    throw ("Access denied. Unable to get unique identifier for user. If you are a guest user, this could mean someone else is logged in with your guest email.")
                }

                try {
                    await this.startWebRtcHubListeners();
                }
                catch (e) {
                    warnings.push("Unable to establish communications with video service. Video services might not work properly. Please try logging out and log back in again. If the problem persists, please contact us");
                }
            }
            else {
                throw ("The email provided is either used by anther user or member. Please try a different email.");
            }
            await this.setIsLoggedIn(true);

            this.isMemberChanged.next(false);
            this.isLoggedInChanged.next(true);
            this.memberEmailChanged.next(guestProfile.email);
            this.userNameChanged.next(name);

            let imgSrc: string = this.jsHelperService.isEmpty(guestProfile.avatarDataUri) ? this.defaultAvatar
                : guestProfile.avatarDataUri;
            this.memberImgSrcChanged.next(imgSrc);
            return warnings;
        }
        catch (e) {
            throw (e);
        }
    }

    async doLogout(): Promise<void> {
        try {
            //console.log("user.service.ts doing logout");
            let isMember = await this.isMember();

            console.log("isMember: ", isMember);
            if (isMember) {
                ////console.log('member logout')
                ////await this.memberLogOut();
                //await this.unsetupMember();
                //await this.signalrService.endWebRtcHubListeners();
                await this.logMemberOut();
            } else {
                ////await this.guestLogOut();
                //await this.unsetupGuest();
                //await this.signalrService.endWebRtcHubListeners();
                await this.logGuestOut();
            }
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async logMemberOut(): Promise<void> {
        try {
            console.log("logMemberOut start");
            await this.signalrService.webrtcHubCheckOut();
            await this.signalrService.unsetLocalGuid();
            await this.signalrService.unsetEmail();
            console.log("logMemberOut complete")
        }
        catch (e) {
            console.log("logMemberOut error: ", e);
            throw (e);
        }
        finally {
            try {
                //console.log("logMemberOut started");
                try {
                    //console.log("removeAllItems start")
                    await this.localStorageService.removeAllItems();
                    //console.log("removeAllItems done")
                }
                catch (e) {
                    console.log("logMemberOut removeAllItems error: ", e);
                    throw (e);
                }

                //try {
                //    //console.log("signalr Init start")
                //    await this.signalrService.init();
                //    //console.log("signalr init done");
                //}
                //catch (e) {
                //    console.log("logMemberOut signalrService.init error: ", e);
                //    throw (e);
                //}

                let jwtToken: JwtToken;
                try {
                    //console.log("getNewGuestToken started")
                    jwtToken = await this.signalrService.getNewGuestToken();
                    //console.log("got newGuestToken: ", jwtToken);
                }
                catch (e) {
                    console.log("logMemberOut getNewGuestToken error: ", e);
                    throw (e);
                }

                try {
                    //console.log("setAccessToken started");
                    await this.signalrService.setAccessToken(jwtToken);
                    //console.log("setAccessToken done");
                }
                catch (e) {
                    console.log("logMemberOut setAccessToken error: ", e);
                    throw (e);
                }

                try {
                    //console.log("setIsLoggedIn started");
                    await this.setIsLoggedIn(false);
                    //console.log("setIsLoggedIn done");
                }
                catch (e) {
                    console.log("logMemberOut setIsLoggedIn error:", e);
                    throw (e);
                }

                this.isMemberChanged.next(false);
                this.isLoggedInChanged.next(false);
                this.memberEmailChanged.next("");
                this.userNameChanged.next("");
    
                let imgSrc: string = this.defaultAvatar;
                this.memberImgSrcChanged.next(imgSrc);
                //console.log("logMemberOut finally complete");
                return;
            }
            catch (e) {
                console.log("logMemberOut finally error: ", e);
                return;
            }
            //let unpush = new UnsubscribePushNotificationDto();
            //unpush.email = this.pushService.pushSubscription.email;
            //unpush.applicationName = this.pushService.pushSubscription.applicationName;
            //unpush.serviceProviderName = this.pushService.pushSubscription.serviceProviderName;
            //unpush.token = this.pushService.pushSubscription.token;
            //return this.pushService.unsubscribePushNotification(unpush);
        }
    }

    async logGuestOut(): Promise<void> {
        try {
            console.log("logGuestOut start");
            await this.webrtcHubCheckOut();
            await this.signalrService.unsetLocalGuid();
            await this.signalrService.unsetEmail();
            console.log("logGuestOut finished");
        }
        catch (e) {
            throw (e);
        }
        finally {
            await this.localStorageService.removeAllItems();
            //await this.localStorageService.removeAllPermanentItems();
            //await this.signalrService.init();
            let jwtToken = await this.signalrService.getNewGuestToken();
            await this.signalrService.setAccessToken(jwtToken);
            await this.setIsLoggedIn(false);

            this.isMemberChanged.next(false);
            this.isLoggedInChanged.next(false);
            this.memberEmailChanged.next("");
            this.userNameChanged.next("");

            let imgSrc: string = this.defaultAvatar;
            this.memberImgSrcChanged.next(imgSrc);
            //console.log("guestProfile: ", this.guestProfile);
            return;
        }
    }

    async SendCopyOfMessage(dto: SendCopyOfMessageDto, accessToken: string): Promise<void> {
        return this.pbxService.sendCopyOfMessage(dto, accessToken);
    }


    async canActivatePage(): Promise<boolean> {
        try {
            if (this.isSignalrConnected() === false) {
                console.log("starting signalr connection");
                await this.startConnection();
            }
            let isProxySecretReady: boolean = await this.isProxySecretReady();
            if (isProxySecretReady === false) {
                console.log("getting proxysecret");
                await this.initSignalrService();
            }

            let isAccessTokenReady: boolean = await this.isAccessTokenReady();
            if (isAccessTokenReady === false) {
                console.log("getting accessToken");
                await this.getAccessToken();
            }

            //console.log("resolving");
            console.log("isSignalrConnected: ", this.isSignalrConnected());
            isProxySecretReady = await this.isProxySecretReady();
            console.log("isProxySecretReady: ", isProxySecretReady);
           
            isAccessTokenReady = await this.isAccessTokenReady();
            console.log("isAccessTokenReady: ", isAccessTokenReady);
            return this.isSignalrConnected() && this.isProxySecretReady() && (isAccessTokenReady === true);
        }
        catch (e) {
            console.log("service.canActivatePage error: ", e);
            return false;
        }
    }

    async checkIsLoggedIn(): Promise<boolean> {
        // checks to see if a user is logged in, trys to do login if not logged in
        // returns true on success and false on failure

        let isLoggedIn: boolean = await this.getIsLoggedIn();
        let rememberMe: boolean = await this.getRememberMe();
        let guestProfile: GuestProfileType = await this.getGuestProfile();
        if (isLoggedIn) {
            return true;
        }
        else if (rememberMe) {
            // isLoggedIn session flag is not available
            // check if member checked remeberme or is guest

            // member checked remember me
            try {
                let warnings: string[] = await this.tryLoginFromRemembered();
                console.log("tryLoginFromRemembered warnings: ", warnings);
            }
            catch (e) {
                console.log("tryLoginFromRemembered error: ", e);
                await this.logMemberOut();
                return false;
            }
        }
        else if (this.isEmpty(guestProfile) === false) {
            // guest must have a guest profile
            // check if they have a guestProfile
            try {
                let warnings = await this.tryStartAsGuest();
                console.log("tryStartAsGuest warnings: ", warnings);
                return true;
            }
            catch (e) {
                console.log("TryStartAsGuest error: ", e);
                await this.logGuestOut();
                return false;
            }
        }
        else {
            return false;
        }
    }

    async getLoginEmail(): Promise<string> {
        try {
            let isMember: boolean = await this.isMember();
            let email: string = "";
            if (isMember) {
                let profile: MemberType = await this.getProfile();
                email = this.isEmpty(profile) === false ? profile.email : "";
            }
            else {
                let profile: GuestProfileType = await this.getGuestProfile();
                email = this.isEmpty(profile) === false ? profile.email : "";
            }
            return email;
        }
        catch (e) {
            throw (e);
        }
    }

    async isCheckedIntoHubConnection(): Promise<boolean> {
        // NOTE: this function will check the user has email set and local guid set
        // it will attempt to set these items if not already set.

        // NOTE: does a local check of localGuid
        // if it exist, we assume they are checked into to hubconnection
        // else we will assume they are not checked into hubconnection
        // and this function will check them in and set the localGuid on
        // webrtchub.state and signalr localGuid in memory variable
        try {
            let profile: GenericUserType;
            //console.log("initPage checking isMember");
            let isMember = await this.isMember();

            //console.log("isMember: ", isMember);

            if (!this.isEmpty(isMember)) {
                // get member profile
                let memberProfile: MemberType = await this.getProfile();
                //console.log("memberProfile: ", memberProfile);
                if (!this.isEmpty(memberProfile)) {
                    profile = new GenericUserType();
                    profile.email = memberProfile.email;
                    profile.name = memberProfile.firstName + " " + memberProfile.lastName;
                }
            }
            else {
                // get guest profile
                let guestProfile: GuestProfileType = await this.getGuestProfile();
                //console.log("guestProfile: ", guestProfile);
                if (!this.isEmpty(guestProfile)) {
                    profile = new GenericUserType();
                    profile.email = guestProfile.email;
                    profile.name = guestProfile.name;
                }
            }

            if (!this.isEmpty(profile)) {
                // first make sure email is ready
                let isEmailReady: boolean = await this.isEmailReady();
                //console.log("isEmailReady: ", isEmailReady);
                if (this.isEmpty(isEmailReady)) {
                    // NOTE: if email not ready make it ready
                    //console.log("setEmail: ", profile.email);
                    await this.setEmail(profile.email);
                }
                else {
                    // NOTE: nothing to do, email is ready
                    //console.log("isEmailReady: ", isEmailReady);
                }

                // second check hubconnection
                let isHubConnectionReady: boolean = await this.isHubConnectionReady();
                //console.log("isHubConnectionReady: ", isHubConnectionReady);
                if (this.isEmpty(isHubConnectionReady)) {
                    // NOTE: hubconnection is not ready, make it ready

                    // check the user into hubconnection to get a localGuid and set their localGuid
                    let localGuid = await this.webrtcHubCheckIn(profile.name);
                    //console.log("setLocalGuid: ", localGuid);
                    await this.setLocalGuid(localGuid);
                }
                else {
                    // NOTE: Nothing to do, hubconnection is ready
                    //console.log("isHubConnectionReady: ", isHubConnectionReady);
                }

                return true;
            }
            else {
                // if there is no profile, do a logout and send the user to the login page
                //await this.doLogout();
                //this.router.navigate(['/login']);
                // return false and let the consumer handle it
                console.log("empty profile: ", profile);
                return false;
            }
        }
        catch (e) {
            console.log("service.initPage error: ", e);
            // return false and let the consumer handle it
            return false;

            //await this.doLogout();
            //this.router.navigate(['/login']);
        }
    }

    async canActivatePageAndIsLoggedIn(): Promise<boolean> {
        // check if user can activate page, and is logged in
        return new Promise<boolean>(async (resolve) => {

            let canActivate: boolean = await this.canActivatePage();
            if (this.isEmpty(canActivate) === false) {
                let isLoggedIn: boolean = await this.checkIsLoggedIn();
                if (this.isEmpty(isLoggedIn) === false) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }
            else {
                resolve(false);
            }

        })
    }

    async promptLoginChoices(): Promise<boolean> {

        return new Promise<boolean>(async (resolve) => {
            const alert = await this.alertCtrl.create({
                header: 'Credentials Required?',
                message: 'To proceed, please login or continue as a guest.',
                buttons: [
                    {
                        text: 'Login',
                        handler: () => {
                            console.log('Login clicked');
                            this.promptMemberLogin();
                        }
                    },
                    {
                        text: 'Guest',
                        handler: () => {
                            console.log('Guest clicked');
                            alert.dismiss(LoginOptionsEnum.guestLogin);
                            this.instantGuestLogin();
                        }
                    },
                    {
                        text: 'Leave',
                        handler: () => {
                            console.log('Leave clicked');
                            alert.dismiss(LoginOptionsEnum.cancelLogin)
                        }
                    }
                ]
            });
            await alert.present();
            let isLoggedIn: boolean = await this.getIsLoggedIn();
            resolve(isLoggedIn);
        });


    }

    async promptMemberLogin(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            const alert = await this.alertCtrl.create({
                header: 'Member Login',
                message: "Please login to continue.",
                inputs: [
                    {
                        type: 'text',
                        name: 'email',
                        placeholder: 'email',
                        value: '',

                    },
                    {
                        type: 'password',
                        name: 'password',
                        value: '',
                        placeholder: ''
                    },
                    {
                        type: 'checkbox',
                        name: 'remember',
                        checked: false,
                        label: 'Remember Me'
                    }
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        handler: () => {
                            alert.dismiss();
                        }
                    },
                    {
                        text: 'Login',
                        handler: (data: MemberLoginType) => {
                            alert.dismiss(data);
                        }
                    }
                ]
            });
            await alert.present();

            // await alert.onDidDismiss(async(data: MemberLoginType) => {

            //     if (this.isEmpty(data) === false) {
            //         await this.memberLogIn(data.email, data.password, data.remember);
            //         resolve(true);
            //     }
            //     else {
            //         resolve(false);
            //     }
                

            // })
        });


    }


    // #endregion

    // #region CameraService
    takePicture(): Promise<string> {
        return this.cameraService.takePicture();
    }
    openGallery(): Promise<string> {
        return this.cameraService.openGallery();
    }
    // #endregion CameraService
}
