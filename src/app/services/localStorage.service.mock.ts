// Note: this is a mock for unit testing
import { Injectable } from '@angular/core';
import { LocalStorageService } from './localStorage.service';
@Injectable({providedIn:'root'})
export class LocalStorageServiceMock extends LocalStorageService {
	constructor(

	) {
		super(null);
		this.path = "";
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
			resolve(true);
		});
	}

	async getItem(key: string): Promise<any | void> {
		return new Promise<any | void>((resolve, reject) => {
			resolve(0);
		});

		// error.code contains one of the error codes below -jhon
		// NATIVE_WRITE_FAILED = 1
		// ITEM_NOT_FOUND = 2
		// NULL_REFERENCE = 3
		// UNDEFINED_TYPE = 4
		// JSON_ERROR = 5
		// WRONG_PARAMETER = 6
	}

	// async removeItem(key: string): Promise<boolean | void> {
	// 	return new Promise<boolean | void>((resolve, reject) => {
	// 		resolve(true);
	// 	});
	// }

	// async removeAllItems(): Promise<boolean | void> {
	// 	return new Promise<boolean | void>((resolve, reject) => {
	// 		resolve();
	// 	});
	// }

	//async setPermanentItem(key: string, value: any, dontAlterKey?: boolean): Promise<boolean> {
	//	return new Promise<boolean>((resolve) => {
	//		resolve(true);
	//	});
	//}

	//async setSessionItem(key: string, value: any, dontAlterKey?: boolean): Promise<boolean> {
	//	return new Promise<boolean>((resolve) => {
	//		resolve(true);
	//	});
	//}

	//async getPermanentItem<T>(key: string, dontAlterKey?: boolean): Promise<T> {
	//	return new Promise<any>((resolve) => {
	//		resolve();
	//	});
	//}

	//async getSessionItem<T>(key: string, dontAlterKey?: boolean): Promise<T> {
	//	return new Promise<any>((resolve) => {
	//		resolve();
	//	});
	//}

	//async removePermanentItem(key: string, dontAlterKey?: boolean): Promise<boolean> {
	//	return new Promise<any>((resolve) => {
	//		resolve(true);
	//	});
	//}

	//async removeSessionItem(key: string, dontAlterKey?: boolean): Promise<boolean> {
	//	return new Promise<any>((resolve) => {
	//		resolve(true);
	//	});
	//}

	//async removeAllPermanentItems(): Promise<boolean> {
	//	return new Promise<any>((resolve) => {
	//		resolve(true);
	//	});
	//}

	//async removeAllSessionItems(): Promise<boolean> {
	//	return new Promise<any>((resolve) => {
	//		resolve(true);
	//	});
	//}
}