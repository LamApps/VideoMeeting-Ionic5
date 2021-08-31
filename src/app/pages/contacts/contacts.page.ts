import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  NavController,
  //NavParams,
  ModalController,
  AlertController,
  ActionSheetController,
  Platform,
} from '@ionic/angular';
//import { Contacts, ContactFieldType, ContactFindOptions } from 'ionic-native';
import {
  //JsHelperService,
  //ContactService,
  //UserService,
  //LocalContactService,
  //BlockCallService,
  //SignalrService,
  //PhoneService,
  //ConfigService,
  //LocalStorageService,
  Service,
} from '../../services/index'

//import { Subscription } from "rxjs/Subscription";

import {
  PhoneContactType,
  //BlockedEmailType,
  //ObservableMessageType,
  CallType,
  //IncomingCallResponseEnum
} from '../../models/index'
import { AddContactsPage } from '../add-contacts/add-contacts.page';
import {
  EditContactModalComponent
} from '../../components/edit-contact-modal/edit-contact-modal.component'
import { PhoneRingerComponent } from '../../components/index';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  phoneContacts: PhoneContactType[];
  contactEmails: string[];
  pageLoading: boolean = false;

  constructor(
      private navCtrl: NavController,
      //private navParams: NavParams,
      private modalCtrl: ModalController,
      private alertCtrl: AlertController,
      private actionSheetCtrl: ActionSheetController,
      private ngZone: NgZone,
      private platform: Platform,
      //private configService: ConfigService,
      //private jsHelperService: JsHelperService,
      //private signalrService: SignalrService,
      //private phoneService: PhoneService,
      //private blockCallService: BlockCallService,
      //private userService: UserService,
      //private contactService: ContactService,
      //private localContactService: LocalContactService,
      //private localStorageService: LocalStorageService,
      private service: Service,
      private router: Router,

  ) {
      this.phoneContacts = new Array<PhoneContactType>();
      this.isMember = false;
      this.contactAvatarBaseUrl = this.service.contactAvatarBaseUrl;
  }

  @ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

  timestamp: string = Date.now().toString();

  isMember: boolean;

  contactAvatarBaseUrl: string;

  receiveRemoteLogout: Subscription;
  receivePhoneLineInvitation: Subscription;

  ngOnInit() {
      if (this.service.isSignalrConnected() === false) {
          this.service.startConnection();
      }
  }

  ionViewDidEnter() {
      console.log("contacts.ts ionViewDidEnter()");

      if (this.service.isEmpty(this.phoneContacts)) {
          this.pageLoading = true;
          try {
              this.service.getItem(this.service.contactList)
                  .then((phoneContacts: PhoneContactType[]) => {
                      this.phoneContacts = phoneContacts;
                      if (this.service.isEmpty(this.phoneContacts)) {
                          this.updateContacts();
                      }
                      //this.pageLoading = false;
                      console.log('contact loaded from storage', phoneContacts)
                  })
                  .catch((e) => {
                      console.log("contacts getItem phoneContacts error: ", e);
                      this.updateContacts();
                  })
          }
          catch (e) {
              //this.pageLoading = false;
              this.alertCtrl.create({
                  header: "Please Check",
                  message: e,
                  buttons: ['OK']
              }).then((altRes)=>{
                altRes.present();
              })
          }
          finally {
              this.pageLoading = false;
          }
      }

      this.service.isMember()
          .then((data: boolean) => {
              this.isMember = data;
          });

      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.startListeners();
          this.receivePhoneLineInvitation = this.phoneRinger.getSubjects('receivePhoneLineInvitation').subscribe((call: CallType) => {
              if (this.service.isEmpty(call) === false) {
                  this.service.acceptedCall = call;
                  // this.navCtrl.setRoot(Phone);
                  this.router.navigate(['phone']);
              }
          });
    
          this.receiveRemoteLogout = this.phoneRinger.getSubjects('receiveRemoteLogout').subscribe((connectionId: string) => {
              this.service.doLogout()
                  .catch((error) => {
                      console.log("app-shell.ts logOut error:", error);
                  })
                  .then(() => {
                      // this.navCtrl.setRoot(LoginPage);
                      this.router.navigate(['login']);
                  })
          });
      }


      //console.log('pageloading', this.pageLoading)
  }

  ngOnDestroy() {
      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.endListeners();
      }

      this.receivePhoneLineInvitation.unsubscribe();
      this.receiveRemoteLogout.unsubscribe();
  }

  async askPhoneContactListImport() {
      let alert = await this.alertCtrl.create({
          header: 'Confirm Import',
          message: 'Do you want to import your contacts to LIVENETVIDEO?',
          buttons: [
              {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: this.cancel
              },
              {
                  text: 'Import',
                  handler: this.import
              }
          ]
      });
      await alert.present();
  }

  cancel = () => {
      console.log('Cancel clicked');
  }

  import = () => {
      console.log('import clicked');
      this.service.getLocalContacts()
          .then((phoneContacts: PhoneContactType[]) => {
              console.log('before filtiring', phoneContacts);
              return this.filterDuplicates(phoneContacts)
          })
          .then(((phoneContactTypes: PhoneContactType[]) => {
              console.log('after filtiring', phoneContactTypes)
              //let jwtToken = this.signalrService.jwtToken;
              this.service.getAccessToken()
                  .then((accessToken: string) => {
                      this.service.addContacts(phoneContactTypes, accessToken)
                          .subscribe(
                              (contact: PhoneContactType) => {
                                  this.phoneContacts.unshift(contact);
                              },
                              error => console.log('error happened', error)
                          )
                  })
          }))
  }

  private filterDuplicates(phoneContacts: PhoneContactType[]): Promise<PhoneContactType[]> {
      return new Promise<PhoneContactType[]>((resolve, reject) => {
          let contactEmails: Array<string> = this.phoneContacts.map(contacts => contacts.email)
          console.log('cached emails', contactEmails)
          let uniquePhoneContacts: PhoneContactType[] =
              phoneContacts.filter((phoneContact: PhoneContactType) => {
                  let index: number = contactEmails.findIndex((email) => {
                      // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
                      return email == phoneContact.email;
                  })
                  let notDuplicate = true;
                  let isDuplicate = false;
                  return index === -1 ? notDuplicate : isDuplicate;
              })
          resolve(uniquePhoneContacts)
      })
  }

  async addContact() {
      let contactModal = await this.modalCtrl.create({
        component: AddContactsPage
      });
      await contactModal.present()
      let {data} = await contactModal.onDidDismiss();
      console.log(data);
      if (data) {
          let contactEmails = this.phoneContacts && this.phoneContacts.map(contacts => contacts.email)
          console.log('cached emails', contactEmails)

          let index: number = contactEmails && contactEmails.findIndex((value) => {
              // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
              return value == data.email;
          })
          //if it doesnt already exist, addi t
          if (index === -1) {
              //let jwtToken = this.signalrService.jwtToken;

              this.service.getAccessToken()
                  .then((accessToken: string) => {
                      return this.service.addContact(data, accessToken);
                  })
                  .then((contact) => {
                      this.phoneContacts.push(contact)
                      console.log('contact added', contact)
                      return;
                  })
                  .then(() => {
                      return this.service.setItem(this.service.contactList, this.phoneContacts);
                  })
                  .catch((error) => {
                      console.log('errrs', error)
                  })
          }
      }
  }

  blockContact(phoneContact: PhoneContactType) {
      this.service.getAccessToken()
          .then((accessToken: string) => {
              return this.service.blockEmail(phoneContact.email, accessToken);
          })
          .then(() => {
              this.reloadContacts();
              console.log('email blocked')
          })
          .catch((error) => console.log(error))
  }

  removeContact(phoneContact: PhoneContactType) {
      this.service.getAccessToken()
          .then((accessToken: string) => {
              return this.service.deleteContact(phoneContact, accessToken);
          })
          .then(() => {
              this.phoneContacts.splice(this.phoneContacts.indexOf(phoneContact), 1);

              console.log('contactRemove');
              return;
          })
          .then(() => {
              return this.service.setItem(this.service.contactList, this.phoneContacts);
          })
          .catch((error) => console.log(error))
  }

  // TODO: the PhoneContactType will have a new property isMember:boolean, use this
  // property to show or hide the call button.
  callContact(email: string) {
      if (this.isMember) {
          if (this.service.isBlockedEmailFromCache(email) === false) {
              //this.appCtrl.getRootNav().push(Phone, { emailToCall: email });
              // this.navCtrl.setRoot(Phone, { emailToCall: email });
              this.router.navigate(['phone']);
          }
          else {
              let alert = this.alertCtrl.create({
                  header: "ERROR",
                  message: "Unable to make call. Please remove the email: " + email + " from your blocked list, then try your call again.",
                  buttons: ['OK']
              }).then((altRes)=>{
                altRes.present();
              });
          }
      }
      else {
          //this.appCtrl.getRootNav().push(Phone, { emailToCall: email });
          // this.navCtrl.setRoot(Phone, { emailToCall: email });
          this.router.navigate(['phone']);
      }
  }

  async reloadContacts(): Promise<void> {
      try {
          this.pageLoading = true;
          //let contacts = await this.service.lo

          await this.updateContacts();
          this.pageLoading = false;
      }
      catch (e) {
          this.pageLoading = false;
          let alert = await this.alertCtrl.create({
              header: "Please Check",
              message: e,
              buttons: ['OK']
          })
          await alert.present();
      }
  }

  //TODO : OPTIMIZE THIS call server everytime
  async updateContacts(): Promise<void> {
      try {
          console.log("contacts.ts updateContacts()")
          //let jwtToken = this.signalrService.jwtToken;

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

              this.phoneContacts = contactList.filter(appContact => {
                  //return blockEmails.indexOf(appContact.email) == -1;
                  return !blockEmails.includes(appContact.email);
              })

              await this.service.setItem(this.service.contactList, this.phoneContacts)
              return;
          }
      }
      catch (e) {
          let alert = await this.alertCtrl.create({
              header: "Please Check",
              message: e,
              buttons: ['OK']
          })
          await alert.present();
      }
  }

  // NOTE: for testing only
  getContacts(): void {
      this.updateContacts()
          .then(() => {
              console.log("contacts updated");
          })
          .catch((error) => {
              console.log("contacts.ts getContacts() error: ", error);
          });
  }

  //NOTE: for testing only
  gotoPhone(): void {
      // this.appCtrl.getRootNav().push(Phone);
      this.router.navigate(['phone']);
  }

  async editContact(contact: PhoneContactType) {
      //console.log("contact: ", contact);
      let copy = this.service.tryParseJson(JSON.stringify(contact)) as PhoneContactType;
      let editContactModal = await this.modalCtrl.create({
        component: EditContactModalComponent, 
        componentProps: copy
      });
      await editContactModal.present();
      let {data} = await editContactModal.onDidDismiss();

      this.ngZone.run(() => {
          if (this.service.isEmpty(data.data) === false) {
              this.timestamp = Date.now().toString();
              contact.avatarFileName = data.data.avatarFileName;
              contact.name = data.data.name;
              contact.email = data.data.email;
              contact.isMember = data.data.isMember;
              contact.memberId = data.data.memberId;
              contact.phoneContactId = data.data.phoneContactId;
              contact.created = data.data.created;
          }
      })
  }

  sendInvite(contact: PhoneContactType) {
      console.log("sending invite: ", contact);
  }

  refreshContacts(refresher) {
      console.log('Begin async operation', refresher);
      this.updateContacts()
          .then(() => { })
          .catch(() => { })
          .then(() => { refresher.complete() })
  }

  async openActionSheet(): Promise<void> {
      let actionSheet = await this.actionSheetCtrl.create({
          buttons: [
              {
                  text: 'Add A Contact',
                  role: 'destructive',
                  icon: !this.platform.is('ios') ? 'add-circle' : null,
                  handler: () => {
                      this.addContact();
                  }
              },
              {
                  text: 'Refresh List',
                  icon: !this.platform.is('ios') ? 'refresh-circle' : null,
                  handler: () => {
                      this.reloadContacts();
                  }
              },
              {
                  text: 'Import Contacts',
                  icon: !this.platform.is('ios') ? 'contacts' : null,
                  handler: () => {
                      this.askPhoneContactListImport();
                  }
              },
              {
                  text: 'Close',
                  role: 'cancel', // will always sort to be on the bottom
                  icon: !this.platform.is('ios') ? 'close' : null
              }
          ]
      });
      await actionSheet.present();
  }
}
