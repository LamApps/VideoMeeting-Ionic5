// NOTE: use this class to store application wide config strings
import { Injectable } from '@angular/core';

@Injectable({providedIn:'root'})
export class ConfigService {
	constructor() {
		this.subscribePushNotificationEndPoint = "https://nofb.org/LNVApi/Notification/SubscribeLvcPushNotification";
		this.hubUrl = "https://nofb.org/SignalR";
		//this.hubUrl = "https://localhost:44363";
		this.webRtcHubProxyName = "webRtcHub";
		this.clientIdHubProxyName = "clientIdProxyHub";
		this.senderId = "404930055489";
		this.memberTokenFilename = "MemberJwtToken.txt";
		this.guestTokenFilename = "GuestJwtToken.txt";
		this.memberProfile = "MemberProfile.txt";
		this.pushApplicationName = "App_Droid_Uwp";
		this.blockedEmailsFilename = "blockedEmails.txt";
		this.avatarBaseUrl = "https://nofb.org/Content/Avatars/";
		this.contactAvatarBaseUrl = "https://nofb.org/Content/PhoneContacts/";
		this.settingsFile = "AppSettings.txt";
		this.guestFile = "guestInfo.txt";
		this.contactList = "contactList.txt";
		// NOTE: try to get the activeDeviceId from localStorage, if its not set,
		// then get the front facing camera deviceId, and set it

		this.defaultAvatar = "https://nofb.org/Content/Avatars/Default.png" + "?" + Date.now().toString();
		this.webApiBase = "https://nofb.org/LNVApi/";
		this.pbxController = this.webApiBase + "Pbx/";
	}

	domainName: string = "LiveNetVideo.com";
	pbxContentUrl: string = "https://nofb.org/Content/Pbx/";
	employeeImageFolder: string = "Employees";
	pbxLineImageFolder: string = "PbxLines";
	companyLocationImageFolder: string = "Locations";
	companyVideoImageFolder: string = "Videos";
	companyPhotoImageFolder: string = "Photos";

	keySettings: string = "AppSettings.txt";
	keyPushSubscription: string = "PushSubscription.txt";
	keyPushId: string = "PushId.txt";
	keyContactList: string = "ContactList.txt";
	keyBlockEmails: string = "BlockedEmails.txt";
	keyRememberMe: string = "RememberMe.txt";
	keyMemberType: string = "MemberType.txt";
	keyMemberId: string = "MemberId.txt";
	keyGuestFile: string = "GuestProfile.txt";
	keyProxySecret: string = "ProxySecret.txt";
	//keyAccessTokenFile: string = "JwtToken.txt";
    keyJwtToken: string = "JwtToken.txt";
	keyIp: string = "UserIp.txt";
	keyConnectionId: string = "HubConnectionId.txt";
	keyUserEmail: string = "UserEmail.txt";
	keyPbxlines: string = "Pbxlines.txt";
	keyCompanyProfile: string = "CompanyProfile.txt";
	keyCompanyEmployees: string = "CompanyEmployees.txt";
	keyCompanyEmployeeInvites: string = "CompanyEmployeeInvites.txt";
	keyCompanyPhotos: string = "CompanyPhotos.txt";
	keyCompanyLocations: string = "CompanyLocations.txt";
	keyCompanyVideos: string = "CompanyVideos.txt";
	keyEmployers: string = "Employers.txt";
	keyCountries: string = "Countries.txt";
	keyIsLoggedin: string = "IsLoggedIn.txt";
	keyLocalGuid: string = "LocalGuid.txt";
	keyCameraId: string = "CameraId.txt";
    keyMicrophoneId: string = "MicrophoneId.txt";
    keyNetcasts: string = "Netcasts.txt";
    keyNetcastGenre: string = "NetcastGenre.txt";
   
	_webApiBase: string;
	get webApiBase(): string {
		return this._webApiBase;
	}
	set webApiBase(value: string) {
		this._webApiBase = value;
	}

	_pbxController: string;
	get pbxController(): string {
		return this._pbxController;
	}
	set pbxController(value: string) {
		this._pbxController = value;
	}

	_defaultAvatar: string;
	get defaultAvatar(): string {
		return this._defaultAvatar;
	}
	set defaultAvatar(value: string) {
		this._defaultAvatar = value;
	}

	_guestFile: string;
	get guestFile(): string {
		return this._guestFile;
	}
	set guestFile(value: string) {
		this._guestFile = value;
	}

	_settingsFile: string;
	get settingsFile(): string {
		return this._settingsFile;
	}
	set settingsFile(value: string) {
		this._settingsFile = value;
	}

	_contactAvatarBaseUrl: string;
	get contactAvatarBaseUrl(): string {
		return this._contactAvatarBaseUrl;
	}
	set contactAvatarBaseUrl(value: string) {
		this._contactAvatarBaseUrl = value;
	}

	_avatarBaseUrl: string;
	get avatarBaseUrl(): string {
		return this._avatarBaseUrl;
	}
	set avatarBaseUrl(value: string) {
		this._avatarBaseUrl = value;
	}

	_blockedEmailsFilename: string;
	get blockedEmailsFilename(): string {
		return this._blockedEmailsFilename;
	}
	set blockedEmailsFilename(value: string) {
		this._blockedEmailsFilename = value;
	}

	_pushApplicationName: string;
	get pushApplicationName(): string {
		return this._pushApplicationName;
	}
	set pushApplicationName(value: string) {
		this._pushApplicationName = value;
	}

	_memberProfile: string;
	get memberProfile(): string {
		return this._memberProfile;
	}
	set memberProfile(value: string) {
		this._memberProfile = value;
	}

	_memberTokenFilename: string;
	get memberTokenFilename(): string {
		return this._memberTokenFilename;
	}
	set memberTokenFilename(value: string) {
		this._memberTokenFilename = value;
	}

	_guestTokenFilename: string;
	get guestTokenFilename(): string {
		return this._memberTokenFilename;
	}
	set guestTokenFilename(value: string) {
		this._guestTokenFilename = value;
	}

	// Static: name of the signalr hub proxy that deals with webrtc signaling
	_webRtcHubProxyName: string;
	get webRtcHubProxyName(): string {
		return this._webRtcHubProxyName;
	}
	set webRtcHubProxyName(value: string) {
		this._webRtcHubProxyName = value;
	}

	// Static: name of the singalr hub proxy which is a proxy between the app
	// and the Rest Service where the rest service requires the secret static client_id
	_clientIdHubProxyName: string;
	get clientIdHubProxyName(): string {
		return this._clientIdHubProxyName;
	}
	set clientIdHubProxyName(value: string) {
		this._clientIdHubProxyName = value;
	}
	// Static: this is the app id for FCM to authenticate the app for getting a pushId
	_senderId: string;
	get senderId(): string {
		return this._senderId;
	}
	set senderId(value: string) {
		this._senderId = value;
	}

	// the local push notification id for the device, the device will request one
	// every time the app starts, this can be the same or different push id, but regardless
	// the app must later register this push id to the _subscribePushNotificationEndPoint when
	// the user is logged in. the user can login through the login page or their login info is
	// saved in local storage (cache)
	_pushId: string = "";
	get pushId(): string {
		return this._pushId;
	}
	set pushId(pushId: string) {
		this._pushId = pushId;
	}

	// Static: rest end point for registering the local device push notification id
	_subscribePushNotificationEndPoint: string;
	get subscribePushNotificationEndPoint(): string {
		return this._subscribePushNotificationEndPoint;
	}
	set subscribePushNotificationEndPoint(value: string) {
		this._subscribePushNotificationEndPoint = value;
	}

	// Static: the url to the signalr server
	_hubUrl: string;
	//_hubUrl: string = "https://localhost:44363";
	get hubUrl(): string {
		return this._hubUrl;
	}
	set hubUrl(value: string) {
		this._hubUrl = value;
	}

	_contactList: string;
	get contactList(): string {
		return this._contactList;
	}
	set contactList(value: string) {
		this._contactList = value;
    }

    netcastController: string = "https://nofb.org/LNVApi/Netcast/";
    netcastImageUrl: string = "https://nofb.org/Content/Netcast/";
    netcastGenreImageBaseUrl: string = "https://nofb.org/Content/NetcastGenre/";
    netcasteeBaseUrl: string = "https://livenetvideo.com/phone/dist/#/netcastee/";
}
