import { Injectable } from '@angular/core';
//import { Http, URLSearchParams, Headers, RequestOptions } from '@angular/http';
//import 'rxjs/add/operator/map';
//import { ThirdPartyFiles } from '../services/thirdpartyFiles';
//import { Push, PushNotification, Device } from 'ionic-native';
//import { PushNotification } from 'phonegap-plugin-push';
import { Platform } from '@ionic/angular';
//import { Push, PushObject } from '@ionic-native/push';
//import { Device } from '@ionic-native/device';

import {
	ConfigService,
	JsHelperService
} from "./index";
import {
	WebApiResponseType,
	WebApiResponseStatusType,
	PushSubscriptionType,
	PushProviderType,
	UnsubscribePushNotificationDto,
	GetPushIdDto,
	SendPushNotificationDto,
	SendPushResultDto,
	PushNotificationMessageDto
} from '../models/index';

@Injectable({providedIn:'root'})
export class PushService {
	constructor(
		private configService: ConfigService,
		private jsHelperService: JsHelperService,
		//private push: Push,
		private platform: Platform
	) { }

	_pushSubscription: PushSubscriptionType;
	get pushSubscription(): PushSubscriptionType {
		return this._pushSubscription;
	}
	set pushSubscription(value: PushSubscriptionType) {
		this._pushSubscription = value;
	}

	_pushId: string = "";
	get pushId(): string {
		return this._pushId;
	}
	set pushId(value: string) {
		this._pushId = value;
	}

	//_pushNotification: any;
	// _pushNotification: PushObject;
	// get pushNotificationInstance(): PushObject {
	// 	// returns an instance of pushNotification to the client code
	// 	// client code will use the instance to listen for push notifications
	// 	// push.on('notification', function (data) {
	// 	//    //handle incoming push notification while in foreground
	// 	//    alert(data.message);
	// 	//});
	// 	return this._pushNotification;
	// }

	// set pushNotificationInstance(value: PushObject) {
	// 	this._pushNotification = value;
	// }

	isCompatible(): boolean {
		return this.platform.is("android") || this.platform.is("ios");
	}

	// start the push service by first getting the push registration id
	// then later when the user logs in or is logged in, we will register the push registration id
	// along with their email to receive push and send push messages
	// note peer to peer messages should be send directly using our own signalr service.
	// push service should only be used when the app is in the background.
	initPushService(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			resolve("123456");

			// this.pushNotificationInstance = this.push.init({
			// 	android: {
			// 	},
			// 	ios: {
			// 		fcmSandbox: false,
			// 		alert: "true",
			// 		badge: "false",
			// 		sound: "true"
			// 	},
			// 	windows: {}
			// });

			// this.pushNotificationInstance.on('notification')
			// 	.subscribe((notification: any) => {
			// 		console.log('Received a notification', notification);
			// 	});

			// this.pushNotificationInstance.on('registration')
			// 	.subscribe((registration: any) => {
			// 		console.log('Device registered', registration);
			// 		this.pushId = registration.registrationId;
			// 		resolve(this.pushId);
			// 	});

			// this.pushNotificationInstance.on('error')
			// 	.subscribe(error => {
			// 		console.error('Error with Push plugin', error);
			// 		reject(error);
			// 	});
		});
	}

	// check to seee if user has given push notification permission
	hasPermission(): Promise<boolean> {
		console.log("push.service.ts -> hasPermission()")
		return new Promise<boolean>((resolve, reject) => {
			resolve(false);
			// this.push.hasPermission()
			// 	.then((isEnabled) => {
			// 		console.log("isEnabled:", isEnabled);
			// 		if (isEnabled && isEnabled.isEnabled) {
			// 			resolve(true);
			// 		}
			// 		else {
			// 			// this will ask for push permission
			// 			this.push.init({
			// 				android: {
			// 				},
			// 				ios: {
			// 					fcmSandbox: false,
			// 					alert: "true",
			// 					badge: "false",
			// 					sound: "true"
			// 				},
			// 				windows: {}
			// 			});
			// 			//reject("Push Notification permissions not enabled.");
			// 			resolve(true);
			// 		}
			// 	})
			// 	.catch((error) => {
			// 		console.log("push.service.ts -> hasPermission() error: ", error);
			// 	});
		});
	}

    /*
	//// TODO: consolidate registerPushId and subscribePushNotification into subscribePushNotification

	//// use this method to register the pushId, this method requires the pushId and the users email
	//// it will get the email from localStorage of member profile., and the pushId property on this class has to be set before
	//// calling this method
	//// AKA: subScribeLvcPushNotification
	//registerPushId(accessToken?: string): Promise<PushSubscriptionType> {
	//	accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
	//	return new Promise<PushSubscriptionType>((resolve, reject) => {
	//		this.localStorageService.getItem(this.configService.memberProfile)
	//			.then((member: MemberType) => {
	//				//console.log("got existing member profile jsonStr: ", jsonStr);

	//				let serviceProviderName = PushProviderType.fcm; //"FCM";
	//				if (this.platform === "iOS" || this.platform === "OSX") {
	//					serviceProviderName = PushProviderType.apns; //"APNS";
	//				}
	//				else if (this.platform === "Windows") {
	//					serviceProviderName = PushProviderType.wns; //"WNS";
	//				}

	//				var url = this.configService.subscribePushNotificationEndPoint;
	//				var payload = {
	//					Token: this.pushId,
	//					Email: member.email,
	//					ServiceProviderName: serviceProviderName,
	//					ApplicationName: this.configService.pushApplicationName,
	//					RequiresHub: false
	//				};

	//				var method = "POST";

	//				//console.log("before ajaxRequest LvcPushNotificationSubscriptin [method, url, payload]: ", method, url, payload);
	//				this.jsHelperService.ajaxRequest(method, url, payload, this.signalrService.jwtToken.access_token)
	//					.then((apiResponseJson: string) => {
	//						let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(apiResponseJson, true);
	//						if (this.jsHelperService.isEmpty(apiResponse) === false) {
	//							if (apiResponse.status === WebApiResponseStatusType.success) {
	//								let pushSubscription: PushSubscriptionType = this.jsHelperService.jsonToObject<PushSubscriptionType>(apiResponse.data);
	//								//after you get the pushSubscription from this promise, you should store it.
	//								resolve(pushSubscription);
	//							}
	//							else {
	//								let errors: Array<string> = this.jsHelperService.tryParseJson(apiResponse.data);
	//								reject(this.jsHelperService.implode(" |", errors));
	//							}
	//						}
	//						else {
	//							reject("unable to decipher push subscription");
	//						}
	//						//resolve(data);
	//					})
	//					.catch((error) => {
	//						//console.log("unable to register for push: ", error);
	//						reject(error);
	//					});
	//			})
	//			.catch(function (error) {
	//				//console.log("localStorage retrieve member profile error: ", error);
	//				reject(error);
	//			});
	//	});
	//}
    */

	// this method requires the app to set the profile property and the pushId property before calling it.
	// it will use the member.profile.email, and its own pushId property
	subscribePushNotification(email: string, accessToken: string): Promise<PushSubscriptionType> {
		let methodName = "subscribePushNotification";
		return new Promise<PushSubscriptionType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Notification/SubscribeLvcPushNotification";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;

			let serviceProviderName = PushProviderType.fcm; //"FCM";
			if (this.platform.is("ios") || this.platform.is("ipad") || this.platform.is("iphone")) {
				serviceProviderName = PushProviderType.apns; //"APNS";
			}
			else if (this.platform.is("desktop")) {
				serviceProviderName = PushProviderType.wns; //"WNS";
			}

			var payload = {
				Token: this.pushId,
				Email: email,
				ServiceProviderName: serviceProviderName,
				ApplicationName: this.configService.pushApplicationName,
				RequiresHub: false
			};

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: PushSubscriptionType = this.jsHelperService.jsonToObject<PushSubscriptionType>(apiResponse.data, true);
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

	unsubscribePushNotification(unpush: UnsubscribePushNotificationDto, accessToken: string): Promise<PushSubscriptionType> {
		let methodName = "unsubscribePushNotification";
		return new Promise<PushSubscriptionType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Notification/UnSubscribeLvcPushNotification";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: unpush.email,
				Token: unpush.token,
				ServiceProviderName: unpush.serviceProviderName,
				applicationName: unpush.applicationName
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: PushSubscriptionType = this.jsHelperService.jsonToObject<PushSubscriptionType>(apiResponse.data, true);
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

	// used to retrieve a pushsubscription
	getPushId(getPushIdDto: GetPushIdDto, accessToken: string): Promise<PushSubscriptionType> {
		let methodName = "getPushId";
		return new Promise<PushSubscriptionType>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Notification/GetPushId";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;
			let payload: any = {
				Email: getPushIdDto.email,
				ServiceProviderName: getPushIdDto.serviceProviderName,
				applicationName: getPushIdDto.applicationName
			}

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: PushSubscriptionType = this.jsHelperService.jsonToObject<PushSubscriptionType>(apiResponse.data, true);
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

	// sets the pushScription for PushService class
	storePushSubscrition(value: PushSubscriptionType): Promise<void> {
		return new Promise<void>((resolve) => {
			this.pushSubscription = value;
			resolve();
		});
	}

	// get the email associated with the push scription
	getMyEmail(accessToken: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Notification/GetMyEmail";
			let payload: object = {
			};

			//accessToken = this.jsHelperService.isEmpty(accessToken) === false ? accessToken : this.signalrService.jwtToken.access_token;

			this.jsHelperService.ajaxRequest("POST", url, payload, accessToken)
				.then((apiResponseJson: string) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(apiResponseJson, true);
					//console.log("apiResponse: ", apiResponse);
					//console.log("apiResonse status: ", apiResponse.status);
					if (this.jsHelperService.isEmpty(apiResponse) === false && apiResponse.status === WebApiResponseStatusType.success) {
						let email: string = apiResponse.data;
						//console.log("email: ", email);
						resolve(email);
					}
					else {
						reject("getMyEmail: unable to parse WebApiResponseType" + apiResponseJson);
					}
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	//TODO:
	//https://nofb.org/LNVApi/Notification/SendPushNotification(SendPushNotificationDto) post
	sendPushNotification(dto: SendPushNotificationDto, accessToken: string): Promise<Array<SendPushResultDto>> {
		let methodName = "sendPushNotification";
		return new Promise<Array<SendPushResultDto>>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Notification/SendPushNotification";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;

			let serviceProviderName = PushProviderType.fcm; //"FCM";
			if (this.platform.is("ios") || this.platform.is("ipad") || this.platform.is("iphone")) {
				serviceProviderName = PushProviderType.apns; //"APNS";
			}
			else if (this.platform.is("desktop")) {
				serviceProviderName = PushProviderType.wns; //"WNS";
			}

			var payload = {
				Title: dto.title,
				RecipientEmail: dto.recipientEmail,
				Message: dto.message,
				ServiceProviderName: serviceProviderName,
				ApplicationName: this.configService.pushApplicationName,
				Icon: ""
			};

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: Array<SendPushResultDto> = this.jsHelperService.jsonToObject<Array<SendPushResultDto>>(apiResponse.data, true);
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

	//https://nofb.org/LNVApi/Notification/GetPushMessages(StringIdDto) post

	getPushMessages(subscriptionTokenId: string, accessToken: string): Promise<Array<PushNotificationMessageDto>> {
		let methodName = "sendPushNotification";
		return new Promise<Array<PushNotificationMessageDto>>((resolve, reject) => {
			let url: string = "https://nofb.org/LNVApi/Notification/GetPushMessages";
			let method = "POST";
			//accessToken = this.jsHelperService.isEmpty(accessToken) ? this.signalrService.jwtToken.access_token : accessToken;

			//let serviceProviderName = PushProviderType.fcm; //"FCM";
			//if (this.platform.is("ios") || this.platform.is("ipad") || this.platform.is("iphone")) {
			//	serviceProviderName = PushProviderType.apns; //"APNS";
			//}
			//else if (this.platform.is("windows")) {
			//	serviceProviderName = PushProviderType.wns; //"WNS";
			//}

			var payload = {
				Id: subscriptionTokenId
			};

			this.jsHelperService.ajaxRequest(method, url, payload, accessToken)
				.then((response) => {
					let apiResponse: WebApiResponseType = this.jsHelperService.jsonToObject<WebApiResponseType>(response, true);
					if (this.jsHelperService.isEmpty(apiResponse) === false) {
						if (apiResponse.status === WebApiResponseStatusType.success) {
							let result: Array<PushNotificationMessageDto> = this.jsHelperService.jsonToObject<Array<PushNotificationMessageDto>>(apiResponse.data, true);
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
}