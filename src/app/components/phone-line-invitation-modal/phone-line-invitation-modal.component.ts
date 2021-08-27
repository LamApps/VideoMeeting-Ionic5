import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import {
	//PhoneService,
	//Service
} from '../../services/index'
@Component({
  selector: 'app-phone-line-invitation-modal',
  templateUrl: './phone-line-invitation-modal.component.html',
  styleUrls: ['./phone-line-invitation-modal.component.scss'],
})
export class PhoneLineInvitationModalComponent implements OnInit {

	email: string;
	image: string;
	constructor(
		private navParams: NavParams,
		// private viewCtrl: ViewController,
		//private phoneService: PhoneService,
		//private service: Service,
	) {
		this.email = this.navParams.data.email;
		this.image = this.navParams.data.image;
	}

	ngOnInit() {}
	//timerRef: number;

	ionViewDidEnter() {
		// fires each time loaded
		//this.timerRef = window.setTimeout(() => {
		//	//this.stopCalling();
		//	this.viewCtrl.dismiss();
		//}, 60000) //30 seconds
	}

	stopCalling() {
		// this.viewCtrl.dismiss(this.email);

		//this.service.cancelCall(this.email)
		//	.catch(error => {
		//		console.log('phone-line-invitation-modal.ts -> stopCalling()', )
		//	})
		//	.then(() => {
		//		window.clearTimeout(this.timerRef);
		//		this.viewCtrl.dismiss();
		//	})
	}


}
