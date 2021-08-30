import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { PhoneContactType, CallType } from '../../models/index'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { EmailValidator } from '../../validators/index'
import {
    PhoneRingerComponent,
} from '../../components/index';
import {
    Service
} from '../../services/index'
import { Subscription } from 'rxjs';
import {Router} from '@angular/router';
// import { Phone, LoginPage } from '../index';
@Component({
  selector: 'app-add-contacts',
  templateUrl: './add-contacts.page.html',
  styleUrls: ['./add-contacts.page.scss'],
})
export class AddContactsPage implements OnInit {

  contactForm: FormGroup;
  phoneContact: PhoneContactType = new PhoneContactType();
  newBase64Image: string;
  receivePhoneLineInvitation: Subscription;
  receiveRemoteLogout: Subscription;

  constructor(
      private navCtrl: NavController,
      //private navParams: NavParams,
      private formBuilder: FormBuilder,
      private viewCtrl: ModalController,
      private service: Service,
      private router: Router
  ) {

      this.createForm();
      //console.log(this.contactForm)
  }

  @ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

  ngOnInit() {
  }
  createForm() {
    this.contactForm = this.formBuilder.group({
        name: new FormControl(
            "",
            [
                Validators.minLength(2),
                Validators.maxLength(100),
                Validators.required
            ]
        ),
        email: new FormControl(
            ""
            , [
                Validators.minLength(5),
                Validators.maxLength(300),
                Validators.required,
                Validators.email
            ]

        )
    })
  }

  ionViewWillEnter() {
      // fires each time user enters page but before the page actually becomes the active page
      // use ionViewDidEnter to run code when the page actually becomes the active page
      if (this.service.isSignalrConnected() === false) {
          this.service.startConnection();
      }
  }

  ionViewDidEnter() {
      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.startListeners();
          this.receivePhoneLineInvitation = this.phoneRinger.getSubjects('receiveRemoteLogout').subscribe((call: CallType) => {
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

  }

  ionViewWillLeave() {
      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.endListeners();
      }

      this.receiveRemoteLogout.unsubscribe();
      this.receiveRemoteLogout.unsubscribe();
  }

  onAvatarChanged(base64Image: string) {
      this.newBase64Image = base64Image;
  }

  add() {
      this.phoneContact.name = this.contactForm.get('name').value;
      this.phoneContact.email = this.contactForm.get('email').value;
      if (!this.service.isEmpty(this.newBase64Image)) {
          this.phoneContact.avatarDataUri = this.newBase64Image
      }

      this.viewCtrl.dismiss(this.phoneContact)
  }
}
