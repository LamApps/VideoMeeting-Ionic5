import { Injectable } from '@angular/core';
// import 'rxjs/add/operator/map';
//import { login } from '../models/login';
//import { RegisterDto } from '../models/register.dto';

import { JwtToken } from '../models/jwtToken'

import {
	LocalStorageService,
	SignalrService,
	JsHelperService,
	//HttpService,
	ConfigService
} from './index'

@Injectable()
export class AuthService {
	private _isMember: boolean = false;

	get isMember() {
		return this._isMember;
	}

	constructor(
		private jsHelperService: JsHelperService,
		private signalrService: SignalrService,
		//private httpService: HttpService,
		private localStorageService: LocalStorageService,
		private configService: ConfigService
	) {
		console.log('Hello auth Provider');
	}

	logIn(email: string, password: string, rememberMe: boolean): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let tempJwtToken: JwtToken;
			this.signalrService.setEmail(email)
				.then(() => {
					return this.signalrService.requestMemberToken(email, password);
				})
				.then((jwtToken: JwtToken) => {
					tempJwtToken = jwtToken;
					return this.signalrService.setAccessToken(jwtToken);
				})
				.then(() => {
					return this.localStorageService.setItem('rememberMe', rememberMe);
				})
				.then(() => {
					console.log('remember saved')
					return this.localStorageService.setItem(this.configService.memberTokenFilename, tempJwtToken);
				})
				.then(() => {
					this._isMember = true;
					resolve();
				})
				.catch((error) => {
					console.log('remember not saved')
					reject(error)
				});
		});
	}

	LogOut(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.signalrService.webrtcHubCheckOut()
				.catch(error => {
					console.log("error logging out", error)
					reject(error);
				})
				.then(() => {
					this.localStorageService.removeAllItems();
					this._isMember = false;
					resolve();
				})
		})
	}

	isLoggedin(): Promise<boolean> {
		//Get logged in status from Local Storage
		return new Promise<boolean>((resolve, reject) => {
			this.localStorageService.getItem(this.configService.memberTokenFilename)
				.then((jwtToken: JwtToken) => {
					//if token is empty then its loggout
					//let loggedIn: boolean = (!this.jsHelperService.isEmpty(jwtToken) && !this.signalrService.isExpiredToken(jwtToken));
					let notEmpty = !this.jsHelperService.isEmpty(jwtToken);
					let notExpired = !this.signalrService.isExpiredToken(jwtToken);
					let loggedIn = (notEmpty && notExpired)
					if (loggedIn) {
						if (this.signalrService.setAccessToken(jwtToken)) {
							this._isMember = true;
						}
					}
					resolve(loggedIn);

					console.log(`not empty: ${notEmpty}, not expired: ${notExpired} `, jwtToken)
				})
				.catch(error => {
					console.log(error)
					if (error.code === 2 || error.code === 3)
						resolve(false)
					else
						reject(error)
				})
		});
	}

	isRemembered(): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.localStorageService.getItem('rememberMe')
				.then((isRemembered) => {
					resolve(isRemembered);
				})
				.catch(error => {
					reject(error)
				})
		})
	}

    async isMemberSessionExpired(): Promise<boolean> {
        try {
            let jwtToken: JwtToken = await this.signalrService.getJwtToken();
            return this.signalrService.isExpiredToken(jwtToken)
        }
        catch (e) {
            console.log("auth.service.ts isMemberSessionExpired ERROR possible false positive, error: ", e);
            return true;
        }
       
	}

    async refreshSession(): Promise<void> {
        try {
            let jwtToken: JwtToken = await this.signalrService.getJwtToken();
            let updatedJwtToken: JwtToken = await this.signalrService.renewToken(jwtToken);
            let result: boolean = await this.localStorageService.setItem(this.configService.memberTokenFilename, updatedJwtToken);
            if (result === true) {
                return;
            }
            else {
                throw ("Unable to refresh session");
            }
        }
        catch (e) {
            throw (e);
        }
		//return new Promise<void>((resolve, reject) => {
		//	this.signalrService.renewToken(this.signalrService.jwtToken)
		//		.then((jwtToken: JwtToken) => {
		//			this.localStorageService.setItem(this.configService.memberTokenFilename, jwtToken)
		//				.then(() => {
		//					resolve()
		//				})
		//				.catch((error) => {
		//					reject(error)
		//				})
		//		})
		//		.catch(error => {
		//			console.log(error)
		//		})
		//})
	}
}
