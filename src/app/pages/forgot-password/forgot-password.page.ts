import { Component, OnInit } from '@angular/core';
import {
	NavController,
	//AlertController
} from '@ionic/angular';

import {
	Validators,
	FormBuilder,
	FormGroup,
  FormControl
} from '@angular/forms';

import {
	//UserService,
	//SignalrService,
	//JsHelperService,
	Service,
} from '../../services/index'
import { Router } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
	resetPasswordForm: FormGroup;

	constructor(
		//private userService: UserService,
		private formBuilder: FormBuilder,
		public navCtrl: NavController,
		//private signalrService: SignalrService,
		//private jsHelperService: JsHelperService,
		//private alertCtrl: AlertController,
		private service: Service,
    private router: Router,
	) {
		//this.resetPasswordForm = this.formBuilder.group({
		//	email: ['', Validators.compose([Validators.required])]
        //})
        this.createForm();
    }
  ngOnInit() {
    if (this.service.isSignalrConnected() === false) {
        this.service.startConnection();
    }
  }

  createForm() {
      this.resetPasswordForm = this.formBuilder.group({
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

  resetPassword() {
    let email: string = this.resetPasswordForm.get('email').value;
    this.service.getAccessToken()
      .then((accessToken: string) => {
        this.service.sendPasswordResetRequest(email, accessToken);
      })
  //if (this.jsHelperService.isEmpty(jwtToken) === false) {
  //		.then(() => {
  //			console.log('the password has been reset for', email)
  //		})
  //		.catch((error) => {
  //			console.log('failed to reset the password')
  //		})
  //}
  //else {
  //let prompt = this.alertCtrl.create({
  //	title: 'Error',
  //	message: "Sorry it appears your session credentials has been lost. Please click the reset button to try to reset your session or cancel to go back.",
  //	buttons: [
  //		{
  //			text: 'Cancel',
  //			handler: () => {
  //				this.navCtrl.pop();
  //			}
  //		},
  //		{
  //			text: 'Reset',
  //			handler: () => {
  //				this.signalrService.init()
  //					.then(() => {
  //						let alert = this.alertCtrl.create({
  //							title: 'SUCCESS',
  //							subTitle: "Your credentials have been reset. Please try your request again.",
  //							buttons: ['OK']
  //						});
  //						alert.present();
  //						prompt.dismiss();
  //					})
  //					.catch((error) => {
  //						let alert = this.alertCtrl.create({
  //							title: 'Error.',
  //							subTitle: 'Sorry we were unable to reset your credentials. This could be due to network errors. Please try again a little later.',
  //							buttons: ['OK']
  //						});
  //						alert.present();
  //						prompt.dismiss();
  //					});
  //			}
  //		}
  //	]
  //});
  //prompt.present();
  //}
  }

  cancel() {
      this.router.navigate(['login']);
  }
}
