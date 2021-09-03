import { Component, ViewContainerRef, ViewChild } from '@angular/core';
import { NavParams } from '@ionic/angular';

import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
//import {
//	MaterialActionAlertMessageType
//} from '../../models/index';

@Component({
	selector: 'material-action-alert',
	templateUrl: 'material-action-alert.component.html',
})
export class MaterialActionAlertComponent {
	constructor(
		private domSanitizer: DomSanitizer,
		// public viewCtrl: ViewController,
		public navParams: NavParams,

	) { }

	// for inserting dynamic component to dialog
	@ViewChild('viewContainerRef', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;

	// for inserting dynamic html to dialog
	htmlContent: SafeHtml;

	ngOnInit() {
		let message = this.navParams.get('message');
		this.htmlContent = this.domSanitizer.bypassSecurityTrustHtml(message);
	}

	yes(): void {
		// this.viewCtrl.dismiss(true);
	}

	no(): void {
		// this.viewCtrl.dismiss(false);
	}
}