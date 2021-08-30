import { Component, OnInit, ViewChild } from '@angular/core';
import {Router} from '@angular/router';
import {
	NavController,
} from '@ionic/angular';
import { Subscription } from "rxjs";
import {
	//UserService,
	//JsHelperService,
	//SignalrService,
	//PhoneService,
	//BlockCallService,
	Service,
} from '../../services/index';

import {
	BlockedEmailType,
	CallType,
	//IncomingCallResponseEnum,
	//ObservableMessageType
} from '../../models/index';
import {
	//IncomingCallModal,
	PhoneRingerComponent
} from '../../components/index';
@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.page.html',
  styleUrls: ['./block-list.page.scss'],
})
export class BlockListPage implements OnInit {

	blockedEmails: BlockedEmailType[];
	constructor(
		public navCtrl: NavController,
    private router: Router,
		//private blockCallService: BlockCallService,
		//private jsHelperService: JsHelperService,
		//private modalCtrl: ModalController,
		//private signalrService: SignalrService,
		//private phoneService: PhoneService,
		//private userService: UserService,
		private service: Service,
	) {
		this.hasIncoming = false;
	}

	@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;
  ngOnInit() {
  }
	receivePhoneLineInvitation: Subscription;
	receiveRemoteLogout: Subscription;

    ionViewWillEnter() {
        // fires each time user enters page but before the page actually becomes the active page
        // use ionViewDidEnter to run code when the page actually becomes the active page
        if (this.service.isSignalrConnected() === false) {
            this.service.startConnection();
        }
    }

	

	ionViewDidEnter() {
		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.startListeners();
      this.receivePhoneLineInvitation = this.phoneRinger.getSubjects('receivePhoneLineInvitation').subscribe((call: CallType) => {
        if (this.service.isEmpty(call) === false) {
          this.service.acceptedCall = call;
          // this.navCtrl.setRoot(Phone);
          this.router.navigate(['phone']);
        }
      });
  
      this.phoneRinger.getSubjects('receiveRemoteLogout').subscribe((connectionId: string) => {
        this.service.doLogout()
          .catch((error) => {
            console.log("app-shell.ts logOut error:", error);
          })
          .then(() => {
            // this.navCtrl.setRoot(LoginPage);
            this.router.navigate(['login']);
          })
        });
		}


    this.startListeners();
	}

	ionViewWillLeave() {
		//console.log("account.ts ionViewWillLeave");

		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.endListeners();
		}

		this.receivePhoneLineInvitation.unsubscribe();
		this.receivePhoneLineInvitation.unsubscribe();
		this.endListeners();
	}

	hasIncoming: boolean;

	startListeners(): void {
		this.endListeners();
		//console.log("block-list.ts listeners started");
		//this.receivePhoneLineInvitation = this.signalrService.receivePhoneLineInvitation.subscribe((message: ObservableMessageType) => {
		//	if (message.timestamp > this.signalrService.receivePhoneLineInvitationCurrent.timestamp && this.jsHelperService.isEmpty(message.message) === false) {
		//		let json = message.message;
		//		if (this.jsHelperService.isEmpty(json) === false) {
		//			this.signalrService.receivePhoneLineInvitationCurrent = message;
		//			//console.log("phone.ts receivePhoneLineInvitation json:", json);
		//			let call: CallType = this.jsHelperService.jsonToObject<CallType>(json, true);
		//			//console.log("block-list.ts receivePhoneLineInvitation call:", call);
		//			if (this.jsHelperService.isEmpty(call) === false) {
		//				if (this.hasIncoming === false) {
		//					this.phoneService.initCall(this.userService.isMember, call)
		//						.then((call: CallType) => {
		//							this.displayIncomingCall(call);
		//						})
		//						.catch((remoteGuid: string) => {
		//							console.log("received call from " + remoteGuid + " but rejected it");
		//						});
		//				}
		//				else {
		//					this.signalrService.sendBusyResponse(call.remoteGuid);
		//				}
		//			}
		//			else {
		//				// received a call that is missing an email, we can not identify the caller, so ignore this call, and let it timeout
		//				// on the other end
		//				console.log("received call with missing json: ", json);
		//			}
		//		}
		//	}
		//});

		//this.receiveRemoteLogout = this.signalrService.receiveRemoteLogout.subscribe((message: ObservableMessageType) => {
		//	if (message.timestamp > this.signalrService.receiveRemoteLogoutCurrent.timestamp && this.jsHelperService.isEmpty(message.message) === false) {
		//		let connectionId = message.message;
		//		if (this.jsHelperService.isEmpty(connectionId) === false) {
		//			this.signalrService.receiveRemoteLogoutCurrent = message;
		//			// NOTE: check the connectionId from the signalr server with the current users signalr connetionId to make sure they
		//			// match before, logging the app out.
		//			// NOTE: This is a system message
		//			if (this.jsHelperService.isEmpty(connectionId) === false && connectionId === this.signalrService.webRtcHub.connection.id) {
		//				// TODO: do your app logout routine here.
		//				this.logOut();
		//			}
		//		}
		//	}
		//});
	}

	endListeners(): void {
		//console.log("block-list.ts listeners ended");
		//this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
		//this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
	}

	//displayIncomingCall(call: CallType): void {
	//	// NOTE: you can display the datauri or the filename from call.profile
	//	// to display file <img src=""> src is configService.avatarBaseUrl + call.profile.filename

	//	// NOTE: you should modify this gui so it displays the caller and let the user also view who else is in the call
	//	// the call object will contain the caller information, plus an array of CallerType
	//	console.log("phone.ts -> displayIncomingCall() -> displaying incoming calls", call);
	//	this.hasIncoming = true;
	//	let modal = this.modalCtrl.create(IncomingCallModal, { call: call });
	//	modal.onDidDismiss((data) => {
	//		if (data === IncomingCallResponseEnum.accept) {
	//			this.phoneService.sendAcceptPhoneLineInvitation(call.phoneLineGuid, call.remoteGuid);
	//			this.hasIncoming = false;
	//			this.navCtrl.push(Phone);
	//		}
	//		else if (data === IncomingCallResponseEnum.deny) {
	//			this.hasIncoming = false;
	//			this.phoneService.sendNotAcceptCall(call.remoteGuid);
	//		}
	//		else if (data === IncomingCallResponseEnum.block) {
	//			this.hasIncoming = false;
	//			this.phoneService.sendNotAcceptCall(call.remoteGuid);

	//			//let jwtToken = this.signalrService.jwtToken;
	//			this.service.getAccessToken()
	//				.then((accessToken: string) => {
	//					this.blockCallService.blockEmail(call.profile.email, accessToken);
	//				})
	//		}
	//		else {
	//			this.hasIncoming = false;
	//			this.phoneService.sendNotAcceptCall(call.remoteGuid);
	//		}
	//	});
	//	modal.present();
	//	setTimeout(() => {
	//		this.hasIncoming = false;
	//		modal.dismiss();
	//	}, 30000)//has 30 seconds to respond
	//}

	logOut() {
		this.service.doLogout()
			.catch((error) => {
				console.log("app-shell.ts logOut error:", error);
			})
			.then(() => {
				// this.navCtrl.setRoot(LoginPage);
        this.router.navigate(['login']);
			})
	}

	unblock(blockedEmail: BlockedEmailType) {
		//let jwtToken = this.signalrService.jwtToken;
		this.service.getAccessToken()
			.then((accessToken: string) => {
				return this.service.unblockEmail(blockedEmail.blockedEmailId, accessToken);
			})
			.then(() => {
				//console.log('emailblocked')
				this.updateAllBlockEmails()
			})
			.catch((e) => {
				console.log('error while block email', e)
			})
	}

	updateAllBlockEmails() {
		//let jwtToken = this.signalrService.jwtToken;
		this.service.getAccessToken()
			.then((accessToken: string) => {
				return this.service.getAllBlockedEmails(accessToken);
			})
			.then((blockedEmails: BlockedEmailType[]) => {
				this.blockedEmails = blockedEmails
				//console.log(blockedEmails, 'from block list')
			})
			.catch(error => {
				console.log("something went wrong from block0list", error)
			})
	}
}
