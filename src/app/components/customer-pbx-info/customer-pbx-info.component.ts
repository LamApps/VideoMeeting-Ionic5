import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

import { GenericUserType } from "../../models/index";

@Component({
  selector: 'app-customer-pbx-info',
  templateUrl: './customer-pbx-info.component.html',
  styleUrls: ['./customer-pbx-info.component.scss'],
})
export class CustomerPbxInfoComponent implements OnInit {

  constructor(
	// public viewCtrl: ViewController,
	public navParams: NavParams,
  ) { }

	companyProfile: GenericUserType;
	employee: GenericUserType;

	ngOnInit() {
		this.companyProfile = this.navParams.get('companyProfile');
		this.employee = this.navParams.get("employee");
	}

	close(): void {
		// this.viewCtrl.dismiss();
	}
}
