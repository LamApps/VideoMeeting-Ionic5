import { Injectable } from '@angular/core';

import {
	LocalStorageService,
	JsHelperService,
	ConfigService
} from './index';

import {
	SettingsType
} from '../models/index';

@Injectable({providedIn:'root'})
export class SettingsService {
	constructor(
		private localStorageService: LocalStorageService,
		private jsHelperService: JsHelperService,
		private configService: ConfigService
	) {
		// get settings from localStorage and set properties
		this.localStorageService.getItem(this.configService.settingsFile)
			.then((settings: SettingsType) => {
				if (this.jsHelperService.isEmpty(settings) === false) {
					if (this.jsHelperService.isEmpty(settings.activeAudioDeviceId) === false) {
						this.activeAudioDeviceId = settings.activeAudioDeviceId;
					}

					if (this.jsHelperService.isEmpty(settings.activeVideoDeviceId) === false) {
						this.activeVideoDeviceId = settings.activeVideoDeviceId;
					}
				}
			})
			.catch((error) => {
				console.log("SettingsService localStorageService.getItem error: ", error);
			});
	}

	_activeVideoDeviceId: string;
	get activeVideoDeviceId(): string {
		return this._activeVideoDeviceId;
	}
	set activeVideoDeviceId(value: string) {
		this._activeVideoDeviceId = value;
	}

	_activeAudioDeviceId: string;
	get activeAudioDeviceId(): string {
		return this._activeAudioDeviceId;
	}
	set activeAudioDeviceId(value: string) {
		this._activeAudioDeviceId = value;
	}
}