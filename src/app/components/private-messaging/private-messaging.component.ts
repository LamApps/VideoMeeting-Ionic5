import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	FormControl,
	Validators,
} from '@angular/forms';

import { Service } from '../../services/index';
import {
	GenericUserType,
	MaterialAlertMessageType,
} from "../../models/index";
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-private-messaging',
  templateUrl: './private-messaging.component.html',
  styleUrls: ['./private-messaging.component.scss'],
})
export class PrivateMessagingComponent implements OnInit {

	constructor(
		private service: Service,
		private fb: FormBuilder,
		public viewCtrl: ModalController,

	) {
		this.showProgress = false;
		this.existingUsers = new Array<GenericUserType>();
		//this.users = new Array<GenericUserType>();
		this.createForm();
	}

	@Input('currentUser') currentUser: GenericUserType;
	@Input('users') users: Array<GenericUserType>;
	@Output() onSuccessPrivateMessage: EventEmitter<Array<GenericUserType>> = new EventEmitter<Array<GenericUserType>>();
	@Output() onFailedPrivateMessage: EventEmitter<Array<GenericUserType>> = new EventEmitter<Array<GenericUserType>>();
	@Output() onDone: EventEmitter<string> = new EventEmitter<string>();
	//users: Array<GenericUserType>;
	showProgress: boolean;
	existingUsers: Array<GenericUserType>;
	formGroup: FormGroup

	ngOnInit() {
		let currentUser = this.currentUser;
		let users = this.users;

		if (this.service.isEmpty(users) === false) {
			this.users = users;
		}

		if (this.service.isEmpty(currentUser) === false) {
			// if no users selected, then select the first user
			if (this.service.isEmpty(this.users) === false && this.service.isEmpty(this.existingUsers)) {
				this.existingUsers.push(this.users[0]);
			}
			else {
				// select the current user
				this.existingUsers.push(currentUser);
			}
		}
		else {
			if (this.service.isEmpty(this.currentUser) === false) {
				this.existingUsers.push(this.currentUser);
			}
		}
	}

	createForm() {
		this.formGroup = this.fb.group({
			message: new FormControl('', [
				Validators.maxLength(500),
				Validators.required

			]),
			selectedUsers: new FormControl()
		})
	}

	close(): void {
		this.viewCtrl.dismiss();
	}

	async submit(): Promise<void> {
		if (this.formGroup.valid) {
			let selectedUsers: Array<GenericUserType> = this.formGroup.get('selectedUsers').value;
			let message = this.formGroup.get('message').value;
			if (this.service.isEmpty(selectedUsers) === false) {
				this.showProgress = true;
				let successUsers: Array<GenericUserType> = new Array<GenericUserType>();
				let failedUsers: Array<GenericUserType> = new Array<GenericUserType>();

				for (let user of selectedUsers) {
					try {
						await this.service.sendPrivateSmsMessage(message, user.id);
						successUsers.push(user);
					}
					catch (e) {
						failedUsers.push(user)
					}
				}

				if (this.service.isEmpty(successUsers) === false) {
					this.onSuccessPrivateMessage.emit(successUsers);
				}

				if (this.service.isEmpty(failedUsers) === false) {
					this.onFailedPrivateMessage.emit(failedUsers);
				}

				this.showProgress = false;
				//this.onDone.emit(message);
				this.viewCtrl.dismiss(message);
			}
			else {
				let alert = new MaterialAlertMessageType();
				alert.title = "Please Check";
				alert.message = "No users selected to send a private message to.";
				this.service.openAlert(alert);
			}
		}
		else {
			let alert = new MaterialAlertMessageType();
			alert.title = "Please Check";
			alert.message = "Please make sure the form is filled out and any error messages are fixed."
			this.service.openAlert(alert);
		}
	}
}
