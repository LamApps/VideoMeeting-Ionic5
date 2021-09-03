import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavParams, AlertController } from '@ionic/angular';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

import {
	FormBuilder,
	FormGroup,
	FormControl,
	Validators,
} from '@angular/forms';

import {
	FormItemType,
} from "../../models/index";

import { Service } from "../../services/index";

import { optionalEmail } from "../../validators/optionalEmail.validator";

@Component({
  selector: 'app-form-get-info',
  templateUrl: './form-get-info.component.html',
  styleUrls: ['./form-get-info.component.scss'],
})
export class FormGetInfoComponent implements OnInit {

	constructor(
		//private ngZone: NgZone,
		private domSanitizer: DomSanitizer,
		private service: Service,
		private fb: FormBuilder,
		// public viewCtrl: ViewController,
		public navParams: NavParams,
		private alertCtrl: AlertController,

	) {
		this.showProgress = false;
	}

	@Input('showProgress') showProgress: boolean;
	@Input('title') title: string;
	@Input('instructions') instructions: SafeHtml;
	@Input('formItems') formItems: Array<FormItemType>;
	@Output() onSubmit: EventEmitter<Array<FormItemType>> = new EventEmitter<Array<FormItemType>>();

	ngOnInit() {
		let instructions = this.navParams.get('instructions');
		this.instructions = this.domSanitizer.bypassSecurityTrustHtml(instructions);
		this.showProgress = this.navParams.get('showProgress');
		this.title = this.navParams.get('title');
		this.formItems = this.navParams.get('formItems');
		this.createForm();
	}

	formGroup: FormGroup

	createForm() {
		if (this.service.isEmpty(this.formItems) === false) {
			let controls = {};

			this.formItems.forEach((f) => {
				let options = new Array();
				if (this.service.isEmpty(f.required) === false) {
					options.push(Validators.required);
				}
				if (this.service.isEmpty(f.isEmail) === false) {
					options.push(optionalEmail);
				}
				if (this.service.isEmpty(f.maxLength) === false) {
					options.push(Validators.maxLength(f.maxLength));
				}
				if (this.service.isEmpty(f.minLength) === false) {
					options.push(Validators.minLength(f.minLength));
				}

				let control = new FormControl("", options)
				controls[f.key] = control;
			});

			this.formGroup = this.fb.group(controls);
		}
	}

	async submit(): Promise<void> {
		//this.showProgress = true;
		if (this.formGroup.valid) {
			//this.model.companyName = this.formGroup.get('companyName').value;
			this.formItems.forEach((f) => {
				if (this.service.isEmpty(this.formGroup.get(f.key)) === false) {
					f.value = this.formGroup.get(f.key).value;
				}
			});
			//this.onSubmit.emit(this.formItems);
			// this.viewCtrl.dismiss(this.formItems);
		}
		else {
			const alert = await this.alertCtrl.create({
				header: "Please Check",
				message: "Please make sure the form is filled out and any error messages are fixed.",
				buttons: ["OK"]
			})
			await alert.present();
		}
	}

	cancel(): void {
		// this.viewCtrl.dismiss();
	}
}
