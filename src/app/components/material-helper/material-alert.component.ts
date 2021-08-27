import { Component, } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { NavParams } from '@ionic/angular';

//import {
//	MaterialAlertMessageType
//} from '../../models/index';

@Component({
	selector: 'material-alert',
	templateUrl: 'material-alert.component.html',
})
export class MaterialAlertComponent {
	constructor(
		private domSanitizer: DomSanitizer,
		// public viewCtrl: ViewController,
		public navParams: NavParams,
	) {
	}

	htmlContent: SafeHtml;

	ngOnInit() {
		let message = this.navParams.get('message');
		this.htmlContent = this.domSanitizer.bypassSecurityTrustHtml(message);
	}

	close(): void {
		//console.log("closing dialog");
		// this.viewCtrl.dismiss();
	}
}