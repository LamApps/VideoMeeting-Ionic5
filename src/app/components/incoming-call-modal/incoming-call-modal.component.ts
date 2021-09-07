import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CallType, IncomingCallResponseEnum } from "../../models/index";

@Component({
  selector: 'app-incoming-call-modal',
  templateUrl: './incoming-call-modal.component.html',
  styleUrls: ['./incoming-call-modal.component.scss'],
})
export class IncomingCallModalComponent implements OnInit {
	@Input() value:any;
	constructor(
		private viewCtrl: ModalController
	) {

		console.log("incoming-call-modal.ts constructor got navParams call:", this.call);
	}
	ngOnInit() {
		this.call = this.value;
	}
	call: CallType;

	ionViewDidLoad() {
		console.log('ionViewDidLoad');
	}

	accept(): void {
		this.viewCtrl.dismiss(IncomingCallResponseEnum.accept);
	}

	deny(): void {
		this.viewCtrl.dismiss(IncomingCallResponseEnum.deny);
	}

	block(): void {
		this.viewCtrl.dismiss(IncomingCallResponseEnum.block);
	}
}
