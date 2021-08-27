import { Component, OnInit } from '@angular/core';
import {
	CallType,
	ObservableMessageType,
	IncomingCallResponseEnum,
    MaterialAlertMessageType,
} from '../../models/index';
import { Service } from '../../services/index';
import { Subject } from "rxjs";
import { filter, distinctUntilKeyChanged } from 'rxjs/operators';
import { IncomingCallModalComponent } from "../../components/index";
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-phone-ringer',
  templateUrl: './phone-ringer.component.html',
  styleUrls: ['./phone-ringer.component.scss'],
})
export class PhoneRingerComponent implements OnInit {
    private receiveRemoteLogoutSubject = new Subject<any>();
    private receivePhoneLineInvitationSubject = new Subject<any>();

	constructor(
		private modalCtrl: ModalController,
		private alertCtrl: AlertController,
		private service: Service,
	) {
        this.hasIncoming = false;
        this.debugId = Date.now().toString();
	}
	
	ngOnInit() {}

    debugId: string;

	currentAlert: HTMLIonAlertElement;

	incomingCallModal: HTMLIonModalElement;
	hasIncoming: boolean;

	// receivePhoneLineInvitation: Subscription;
	// receiveCancelInvitation: Subscription;
	// receiveRemoteLogout: Subscription;

	// NOTE: this must be activated by the parent component
	// example in parent use @ViewChild to get reference to component
	// then use the reference to call references' public methods
	// call during ionViewDidEnter
	getSubjects(subjectType:string) {
		switch(subjectType){
			case 'receiveRemoteLogout':
				return this.receiveRemoteLogoutSubject;
			case 'receivePhoneLineInvitation':
				return this.receivePhoneLineInvitationSubject;
			default:
				return null;
		}
	}

	startListeners(): void {
		//this.endListeners();

		//console.log("phone.ts listeners started");

		this.service.receivePhoneLineInvitation.asObservable()
			.pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
			.pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
			.subscribe((message: ObservableMessageType) => {
				//console.log("phone.ts receivePhoneLineInvitation:", message);
				let json = message.message;
				if (this.service.isEmpty(json) === false) {
					let call: CallType = this.service.jsonToObject<CallType>(json, true);

					//console.log("call: ", call);
					//console.log("hasIncoming: ", this.hasIncoming);

					if (this.service.isEmpty(call) === false) {
						if (this.hasIncoming === false) {
							this.service.isMember()
								.then((isMember: boolean) => {
									return this.service.initCall(isMember, call);
								})
								.then((allowCall: boolean) => {
									//console.log("allowCall: ", allowCall);
									if (this.service.isEmpty(allowCall) === false) {
										this.displayIncomingCall(call);
									}
									else {
										this.hasIncoming = false;
										this.service.sendNotAcceptCall(call.remoteGuid);
									}
								})
								.catch((remoteGuid: string) => {
									console.log("received call from " + remoteGuid + " but rejected it");
								});
						}
						else {
							this.service.sendBusyResponse(call.remoteGuid);
						}
					}
					else {
						// received a call that is missing an email, we can not identify the caller, so ignore this call, and let it timeout
						// on the other end
						console.log("received call with missing json: ", json);
					}
				}
			});

		this.service.receiveCancelInvitation.asObservable()
			.pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
			.pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
			.subscribe((message: ObservableMessageType) => {
				//console.log("phone.ts receivePhoneLineInvitation message: ", message);
				//console.trace();
				let remoteGuid = message.message;
				if (this.service.isEmpty(remoteGuid) === false) {
					//this.signalrService.receiveCancelInvitationCurrent = message;
					//console.log("phone.ts -> receivedNotAcceptCall remoteGuid:", remoteGuid);
					// TODO: the other user cancelled the call. handle this event.

					this.incomingCallModal && this.incomingCallModal.dismiss();
					this.alertCtrl.create({
						header: 'Call Ended',
						message: 'The other user has cancelled the call.',
						buttons: ['OK']
					}).then((altRes)=>{
						this.currentAlert = altRes;
						altRes.present();
					});
				}
			});

		this.service.receiveRemoteLogout.asObservable()
			.pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
			.pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
			.subscribe((message: ObservableMessageType) => {
				console.log("receiveRemoteLogout: ", message);
				let connectionId = message.message;
				if (!this.service.isEmpty(connectionId)) {
					// NOTE: check the connectionId from the signalr server with the current users signalr connetionId to make sure they
					// match before, logging the app out.
					// NOTE: This is a system message
					if (this.service.isEmpty(connectionId) === false && connectionId === this.service.webRtcHub.connection.id) {
                        // notify the parent of remotelogout so the parent component that handle it and use navCtrl
                        //let alert = new MaterialAlertMessageType();
                        //alert.title = "Debugging";
                        //alert.message = "phone-ringer.component.ts receiveRemoteLogout: " + this.debugId;
                        //this.service.openAlert(alert);
						this.receiveRemoteLogoutSubject.next(connectionId);
                        // this.events.publish('phoneRinger:receiveRemoteLogout', connectionId);
					}
				}
			});
	}

	// NOTE: this must be activated by the parent component
	// example in parent use @ViewChild to get reference to component
	// then use the reference to call references' public methods
	// call endlistener in parents ionViewWillLeave

	endListeners(): void {
		//console.log("phone.ts listeners ended");

		this.receiveRemoteLogoutSubject && this.receiveRemoteLogoutSubject.unsubscribe();

		this.receivePhoneLineInvitationSubject && this.receivePhoneLineInvitationSubject.unsubscribe();
	}

	async displayIncomingCall(call: CallType): Promise<void> {
		var audio = new Audio();
		audio.src = "assets/ringtone.mp3";
		audio.load();
		audio.play();
		// NOTE: you can display the datauri or the filename from call.profile
		// to display file <img src=""> src is configService.avatarBaseUrl + call.profile.filename

		// NOTE: you should modify this gui so it displays the caller and let the user also view who else is in the call
		// the call object will contain the caller information, plus an array of CallerType
		console.log("phone.ts -> displayIncomingCall() -> displaying incoming calls", call);
		this.hasIncoming = true;
		this.incomingCallModal = await this.modalCtrl.create({
			component: IncomingCallModalComponent,
			componentProps:{
				call: call
			}
		});
		await this.incomingCallModal.present();
		const { data } = await this.incomingCallModal.onDidDismiss();
		if (data === IncomingCallResponseEnum.accept) {
			this.hasIncoming = false;
			//this.service.acceptedCall = call;
			// now to to the phone
			//this.navCtrl.setRoot(Phone);
			//this.service.acceptPhoneLineInvitation(call.phoneLineGuid, call.remoteGuid);
			// notify the parent component that we've accepted a phone call
			// the parent component will set this.service.acceptedCall = call
			// this.events.publish('phoneRinger:receivePhoneLineInvitation:accepted', call);
			this.receivePhoneLineInvitationSubject.next(call);
		}
		else if (data === IncomingCallResponseEnum.deny) {
			this.hasIncoming = false;

			this.service.sendNotAcceptCall(call.remoteGuid);
		}
		else if (data === IncomingCallResponseEnum.block) {
			this.hasIncoming = false;
			this.service.sendNotAcceptCall(call.remoteGuid);
			//let jwtToken = this.signalrService.jwtToken;
			this.service.getAccessToken()
				.then((accessToken: string) => {
					this.service.blockEmail(call.profile.email, accessToken);
				})
		}
		else {
			this.hasIncoming = false;
			this.service.sendNotAcceptCall(call.remoteGuid);
		}

		audio.pause();
		audio.currentTime = 0;
		setTimeout(() => {
			this.hasIncoming = false;

			this.incomingCallModal.dismiss();
		}, 59000)//has 30 seconds to respond
	}

}
