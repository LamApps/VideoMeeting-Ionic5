import { Injectable } from '@angular/core';
import { GuiHelperService } from './guiHelper.service';
//import { Network } from 'ionic-native';
import { Network } from '@ionic-native/network/ngx';
@Injectable({providedIn:'root'})
export class ConnectivityService {
	public isConnected: boolean;
	constructor(
		public guiHelper: GuiHelperService,
		private network: Network
	) { }

	public setOnline(_isConnected: boolean) {
		this.isConnected = _isConnected;
	}

	public determineConnectivity() {
		//we dont want to them they have internet the first time they open the app,
		//just detect if connection is there
		if (this.network.type === 'Connection.NONE') {
			this.goOfflineSilent()
		}
		else {
			this.goOnlineSilent();
		}

		console.log(this.network.type)
	}

	public subscribeToConnectivity() {
		//subscribe to internet disconnection/connection
		this.network.onDisconnect().subscribe(() => {
			this.goOffline();
		});

		//let connectSub = this.network.onConnect().subscribe(() => {
		//	this.goOnline()
		//});
	}

	private goOffline() {
		this.goOfflineSilent()
		this.presentOfflineToast();
	}

	private goOfflineSilent() {
		console.log('you are offline');
		this.isConnected = false;
	}

	//private goOnline() {
	//	this.goOnlineSilent();
	//	this.presentOnlineToast();
	//}

	private goOnlineSilent() {
		console.log('you are online sir');
		this.isConnected = true;
	}

	private presentOfflineToast() {
		this.guiHelper.showToast('service unavailable, please check your connection', false)
	}
}