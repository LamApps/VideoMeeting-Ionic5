import { Injectable } from '@angular/core';

import { PhoneContactType } from '../models/index'
//import { Contacts, ContactFieldType, ContactFindOptions, Contact } from 'ionic-native';
import { Contacts, Contact } from '@ionic-native/contacts/ngx';

import { JsHelperService } from './index'

@Injectable({providedIn:'root'})
export class LocalContactService {
	constructor(
		private jsHelperService: JsHelperService,
		private contacts: Contacts

	) {
	}

	getContacts(): Promise<PhoneContactType[]> {
		return new Promise<PhoneContactType[]>((resolve, reject) => {
			this.getDeviceContacts()
				.then((deviceContacts: Contact[]) => {
					console.log('filtering for emails', deviceContacts)
					return this.filterForEmails(deviceContacts);
				})
				.then((deviceContacts: Contact[]) => {
					console.log('parsing to contact type', deviceContacts)
					return this.parseToPhoneContactType(deviceContacts)
				})
				.then((contacts: PhoneContactType[]) => {
					console.log('resolvign contacts', contacts)
					resolve(contacts);
				})
				.catch(error => {
					console.log('localContactService.getContacts()', error)
					reject(error)
				})
		})
	}

	private getDeviceContacts(): Promise<Contact[]> {
		return new Promise<Contact[]>((resolve, reject) => {
			this.contacts.find(['displayName', 'name', 'phoneNumbers', 'emails'],
				{ filter: "", multiple: true })
				.then(deviceContactList => {
					resolve(deviceContactList);
				})
				.catch(error => {
					console.log(error);
					reject(null);
				})
		})
	}

	private filterForEmails(contacts: Contact[]): Promise<Contact[]> {
		return new Promise<Contact[]>((resolve, reject) => {
			resolve(contacts.filter(contact => !this.jsHelperService.isEmpty(contact.emails)))
		})
	}

	private parseToPhoneContactType(contacts: Contact[]): Promise<PhoneContactType[]> {
		return new Promise<PhoneContactType[]>((resolve, reject) => {
			let phoneContactList: PhoneContactType[] = new Array<PhoneContactType>()
			contacts.forEach(contact => {
				let phoneContact: PhoneContactType = new PhoneContactType();
				phoneContact.email = contact.emails[0].value;
				phoneContact.name = contact.displayName;
				phoneContactList.push(phoneContact)
			})
			resolve(phoneContactList)
		})
	}
}