import { Injectable } from '@angular/core';
//import { Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
//import { Device } from '@ionic-native/device';
import { Platform } from '@ionic/angular';
import { JsHelperService } from "./index";

@Injectable({providedIn:'root'})
export class PermissionsService {
	constructor(
		//public device: Device,
		private platform: Platform,
		public diagnostic: Diagnostic,
		private jsHelperService: JsHelperService
	) {
	}

	isAndroid() {
		//return this.device.platform.toLowerCase() === "android";
		return this.platform.is('android');
	}

	isiOS() {
		//return this.device.platform.toLowerCase() === "ios";
        //console.log("this.platform: ", this.platform);
		return this.platform.is('ios');
	}

	isWindows() {
		//return this.device.platform.toLowerCase() === "windows";
		return this.platform.is('desktop');
	}

	isUndefined(type) {
		return typeof type === 'undefined';
	}

	arePluginsAvailable() {
		return this.jsHelperService.isEmpty(window['plugins']) ? false : true;
	}

	checkCameraPermissions(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			//if (this.arePluginsAvailable() === false) {
			//	alert('Dev: Camera plugin unavailable.');
			//	resolve(false);
			//}
			//else if
            if (this.isiOS()) {
                console.log("service: isIos");
				this.platform.ready().then(()=>{
					this.diagnostic.getCameraAuthorizationStatus().then(status => {
						if (status == this.diagnostic.permissionStatus.GRANTED) {
							resolve(true);
						}
						else if (status == this.diagnostic.permissionStatus.DENIED) {
							resolve(false);
						}
						else if (status == this.diagnostic.permissionStatus.NOT_REQUESTED || status.toLowerCase() == 'not_determined') {
							this.diagnostic.requestCameraAuthorization(true).then(authorisation => {
								resolve(authorisation == this.diagnostic.permissionStatus.GRANTED);
							});
						}
					});
				})
			}
            else if (this.isAndroid()) {
                console.log("isAndroid");
				this.platform.ready().then(()=>{
					this.diagnostic.isCameraAuthorized().then(authorised => {
						if (authorised) {
							resolve(true);
						}
						else {
							this.diagnostic.requestCameraAuthorization(true).then(authorisation => {
								resolve(authorisation == this.diagnostic.permissionStatus.GRANTED);
							});
						}
					});
				})
			}
            else if (this.isWindows()) {
                console.log("isWindows");
				resolve(true); // for windows
			}
			else {
				//reject("permissions.service.ts unknow platform: " + this.device.platform);
                console.log("isDefault");
				resolve(true); // for windows also
			}
		});
	}

	checkMicrophonePermissions(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			//if (this.arePluginsAvailable() === false) {
			//	alert('Dev: Camera plugin unavailable.');
			//	resolve(false);
			//}
			//else if
			if (this.isiOS()) {
				this.platform.ready().then(()=>{
					this.diagnostic.getMicrophoneAuthorizationStatus().then(status => {
						if (status == this.diagnostic.permissionStatus.GRANTED) {
							resolve(true);
						}
						else if (status == this.diagnostic.permissionStatus.DENIED) {
							resolve(false);
						}
						else if (status == this.diagnostic.permissionStatus.NOT_REQUESTED || status.toLowerCase() == 'not_determined') {
							this.diagnostic.requestMicrophoneAuthorization().then(authorisation => {
								resolve(authorisation == this.diagnostic.permissionStatus.GRANTED);
							});
						}
					});
				});
			}
			else if (this.isAndroid()) {
				this.platform.ready().then(()=>{
					this.diagnostic.isMicrophoneAuthorized().then(authorised => {
						if (authorised) {
							resolve(true);
						}
						else {
							this.diagnostic.requestMicrophoneAuthorization().then(authorisation => {
								resolve(authorisation == this.diagnostic.permissionStatus.GRANTED);
							});
						}
					});
				})
			}
			else if (this.isWindows()) {
				resolve(true);
			}
			else {
				//reject("permissions.service.ts unknow platform: " + this.device.platform);
				resolve(true);
			}
		});
	}
}
