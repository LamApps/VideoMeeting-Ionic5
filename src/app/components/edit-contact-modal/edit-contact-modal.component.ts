import { Component, OnInit } from '@angular/core';
import {
	NavParams,
} from '@ionic/angular';

import { PhoneContactType } from '../../models/index'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { EmailValidator } from '../../validators/index'
import {
	Service,
} from '../../services/index'

@Component({
  selector: 'app-edit-contact-modal',
  templateUrl: './edit-contact-modal.component.html',
  styleUrls: ['./edit-contact-modal.component.scss'],
})
export class EditContactModalComponent implements OnInit {
	editContactForm: FormGroup;
	editContactLoading: boolean = false;

	// phoneContact: PhoneContactType;
	phoneContact: any;
	avatar: string;
	newBase64Image: string;

	constructor(
		private navParams: NavParams,
		//private configService: ConfigService,
		private formBuilder: FormBuilder,
		//private contactService: ContactService,
		//private jsHelperService: JsHelperService,
		// private viewCtrl: ViewController,
		private service: Service,
	) {
		this.phoneContact = this.navParams.data;
		this.avatar = !this.service.isEmpty(this.phoneContact.avatarFileName) ?
		this.service.contactAvatarBaseUrl + this.phoneContact.avatarFileName : null;

		this.setupContactForm();
	}

	ngOnInit() {}
	setupContactForm() {
		this.editContactForm = this.formBuilder.group({
			name: [this.phoneContact.name, Validators.compose([Validators.required])],
			email: [this.phoneContact.email, Validators.compose([EmailValidator.isValidEmailFormat])],
		})
	}

	onAvatarChanged(base64Image: string) {
		this.newBase64Image = base64Image;
	}

	saveChanges() {
		this.editContactLoading = true;
		this.phoneContact.name = this.editContactForm.get('name').value;
		this.phoneContact.email = this.editContactForm.get('email').value;
		if (!this.service.isEmpty(this.newBase64Image)) {
			this.phoneContact.avatarDataUri = this.newBase64Image
		}

		//let jwtToken = this.signalrService.jwtToken;
		this.service.getAccessToken()
			.then((accessToken: string) => {
				this.service.updateContact(this.phoneContact, accessToken)
					.then((data: PhoneContactType) => {
						this.editContactLoading = false;
						// this.viewCtrl.dismiss(data)
					})
					.catch(() => {
						this.editContactLoading = false;
						// this.viewCtrl.dismiss()
					})
			})
		//if (!this.jsHelperService.isEmpty(jwtToken)) {
		//}
		//else {
		//  this.navCtrl.setRoot(LoginPage, { errorMessage: "Missing authorization. Please log back in to regain authorization." });
		//}
    }

    cancel() {
        // this.viewCtrl.dismiss();
    }
}
