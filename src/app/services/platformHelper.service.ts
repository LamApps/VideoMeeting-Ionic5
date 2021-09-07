import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({providedIn:'root'})
export class PlatformHelperService {
	constructor(
		private platform:Platform
	) {}	
	
	isIos():boolean{
		return this.platform.is("ios");
		
	}

	isWindows():boolean {
		return this.platform.is("desktop");
	}

	isAndroid():boolean {
		return this.platform.is("android");
	}

}