import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
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
	@Input () value : any;
	email: string;
	image: string;
	constructor(
		private viewCtrl: ModalController,
		//private phoneService: PhoneService,
		//private service: Service,
	) {
	}

	ngOnInit() {
		this.email = this.value;
		// this.image = this.navParams.data.image;
	}
	//timerRef: number;

	ionViewDidEnter() {
		// fires each time loaded
		//this.timerRef = window.setTimeout(() => {
		//	//this.stopCalling();
		//	this.viewCtrl.dismiss();
		//}, 60000) //30 seconds
	}

	stopCalling() {
		this.viewCtrl.dismiss(this.email);

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
