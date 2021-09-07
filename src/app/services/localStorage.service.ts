// Note: this service is an abstraction of ionic-native/file
// the reason we want to abstract this is because it will be easier to update the abstraction
// then to go through our code to make changes when we update
import { Injectable } from '@angular/core';
//import { ConfigService } from './index';
//import { File, FileError, RemoveResult } from 'ionic-native';
//import { JsHelperService } from './jsHelper.service';
//declare var cordova: any;
//import { NativeStorage } from 'ionic-native';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
//import { Storage } from '@ionic/storage';
@Injectable({providedIn:'root'})
export class LocalStorageService {
	constructor(
		private nativeStorage: NativeStorage,
		//private configService: ConfigService,
		//private storage: Storage,
	) {
		//if (typeof cordova !== 'undefined') {
		//	this.path = cordova.file.dataDirectory ? cordova.file.dataDirectory : cordova.file.cacheDirectory;
		//}
		//else {
		//	this.path = "";
		//}
	}

	_path: string;
	get path(): string {
		return this._path;
	}
	set path(value: string) {
		this._path = value;
	}

	async setItem(key: string, value: any): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.nativeStorage.setItem(key, value)
				.then(() => { resolve(true); }, (error) => { resolve(false); })
				.catch((e) => {
					console.log("localStorage setItem error: ", e);
					resolve(false);
				});
		});
	}

	async getItem(key: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			this.nativeStorage.getItem(key)
				.then(
				(data) => { resolve(data); },
				(error) => { resolve(null); }
				)
				.catch((e) => {
					console.log("localStorage getItem error: ", e);
					resolve(null);
				});
		});

		// error.code contains one of the error codes below -jhon
		// NATIVE_WRITE_FAILED = 1
		// ITEM_NOT_FOUND = 2
		// NULL_REFERENCE = 3
		// UNDEFINED_TYPE = 4
		// JSON_ERROR = 5
		// WRONG_PARAMETER = 6
	}

	async removeItem(key: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.nativeStorage.remove(key)
				.then(() => {
					//console.log("localStorage.service.ts removeItem success: ", key);
					resolve(true);
				})
				.catch((error) => {
					console.log("removeItem error: ", error);
					resolve(false);
				});
		});
	}

	async removeAllItems(): Promise<boolean> {
		//console.log("removeAllItems")
		return new Promise<boolean>((resolve, reject) => {
			//console.log("removeAllItems inside promise");
			this.nativeStorage.clear()
				.then((data) => {
					//console.log("nativeStorage cleared", data);
					resolve(true);
				})
				.catch((error) => {
					//console.log("removeAllItems error: ", error);
					resolve(false);
				});
		});
    }



	//===========================================================

	//async setPermanentItem(key: string, value: any, dontAlterKey?: boolean): Promise<boolean> {
	//	if (dontAlterKey !== true) {
	//		let email = await this.getItem("key" + this.configService.keyUserEmail);
	//		email = (email !== "undefined" && email !== null) ? email : "";
	//		key = "key" + email + key;
	//	}

	//	return new Promise<boolean>((resolve) => {
	//		this.nativeStorage.setItem(key, value)
	//			.then(() => { resolve(true); }, (error) => { resolve(false); })
	//			.catch((e) => {
	//				console.log("localStorage setItem error: ", e);
	//				resolve(false);
	//			});
	//	});
	//}

	//async setSessionItem(key: string, value: any, dontAlterKey?: boolean): Promise<boolean> {
	//	try {
	//		//console.log("localStorageService.setSessionItem: ", key, value);
	//		if (dontAlterKey !== true) {
	//			let email:string = await this.nativeStorage.getItem("key" + this.configService.keyUserEmail)
	//				.then(
	//				(data) => { return data; },
	//				(error) => { return null; }
	//				)
	//				.catch((e) => {
	//					console.log("getPermanentItem error: ", e);
	//					return null;
	//				});

	//			email = (email !== "undefined" && email !== null) ? email : "";
	//			key = "key" + email + key;
	//		}
	//		try {
	//			await this.storage.set(key, value);
	//			return true;
	//		}
	//		catch (e) {
	//			throw (e);
	//		}
	//	}
	//	catch (e) {
	//		console.log("setSessionItem error: ", e);
	//		return false;
	//	}
	//}

	//async getPermanentItem<T>(key: string, dontAlterKey?: boolean): Promise<T> {
	//	if (dontAlterKey !== true) {
	//		let email = await this.getItem("key" + this.configService.keyUserEmail);
	//		email = (email !== "undefined" && email !== null) ? email : "";
	//		key = "key" + email + key;
	//	}

	//	return new Promise<any>((resolve) => {
	//		this.nativeStorage.getItem(key)
	//			.then(
	//			(data) => { resolve(data); },
	//			(error) => { resolve(null); }
	//			)
	//			.catch((e) => {
	//				console.log("getPermanentItem error: ", e);
	//				resolve(null);
	//			});
	//	});
	//}

	//async getSessionItem<T>(key: string, dontAlterKey?: boolean): Promise<T> {
	//	//console.log("localStorage getSessionItem key: ", key);
	//	try {
	//		if (dontAlterKey !== true) {
	//			let email = await this.getItem("key" + this.configService.keyUserEmail);
	//			email = (email !== "undefined" && email !== null) ? email : "";
	//			key = "key" + email + key;
	//		}
	//		let item: T = await this.storage.get(key);

	//		return item;
	//	}
	//	catch (e) {
	//		console.log("getSessionItem error: ", e);

	//		return null;
	//	}
	//}

	//async removePermanentItem(key: string, dontAlterKey?: boolean): Promise<boolean> {
	//	if (dontAlterKey !== true) {
	//		let email = await this.getItem("key" + this.configService.keyUserEmail);
	//		email = (email !== "undefined" && email !== null) ? email : "";
	//		key = "key" + email + key;
	//	}

	//	return new Promise<boolean>((resolve, reject) => {
	//		this.nativeStorage.remove(key)
	//			.then(function () {
	//				//console.log("localStorage.service.ts removeItem success: ", key);
	//				resolve(true);
	//			})
	//			.catch(function (e) {
	//				console.log("removePermanentItem error: ", e);
	//				resolve(false);
	//			});
	//	});
	//}

	//async removeSessionItem(key: string, dontAlterKey?: boolean): Promise<boolean> {
	//	try {
	//		if (dontAlterKey !== true) {
	//			let email = await this.getItem("key" + this.configService.keyUserEmail);
	//			email = (email !== "undefined" && email !== null) ? email : "";
	//			key = "key" + email + key;
	//		}

	//		await this.storage.remove(key);
	//		return true;
	//	}
	//	catch (e) {
	//		console.log("removeSessionItem error: ", e);
	//		return false;
	//	}
	//}

	//async removeAllPermanentItems(): Promise<boolean> {
	//	try {
	//		await this.removeAllItems();
	//		return true;
	//	}
	//	catch (e) {
	//		console.log("removeAllPermanentItems error: ", e);
	//		return false;
	//	}
	//}

	//async removeAllSessionItems(): Promise<boolean> {
	//	try {
	//		await this.storage.clear();
	//		return true;
	//	}
	//	catch (e) {
	//		console.log("removeAllSessionItems error: ", e);
	//		return false;
	//	}
	//}
}
