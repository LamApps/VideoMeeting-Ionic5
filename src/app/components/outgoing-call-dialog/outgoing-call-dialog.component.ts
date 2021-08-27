import { Component, OnInit, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import {
	MemberType,
	MaterialAlertMessageType,
} from '../../models/index';
import { Service } from '../../services/index';

@Component({
  selector: 'app-outgoing-call-dialog',
  templateUrl: './outgoing-call-dialog.component.html',
  styleUrls: ['./outgoing-call-dialog.component.scss'],
})
export class OutgoingCallDialogComponent implements OnInit {

	constructor(
		public service: Service,
		// public viewCtrl: ViewController,
		public navParams: NavParams,

	) {
		this.timer = 60;
	}

	@Input('member') inputMember: MemberType;
	@Input('timer') timer: number; // in seconds
	timerRef: number;

	email: string;
	name: string;
	imgSrc: string;
	_member: MemberType;
	get member(): MemberType {
		return this._member;
	}

	set member(value: MemberType) {
		this._member = value;
		if (this.service.isEmpty(value) === false) {
			this.email = value.email;
			this.name = value.firstName + " " + value.lastName;
			this.imgSrc = this.service.isEmpty(value.avatarFileName) ? this.service.defaultAvatar
				: this.service.avatarBaseUrl + value.avatarFileName;
		}
	}

	ngOnInit() {
		let member = this.navParams.get('member');
		let timer = this.navParams.get('duration');
		if (this.service.isEmpty(member) === false) {
			this.member = member;
		}
		else {
			this.member = this.inputMember;
		}

		if (this.service.isEmpty(timer) === false) {
			this.timer = timer;
		}

		if (this.service.isEmpty(this.member)) {
			// no member to call
			let alert = new MaterialAlertMessageType();
			alert.title = "Error";
			alert.message = "Unable to make call, member information missing";
			setTimeout(() => {
				this.service.openAlert(alert);
			});
			//this.dialogRef.close();
			// this.viewCtrl.dismiss();
		}
		else {
			this.timerRef = window.setInterval(() => this.countDown(), 1000);
		}
	}

	countDown(): void {
		this.timer--;
		if (this.timer < 1) {
			window.clearInterval(this.timerRef);
			this.timer = 60;
			//this.dialogRef.close();
			// this.viewCtrl.dismiss();
		}
	}

	async cancel(): Promise<void> {
		//this.dialogRef.close();

		// this.viewCtrl.dismiss();

		//let remoteGuid: string;
		//try {
		//	remoteGuid = await this.service.cancelCall(this.email);
		//}
		//catch (e) {
		//	// TODO: handle the error
		//	console.log("outgoing-call-dialog callCall error: ", e);
		//}
		//finally {
		//	this.dialogRef && this.dialogRef.close(remoteGuid);
		//}
	}
}
