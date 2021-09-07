import { Component, OnInit, ViewChild } from '@angular/core';
import {
	Service
} from '../../services/index';
import { PhoneContactType } from '../../models/index';
import { IonSearchbar, ModalController, AlertController } from '@ionic/angular'

@Component({
  selector: 'app-contact-search-modal',
  templateUrl: './contact-search-modal.component.html',
  styleUrls: ['./contact-search-modal.component.scss'],
})
export class ContactSearchModalComponent implements OnInit {
	contactList: PhoneContactType[];
	filteredList: PhoneContactType[];
	contactEmailInput: any = '';
	debounce: number = 100;
	@ViewChild(IonSearchbar) searchBar: IonSearchbar;

	constructor(
		private viewCtrl: ModalController,
		private alertCtrl: AlertController,
		private service: Service,
	) { 
		this.contactAvatarBaseUrl = this.service.contactAvatarBaseUrl;
		this.populateContacts();
	}

	ngOnInit() {}

	contactAvatarBaseUrl: string;
	timestamp: string = Date.now().toString();
	onSearchChange() {
		if (this.contactList) {
			this.filteredList = this.contactList.filter(contact => {
				return contact.email.toLowerCase().includes(this.contactEmailInput.toLowerCase())
			})
		}
	}

	close(): void {
		this.viewCtrl.dismiss();
	}

	onCancelSearch($event) {
		this.viewCtrl.dismiss();
	}

	onCallClick(email) {
		this.viewCtrl.dismiss(email)
	}

	populateContacts() {
		this.service.getItem(this.service.contactList)
			.then((contactList: PhoneContactType[]) => {
				if (this.service.isEmpty(contactList) === false) {
					this.contactList = contactList;
					this.filteredList = contactList;
				}
				else {
					this.retrieveContacts()
						.then((contacts: PhoneContactType[]) => {
							this.contactList = contacts;
							this.filteredList = contacts;
						})
						.catch((e) => {
							console.log("unable to retrieve contacts: ", e);
						})
				}

				this.searchBar.setFocus();
			})
			.catch(error => {
				console.log('contactSearchModalComponent.constructor()', error)
			})
	}

	async retrieveContacts(): Promise<Array<PhoneContactType>> {
		try {
			let accessToken: string;
			try {
				accessToken = await this.service.getAccessToken();
			}
			catch (e) {
				throw ("Unable to get access at this time. Please try again later.");
			}

			if (this.service.isEmpty(accessToken)) {
				throw ("Unable to get access at this time.");
			}

			let contactList: Array<PhoneContactType>;

			try {
				contactList = await this.service.getContactList(accessToken);
			}
			catch (e) {
				throw ("Unable to get contacts.");
			}

			if (this.service.isEmpty(contactList) === false) {
				let blockEmails: Array<string> = this.service.blockedEmails.map(blockedEmailType => blockedEmailType.emailBlocked);

                let phoneContacts = contactList.filter(appContact => {
                    //return blockEmails.indexOf(appContact.email) == -1;
                    return !blockEmails.includes(appContact.email);
				})

				await this.service.setItem(this.service.contactList, phoneContacts)
				return phoneContacts;
			}
			else {
				return null;
			}
		}
		catch (e) {
			const alert = await this.alertCtrl.create({
				cssClass: 'my-custom-class',
				header: 'Please Check',
				message: e,
				buttons: ['OK']
			  });
		  
			await alert.present();
		}
	}
}
