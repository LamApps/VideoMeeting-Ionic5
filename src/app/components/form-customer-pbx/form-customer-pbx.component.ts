import { Component, OnInit } from '@angular/core';
import { NavParams, AlertController } from '@ionic/angular';

import {
	FormBuilder,

	FormGroup,
	FormControl,
	Validators,
} from '@angular/forms';

import {
	PbxCallQueueDto,
} from "../../models/index";

import { Service } from "../../services/index";

@Component({
  selector: 'app-form-customer-pbx',
  templateUrl: './form-customer-pbx.component.html',
  styleUrls: ['./form-customer-pbx.component.scss'],
})
export class FormCustomerPbxComponent implements OnInit {

  constructor(
	private service: Service,

	private fb: FormBuilder,
	// public viewCtrl: ViewController,
	public navParams: NavParams,
	private alertCtrl: AlertController,
	) { }

	customerProfile: PbxCallQueueDto;

	//@Output() onSubmit: EventEmitter<Array<FormItemType>> = new EventEmitter<Array<FormItemType>>();

	ngOnInit() {
		this.customerProfile = this.navParams.get('customerProfile');

		this.createForm();
	}

	formGroup: FormGroup

	createForm() {
		this.formGroup = this.fb.group({
			name: new FormControl(
				this.service.isEmpty(this.customerProfile) === false ? this.customerProfile.name : ""
				, [
					Validators.maxLength(100)

				]),
			subject: new FormControl(
				this.service.isEmpty(this.customerProfile) === false ? this.customerProfile.subject : ""
				, [
					Validators.maxLength(300)

				]),
			message: new FormControl(
				this.service.isEmpty(this.customerProfile) === false ? this.customerProfile.message : ""
				, [
					Validators.maxLength(1000)

				])
		})
	}

	async submit(): Promise<void> {
		if (this.formGroup.valid) {
			this.customerProfile.name = this.formGroup.get('name').value;
			this.customerProfile.subject = this.formGroup.get('subject').value;
			this.customerProfile.message = this.formGroup.get('message').value;

			// this.viewCtrl.dismiss(this.customerProfile);
		}
		else {
			const alert = await this.alertCtrl.create({
				header: "Please Check",
				message: "Please make sure the form is filled out and any error messages are fixed.",
				buttons: ["OK"]
			});
			await alert.present();
		}
	}

	cancel(): void {
		// this.viewCtrl.dismiss();
	}
}
