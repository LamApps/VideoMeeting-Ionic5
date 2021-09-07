import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
//import 'rxjs/add/operator/map';
import { filter } from 'rxjs/operators';

//import { Contact } from '../models/Contact';

//import { ThirdPartyFiles } from '../services/thirdpartyFiles';
//import { JsHelperService } from '../services/jsHelper.service';
//import { AuthService } from './auth.service';
import {
	LocalStorageService,
	SignalrService,
	JsHelperService,
	ConfigService,
	PushService
} from './index';
import {
	MemberType,
	WebApiResponseStatusType,
	WebApiResponseType,
	//BlockedContact,
	//Contact,
	//PhoneContactType,
	RegisterDto,
	SendInviteDto,
	GuestLogin,
	GuestProfileType,
	JwtToken,
	PushSubscriptionType,
	UnsubscribePushNotificationDto
} from '../models/index';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
// import { filter } from 'rxjs/operator';
//import { Platform } from "ionic-angular";

@Injectable({providedIn:'root'})
export class UserService {
	MemberToken: any;

	//public MemberContacts: Contact[];
	//public BlockList: BlockedContact[];
	profileUpdated: Subject<MemberType>

	constructor(
		//private http: Http,
		private jsHelperService: JsHelperService,
		private signalrService: SignalrService,
		private localStorageService: LocalStorageService,
		private configService: ConfigService,
		private pushService: PushService,
		//private platform: Platform
	) {
		//this.getContactsList();
		//this.getBlockList();
		this.isMember = false;

		this.profileUpdated = new Subject<MemberType>();

		this._webApiBase = this.configService.webApiBase;
	}

	_webApiBase: string;

	_redirectUrl: string;
	get redirectUrl(): string {
		return this._redirectUrl;
	}
	set redirectUrl(value: string) {
		this._redirectUrl = value;
	}

	async getIsLoggedIn(): Promise<boolean> {
		return this.localStorageService.getItem(this.configService.keyIsLoggedin);
	}
	async setIsLoggedIn(value: boolean): Promise<boolean> {
		return this.localStorageService.setItem(this.configService.keyIsLoggedin, value);
	}

	// a convenience marker for the app, we will trust this marker to be correct. this will require
	// good testing for various app scenarios
	_isMember: boolean;
	get isMember(): boolean {
		return this._isMember;
	}
	set isMember(value: boolean) {
		this._isMember = value;
	}

	// QUESTION: Jhon how do you know someone just registered? or logged in for the first time?
	// also this property was missing a setter, I added a setter. Let me know if the missign setter is on purpose.
	private _justRegistered: boolean;
	get justRegistered() {
		return this._justRegistered;
	}
	set justRegistered(value: boolean) {
		this._justRegistered = value;
	}

	async getGuestProfile(): Promise<GuestProfileType> {
		let key = this.configService.keyGuestFile;
		return this.localStorageService.getItem(key);
	}
	async setGuestProfile(value: GuestProfileType): Promise<boolean> {
		let key = this.configService.keyGuestFile;
		return this.localStorageService.setItem(key, value);
	}

	async getProfile(): Promise<MemberType> {
		let key = this.configService.keyMemberType;
		return this.localStorageService.getItem(key);
	}
	async setProfile(value: MemberType): Promise<boolean> {
		//console.log("userService setProfile: ", value);
		let key = this.configService.keyMemberType;
		return this.localStorageService.setItem(key, value);
	}

	//_guestProfile: GuestProfileType;
	//get guestProfile(): GuestProfileType {
	//	return this._guestProfile;
	//}
	//set guestProfile(value: GuestProfileType) {
	//	this._guestProfile = value;
	//}

	////member profile
	//_profile: MemberType;
	//get profile(): MemberType {
	//	return this._profile;
	//}
	//set profile(value: MemberType) {
	//	this._profile = value;
	//}

	//doLogout(): Promise<void> {
	//	return new Promise<void>((resolve, reject) => {
	//		//console.log("user.service.ts doing logout");
	//		if (this.isMember) {
	//			this.memberLogOut()
	//				.then(() => {
	//					return this.signalrService.endWebRtcHubListeners();
	//				})
	//				.then(() => {
	//					this.isMember = false;
	//					resolve();
	//				})
	//				.catch(error => {
	//					reject(error);
	//				})
	//		} else {
	//			this.guestLogOut()
	//				.then(() => {
	//					return this.signalrService.endWebRtcHubListeners();
	//				})
	//				.then(() => {
	//					resolve();
	//				})
	//				.catch(error => {
	//					reject(error);
	//				});
	//		}
	//	})
	//}

	//NOTE: when the user profile updates, we need to notify any component that requires updated profile
	// example the profile-summary.component.ts
	private _onProfileUpdated = new BehaviorSubject<MemberType>(null);
	get onProfileUpdated(): Observable<MemberType> {
		return this._onProfileUpdated.asObservable().pipe(filter<MemberType>((o) => { return this.jsHelperService.isEmpty(o) === false && o.memberId > 0; }));
	}

	//requestMemberProfile
	async getMyProfile(accessToken: string): Promise<MemberType> {
		try {
			let memberType = await this.jsHelperService.ajaxRequestParsed<MemberType>("GET", "https://nofb.org/LNVApi/Member/GetMyProfile", null, accessToken);
			//console.log("userService getMyProfile: ", memberType);
			return memberType;
		}
		catch (e) {
			throw (e);
		}

		//return new Promise<MemberType>((resolve, reject) => {
		//	//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;

		//	//console.log("user.service.ts getMyProfile using accessToken: ", accessToken);
		//	this.jsHelperService.ajaxRequest("GET", "https://nofb.org/LNVApi/Member/GetMyProfile", null, accessToken)
		//		.then((data) => {
		//			console.log("user.service.ts getMyProfile json data:", data);
		//			let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(data, true);
		//			if (this.jsHelperService.isEmpty(apiResponse) === false) {
		//				if (apiResponse.status === WebApiResponseStatusType.success) {
		//					let profile: MemberType = this.jsHelperService.jsonToObject<MemberType>(apiResponse.data, true);
		//					//console.log("Member Profile: ", profile);
		//					resolve(profile);
		//				}
		//				else {
		//					let errors: Array<string> = this.jsHelperService.tryParseJson(apiResponse.data);
		//					reject("user.service.ts getMyProfile request error:" + this.jsHelperService.implode(" |", errors));
		//				}
		//			}
		//			else {
		//				reject("getMyProfile: Unable to parse WebApiResponseType");
		//			}
		//		})
		//		.catch((error) => {
		//			console.log("Something went wrong while fetching member details, Error:", error);
		//			reject(error);
		//		});
		//});
	}

	// convenience method to save the member profile as part of the service, for later use.
	// this will allow then chaining.
	async setMemberProfile(profile: MemberType): Promise<MemberType> {
		try {
			if (this.jsHelperService.isEmpty(profile) === false && profile.hasOwnProperty("email")) {
				await this.setProfile(profile);
				return profile;
			}
			else {
				throw ("setMemberProfile: profile missing property email");
			}
		}
		catch (e) {
			throw (e);
		}
	}

	async unsetMemberProfile(): Promise<void> {
		try {
			await this.setProfile(null);
			return;
		}
		catch (e) {
			throw (e);
		}
	}

	//setGuestProfile(guestProfile: GuestProfileType): Promise<void> {
	//	return new Promise<void>((resolve, reject) => {
	//		this.localStorageService.setItem(this.configService.guestFile, guestProfile)
	//			.then(() => {
	//				this.guestProfile = guestProfile;
	//			})
	//			.then(() => {
	//				resolve();
	//			})
	//			.catch((error) => {
	//				reject(error);
	//			})
	//	});
	//}

	async unsetGuestProfile(): Promise<void> {
		try {
			await this.setGuestProfile(null);
			return;
		}
		catch (e) {
			throw (e);
		}
	}

	register(register: RegisterDto, accessToken: string): Promise<MemberType> {
		let methodName = "register";
		return new Promise<MemberType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/Register";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				FirstName: register.firstName,
				LastName: register.lastName,
				Email: register.email,
				AltEmail: register.altEmail,
				Password: register.password,
				Username: register.username,
				AvatarDataUri: register.avatarDataUri,
				IsVerified: (typeof register.isVerified === 'undefined') ? true : register.isVerified,
				IsSuspended: (typeof register.isSuspended === 'undefined') ? false : register.isSuspended
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					//console.log("got response: ", response);
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: MemberType = this.jsHelperService.jsonToObject<MemberType>(apiResponse.data, true);
							this._justRegistered = true;
							resolve(result);
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
					reject(methodName + ": ajax request failed." + this.jsHelperService.stringify(error));
				});
		});
	}

	async addMemberProfileImage(dataUri: string, accessToken: string): Promise<MemberType> {
		try {
			let url = `https://nofb.org/LNVApi/Member/AddMemberProfileImage/`;
			//let url = `http://localhost:18303/Member/AddMemberProfileImage/`;
			let payload: FormData = new FormData();
			let blob: Blob = this.jsHelperService.dataUriToBlob(dataUri);
			payload.append("uploadImage", blob, "uploadImage" + blob.type.replace("image/", "."));

			let dto: MemberType = await this.jsHelperService.ajaxRequestParsed<MemberType>('POST', url, payload, accessToken)
			if (this.jsHelperService.isEmpty(dto) === false) {
				await this.setProfile(dto);
				//console.log("signalr.service.ts receiveCancelInvitation message:", message);
				this._onProfileUpdated.next(dto);
				this._onProfileUpdated.next(null);
				return dto;
			}
		}
		catch (e) {
			throw (e);
		}
	}

	// Stores: this.companyProfile
	async deleteMemberProfileImage(accessToken: string): Promise<MemberType> {
		try {
			let url = `https://nofb.org/LNVApi/Member/DeleteMemberProfileImage/`;
			let payload = null;

			let dto: MemberType = await this.jsHelperService.ajaxRequestParsed<MemberType>("DELETE", url, payload, accessToken)
			if (this.jsHelperService.isEmpty(dto) === false) {
				await this.setProfile(dto);
				this._onProfileUpdated.next(dto);
				this._onProfileUpdated.next(null);
				return dto;
			}
		}
		catch (e) {
			throw (e);
		}
	}

	async canGuestLogin(email: string, accessToken: string): Promise<boolean> {
		// Guests can not use member emails to login, and the email can not already be checked into webrtc hub (hubconnection record)

		// check if the email belongs to a member or
		try {
			let url = this.configService.webApiBase + 'Db/CanGuestLogin/' + email + '/'; // NOTE: when passing email in uri segment we need a trailing slash
			//let url = `http://localhost:18303/Db/CanGuestLogin/${email}/`;
			let data = await this.jsHelperService.ajaxRequest("GET", url, null, accessToken);

			//console.log("canGuestLogin data:", data);
			let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(data, true);
			if (this.jsHelperService.isEmpty(apiResponse) === false) {
				if (apiResponse.status === WebApiResponseStatusType.success) {
					return true;
				}
				else {
					let errors: Array<string> = this.jsHelperService.tryParseJson(apiResponse.data);
					if (this.jsHelperService.isEmpty(errors) === false) {
						throw (this.jsHelperService.implode(" |", errors));
					}
					else {
						throw ("Email not accepted. It is either used by another guest user or belongs to a member. Please try a different email account.");
					}
				}
			}
			else {
				throw ("Unable to authenticate email. Please try again later.");
			}
		}
		catch (e) {
			throw (e);
		}
	}

	requestMemberId(email: string, accessToken: string): Promise<string> {
		let methodName = "requestMemberId";
		return new Promise<string>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/RequestMemberId";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: email
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result = apiResponse.data;
							resolve(result);
						}
						else {
							let errors: Array<string> = this.jsHelperService.tryParseJson(apiResponse.data);
							reject("getAllBlockedEmails errors: " + this.jsHelperService.implode(" |", errors));
						}
					}
					else {
						reject("getAllBlockedEmails: unable to parse webApiResponseType.");
					}
				})
				.catch((error) => {
					//console.log(error);
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	requestAvatarFilename(email: string, accessToken: string): Promise<string> {
		let methodName = "requestAvatarFilename";
		return new Promise<string>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/RequestAvatarFileName";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: email
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: string = apiResponse.data;
							resolve(result);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	updateMyProfile(member: MemberType, accessToken: string): Promise<MemberType> {
		return new Promise<MemberType>((resolve, reject) => {
			let post: any = {
				MemberId: member.memberId,
				Created: member.created,
				Updated: member.updated,
				Username: member.username,
				IsSuspended: member.isSuspended,
				IsVerified: member.isVerified,
				Email: member.email,
				FirstName: member.firstName,
				LastName: member.lastName,
				Notes: member.notes,
				AvatarDataUri: member.avatarDataUri
			}

			let payload = this.jsHelperService.formatWebApiPayload(post);
			let url: string = "https://nofb.org/LNVApi/Member/UpdateMyProfile";
			this.jsHelperService.ajaxRequestParsed<MemberType>("POST", url, payload, accessToken)
				.then((dto: MemberType) => {
					//console.log("dto: ", dto)
					this.profileUpdated.next(dto);
					resolve(dto);
				})
				.catch((error) => {
					//console.log("error: ", error);
					reject(error);
				});
		})

		//let methodName = "updateMyProfile";
		//return new Promise<MemberType>((resolve, reject) => {
		//	let url: string = "https://nofb.org/LNVApi/Member/UpdateMyProfile";
		//	let method = "POST";
		//	//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
		//	let payload: any = {
		//		MemberId: member.memberId,
		//		Created: member.created,
		//		Updated: member.updated,
		//		Username: member.username,
		//		IsSuspended: member.isSuspended,
		//		IsVerified: member.isVerified,
		//		Email: member.email,
		//		FirstName: member.firstName,
		//		LastName: member.lastName,
		//		Notes: member.notes,
		//		AvatarDataUri: member.avatarDataUri
		//	}

		//	this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
		//		.then((response) => {
		//			let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
		//			if (this.jsHelperService.isEmpty(apiResponse) === false) {
		//				if (apiResponse.status === WebApiResponseStatusType.success) {
		//					let result: MemberType = this.jsHelperService.jsonToObject<MemberType>(apiResponse.data, true);
		//					//emit an event that the profile has been updated
		//					this.profileUpdated.next(result);
		//					resolve(result);
		//				}
		//				else {
		//					let errors: Array<string> = this.jsHelperService.tryParseJson(apiResponse.data);
		//					reject(methodName + " errors: " + this.jsHelperService.implode(" |", errors));
		//				}
		//			}
		//			else {
		//				reject(methodName + ": unable to parse webApiResponseType.");
		//			}
		//		})
		//		.catch((error) => {
		//			//console.log(error);
		//			reject(methodName + ": ajax request failed.");
		//		});
		//});
	}

	requestMemberAvatarDataUri(email: string, accessToken: string): Promise<string> {
		let methodName = "requestMemberAvatarDataUri";
		return new Promise<string>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/RequestMemberAvatarDataUri";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: email
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result = apiResponse.data;
							resolve(result);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	getMemberByEmail(email: string, accessToken: string): Promise<MemberType> {
		let methodName = "getMemberByEmail";
		return new Promise<MemberType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/GetMemberByEmail";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: email
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: MemberType = this.jsHelperService.jsonToObject<MemberType>(apiResponse.data, true);
							resolve(result);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	sendInvite(invite: SendInviteDto, accessToken: string): Promise<boolean> {
		let methodName = "sendInvite";
		return new Promise<boolean>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/SendInvite";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: invite.email,
				Name: invite.name
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							resolve(true);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	// this will remove the refresh token record from server so it can not be reused
	// Member/Logout
	clearRefreshToken(refreshTokenId: string, accessToken: string): Promise<boolean> {
		let methodName = "logout";
		return new Promise<boolean>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/Logout";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				RefreshTokenId: refreshTokenId
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							resolve(true);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	// verifies a logged in users password. used for verifying a users old password
	// before allowing them to change password
	verifyPassword(password: string, accessToken: string): Promise<boolean> {
		let methodName = "verifyPassword";
		return new Promise<boolean>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/VerifyPassword";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				password: password
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							resolve(true);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	changePassword(password: string, accessToken: string): Promise<MemberType> {
		let methodName = "changePassword";
		return new Promise<MemberType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/ChangePassword";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				password: password
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: MemberType = this.jsHelperService.jsonToObject<MemberType>(apiResponse.data, true);
							resolve(result);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	sendPasswordResetRequest(email: string, accessToken: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let methodName = "sendPasswordResetRequest";
			return new Promise<MemberType | void>((resolve, reject) => {
				let url: string = "https://nofb.org/LNVApi/Member/SendPasswordResetRequest";
				let method = "POST";
				//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
				let payload: any = {
					Email: email
				}

				this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
					.then((response) => {
						let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
						if (this.jsHelperService.isEmpty(apiResponse) === false) {
							if (apiResponse.status === WebApiResponseStatusType.success) {
								resolve();
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
						reject(methodName + ": ajax request failed.");
					});
			});
		});
	}

	updateEmail(email: string, accessToken: string): Promise<MemberType> {
		let methodName = "updateEmail";
		return new Promise<MemberType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/UpdateEmail";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: email
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: MemberType = this.jsHelperService.jsonToObject<MemberType>(apiResponse.data, true);
							this.profileUpdated.next(result);
							resolve(result);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	updateUsername(username: string, accessToken: string): Promise<MemberType> {
		let methodName = "updateUsername";
		return new Promise<MemberType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/UpdateUsername";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Id: username
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: MemberType = this.jsHelperService.jsonToObject<MemberType>(apiResponse.data, true);
							resolve(result);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	isEmailUnique(email: string, accessToken: string): Promise<string> {
		let methodName = "isEmailUnique";
		return new Promise<string>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/IsEmailUnique";
			let method = "POST";
			let payload: any = {
				Email: email
			}
			// this will check if an email belongs to any members in the system,
			// it will return failed status with email if it exists or errors message if errors occur,
			// status will be success if not exist
			// NOTE: call this service, success will indicate unique email. If it fails
			// this means the email is already in the system and can not be used again
			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							resolve("");
						}
						else {
							resolve(apiResponse.data);
						}
					}
					else {
						reject(methodName + ": unable to parse webApiResponseType.");
					}
				})
				.catch((error) => {
					//console.log(error);
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	isUsernameUnique(username: string, accessToken: string): Promise<string> {
		let methodName = "isEmailUnique";
		return new Promise<string>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Member/IsUsernameUnique";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Id: username
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result = apiResponse.data;
							resolve(result);
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
					reject(methodName + ": ajax request failed.");
				});
		});
	}

	memberLogIn(email: string, password: string, rememberMe: boolean): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.signalrService.requestMemberToken(email, password)
				.then((jwtToken: JwtToken) => {
					//console.log("user.service.ts memberLogin() got jwtToken: ", jwtToken);
					return this.setupMember(jwtToken, rememberMe);
				})
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error)
				});
		});
	}

	memberLogOut(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.unsetupMember()
				.then(() => {
					resolve();
				})
				.catch(error => {
					//console.log("error logging out", error)
					reject(error);
				});
		})
	}

	guestLogin(guestLogin: GuestLogin): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let guestProfile = new GuestProfileType();
			guestProfile.email = guestLogin.email;
			guestProfile.name = this.jsHelperService.isEmpty(guestLogin.name) ? guestLogin.email : guestLogin.name;
			guestProfile.avatarDataUri = "";
			guestProfile.avatarFilename = "";
			// NOTE: guest users can choose to save an avatar from settings if they want

			this.setupGuest(guestProfile)
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				})
		});
	}

	guestLogOut(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.signalrService.webrtcHubCheckOut()
				.catch(error => {
					//console.log("error logging out", error)
					reject(error);
				})
				.then(() => {
					//TODO: make sure all closing actions are done here

					//when a member user explicitly logs out, we clear all stored data
					this.localStorageService.removeAllItems();
					this.isMember = false;
					resolve();
				})
		})
	}

	// this is a convenience method, it will try to login the user, using their stored JwtToken if they have one,
	// it will resolve is all goes well or reject if an error occured
	tryLoginFromRemembered(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.localStorageService.getItem(this.configService.memberTokenFilename)
				.then((jwtToken) => {
					if (this.jsHelperService.isEmpty(jwtToken)) {
						throw ("user.service.ts tryLoginFromRemembered() empty member jwtToken from localStorage");
					}
					else {
						//console.log("user.service.ts tryLoginFromRemembered() got member token from storage jwtToken: ", jwtToken);
						return jwtToken;
					}
				})
				.then((jwtToken: JwtToken) => {
					if (this.signalrService.isExpiredToken(jwtToken)) {
						// if the jwtToken is expired renew it
						//console.log("user.service.ts tryLoginFromRemembered() expired token try renew jwtToken", jwtToken);
						return this.signalrService.renewToken(jwtToken);
					}
					else {
						// not expired, so use the same old token
						return jwtToken;
					}
				})
				.then((jwtToken: JwtToken) => {
					return this.setupMember(jwtToken, true);
				})
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		})
	}

	tryStartAsGuest(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.localStorageService.getItem(this.configService.guestFile)
				.then((guestProfile: GuestProfileType) => {
					return this.setupGuest(guestProfile);
				})
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	private async setupMember(token: JwtToken, rememberMe?: boolean): Promise<void> {
		try {
			await this.signalrService.setAccessToken(token);
			let jwtToken = await this.signalrService.getJwtToken();
			let profile: MemberType;
			try {
				profile = await this.getMyProfile(jwtToken.access_token);
			}
			catch (e) {
				throw (e);
			}

			await this.setMemberProfile(profile);
			await this.signalrService.setEmail(profile.email);

			let localGuid: string = await this.signalrService.webrtcHubCheckIn(profile.firstName + " " + profile.lastName);

			await this.signalrService.setLocalGuid(localGuid);

            if (rememberMe) {
				this.localStorageService.setItem(this.configService.memberTokenFilename, jwtToken);
			}
			else {
				this.localStorageService.removeItem(this.configService.memberTokenFilename);
			}

			if (this.pushService.isCompatible() && this.isMember) {
				//console.log("user.service.ts setupMember() is Android");
				let pushSubscription: PushSubscriptionType;
				try {
					pushSubscription = await this.pushService.subscribePushNotification(profile.email, jwtToken.access_token);
					await this.pushService.storePushSubscrition(pushSubscription)
				}
				catch (e) {
					console.log("user.service.ts -> setupMember() -> pushService.subscribePushNotification() error: ", e);
				}
			}

			return;

			//this.signalrService.setAccessToken(jwtToken)
			//	.then(() => {
			//		console.log("user.service.ts setupMember() finished setAccessToken()");
			//		let jwtToken = this.signalrService.jwtToken;
			//		if (this.jsHelperService.isEmpty(jwtToken) === false) {
			//			return this.getMyProfile(jwtToken.access_token);
			//		}
			//		else {
			//			throw ("user.service.ts trying to get jwtToken to make request for getMyProfile, but jwtToken is empty.");
			//		}
			//	})
			//	.then((profile: MemberType) => {
			//		console.log("user.service.ts setupMember() got member profile: ", profile);
			//		return this.setMemberProfile(profile);
			//	})
			//	.then(() => {
			//		console.log("user.service.ts setupMember() setEmail()", this.profile.email);
			//		return this.signalrService.setEmail(this.profile.email);
			//	})
			//	.then(() => {
			//		console.log("user.service.ts setupMember() doing webrtcHubCheckin()");
			//		return this.signalrService.webrtcHubCheckIn(this.profile.firstName + " " + this.profile.lastName);
			//	})
			//	.then((localGuid: string) => {
			//		console.log("user.service.ts setupMember() setting localGuid: ", localGuid);
			//		return this.signalrService.setLocalGuid(localGuid);
			//	})
			//	.then(() => {
			//		this.isMember = true;
			//		console.log("user.service.ts setupMember() setting isMember to true");
			//		return;
			//	})
			//	.then(() => {
			//		if (rememberMe) {
			//			this.localStorageService.setItem(this.configService.memberTokenFilename, this.signalrService.jwtToken);
			//		}
			//		else {
			//			this.localStorageService.removeItem(this.configService.memberTokenFilename);
			//		}
			//		console.log("user.service.ts setupMember() finished rememberMe check");
			//		resolve();
			//	})
			//	.catch((error) => {
			//		reject(error);
			//	})
			//	.then(() => {
			//		if (this.pushService.isCompatible() && this.isMember) {
			//			console.log("user.service.ts setupMember() is Android");
			//			this.pushService.subscribePushNotification(this.profile.email, jwtToken.access_token)
			//				.then((pushSubscription: PushSubscriptionType) => {
			//					console.log("user.service.ts setupMember() pushService.subscribePushNotification() email: ", this.profile.email);
			//					return this.pushService.storePushSubscrition(pushSubscription);
			//				})
			//				.then(() => {
			//					console.log("subscribed to push notifications");
			//				})
			//				.catch((error) => {
			//					console.log("user.service.ts -> setupMember() -> pushService.subscribePushNotification() error: ", error);
			//				})
			//		}
			//	})
		}
		catch (e) {
			throw (e);
		}
	}

	async unsetupMember(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			// if pushService is compatible and the user is a member
			if (this.pushService.isCompatible() && this.isMember) {
				let unpush = new UnsubscribePushNotificationDto();
				unpush.email = this.pushService.pushSubscription.email;
				unpush.applicationName = this.pushService.pushSubscription.applicationName;
				unpush.serviceProviderName = this.pushService.pushSubscription.serviceProviderName;
                unpush.token = this.pushService.pushSubscription.token;
                let accessToken: string = await this.signalrService.getAccessToken();
				//let token = this.signalrService.jwtToken.access_token;
                this.pushService.unsubscribePushNotification(unpush, accessToken)
					.then((pushSubscription: PushSubscriptionType) => {
						//console.log("unsubscribed to pushNotification: ", pushSubscription);
					})
					.catch((error) => {
						console.log("user.service.ts -> unsetupMember() -> pushService.unsubscribePushNotification() error: ", error);
					});
			}

			this.signalrService.webrtcHubCheckOut()
				.then(() => {
					return this.localStorageService.removeItem(this.configService.contactList);
				})
				.then(() => {
					return this.signalrService.unsetLocalGuid();
				})
				.then(() => {
					return this.signalrService.unsetEmail();
				})
				.then(() => {
					return this.unsetMemberProfile();
				})
				.then(() => {
					return this.localStorageService.removeItem(this.configService.memberTokenFilename);
				})
				.then(() => {
					return this.signalrService.getNewGuestToken();
				})
				.then((jwtToken: JwtToken) => {
					return this.signalrService.setAccessToken(jwtToken);
				})
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				})
		});
	}

	private async setupGuest(guestProfile: GuestProfileType): Promise<void> {
		try {
			// attach guestProfile to userService and store in localStorage
			await this.setGuestProfile(guestProfile)

			// remove any member info
			this.isMember = false;
			// remove the member token
			await this.localStorageService.removeItem(this.configService.memberTokenFilename);
			await this.signalrService.setEmail(guestProfile.email);
			guestProfile = await this.getGuestProfile();

			let name = this.jsHelperService.isEmpty(guestProfile.name) ? guestProfile.email : guestProfile.name;
			let localGuid: string = await this.signalrService.webrtcHubCheckIn(name);

			await this.signalrService.setLocalGuid(localGuid);
			return
		}
		catch (e) {
			throw (e);
		}
	}

	//private unsetupGuest(): Promise<void> {
	//	return new Promise<void>((resolve, reject) => {
	//		this.signalrService.webrtcHubCheckOut()
	//			.then(() => {
	//				return this.signalrService.unsetLocalGuid();
	//			})
	//			.then(() => {
	//				return this.signalrService.unsetEmail();
	//			})
	//			.then(() => {
	//				return this.unsetGuestProfile();
	//			})
	//			//.then(() => {
	//			//	return this.signalrService.getNewGuestToken();
	//			//})
	//			//.then((jwtToken: JwtToken) => {
	//			//	return this.signalrService.setAccessToken(jwtToken);
	//			//})
	//			.then(() => {
	//				resolve();
	//			})
	//			.catch((error) => {
	//				reject(error);
	//			})
	//	});
	//}
}
