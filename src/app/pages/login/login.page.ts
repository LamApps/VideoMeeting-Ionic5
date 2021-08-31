import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';

import { Service } from '../../services/index';

import { optionalEmail } from '../../validators/optionalEmail.validator';

import { GuestLoginType, login } from 'src/app/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private service: Service,
    private router: Router
  ) {
    this.createForms();
   }

  ngOnInit() {
    if (this.service.isSignalrConnected() === false) {
        this.service.startConnection();
    }
  }
  keysGetter = Object.keys;

  showPasswordText: boolean = false;

  private loginForm: FormGroup;
  private guestForm: FormGroup;

  invalidCredentials: boolean = false;

  ionViewDidEnter() {
      //console.log("login.ts ionViewDidEntere");
      //console.log("login.ts signalrService:", this.signalrService);
      //if (!this.signalrService.isReady) {
      //    this.signalrService.init();
      //}

      this.service.checkCameraPermissions()
          .then(async (hasPermissions: boolean) => {
              if (hasPermissions === false) {
                  let alert = await this.alertCtrl.create({
                      header: 'Warning',
                      message: 'Live Net Video needs your permission to use your camera to make live video calls.',
                      buttons: ['OK']
                  });
                  await alert.present();
              }
          });
  }

  createForms(): void {
      this.loginForm = this.formBuilder.group({
          email: new FormControl('', [
              Validators.minLength(5),
              Validators.maxLength(300),
              Validators.required,
              optionalEmail
          ]),
          password: new FormControl('', [
              Validators.minLength(6),
              Validators.maxLength(25),
              Validators.required
          ]),
          remember: new FormControl(true)
      });

      this.guestForm = this.formBuilder.group({
          email: new FormControl('', [
              Validators.minLength(5),
              Validators.maxLength(300),
              Validators.required,
              optionalEmail
          ]),
          name: new FormControl('', [
              Validators.minLength(3),
              Validators.maxLength(100),
              Validators.required
          ])
      });
      //this.loginForm = this.formBuilder.group({
      //	email: ['', Validators.compose([EmailValidator.isValidEmailFormat])],
      //	password: ['', Validators.compose([Validators.required])],
      //	remember: [true]
      //});

      //this.guestForm = this.formBuilder.group({
      //	email: ['', Validators.compose([EmailValidator.isValidEmailFormat])],
      //	name: ['', Validators.compose([Validators.required, Validators.minLength(3)])]
      //});
  }

  private sanitizeEmail(email: string) {
      return email.trim().toLowerCase();
  }

  async login(): Promise<void> {
      if (this.loginForm.valid) {
          //Fill in loginData with form inputs
          let loginData = new login();
          loginData.email = this.sanitizeEmail(this.loginForm.get('email').value);
          loginData.password = this.loginForm.get('password').value;
          loginData.remember = this.loginForm.get('remember').value;
          //console.log('login.ts -> login() loginData.remember: ', loginData.remember)

          let loading = await this.loadingCtrl.create({
              message: "signing in..."
          });

          try {
              await loading.present();
              await this.service.memberLogIn(loginData.email, loginData.password, loginData.remember);
          }
          catch (e) {
              let alert = await this.alertCtrl.create({
                  header: 'Error: Please Check',
                  message: e,
                  buttons: [
                      {
                          text: 'OK',
                          role: 'cancel',
                          handler: () => {
                          }
                      }
                  ]
              })
              await alert.present();
          }
          finally {
              //console.log("login compelete");
              let isMember = await this.service.isMember();
              if (this.service.isEmpty(isMember) === false) {
                this.router.navigate(['/home']);
              }

              loading.dismiss();
          }
      }
      else {
          let alert = await this.alertCtrl.create({
              header: "Please check",
              message: "Please make sure all error messages are corrected.",
              buttons: ["OK"]
          });
          await alert.present();
      }
  }

  async guestLogin(): Promise<void> {
      if (this.guestForm.valid) {
          let guestLoginData = new GuestLoginType();
          guestLoginData.email = this.sanitizeEmail(this.guestForm.get('email').value);
          guestLoginData.name = this.guestForm.get('name').value;

          let loading = await this.loadingCtrl.create({
            message: "signing in..."
          });

          try {
              await loading.present();
              await this.service.guestLogin(guestLoginData);
          }
          catch (e) {
              let alert = await this.alertCtrl.create({
                  header: "Error: Please Check",
                  message: e,
                  buttons: [{ text: "OK", role: 'cancel' }]
              });
              await alert.present();
              
          }

          let isLoggedIn = await this.service.getIsLoggedIn();

          if (this.service.isEmpty(isLoggedIn) === false) {
              //this.onGuestLoginSuccess.emit();
            this.router.navigate(['home']);
          }
          else {
              let alert = await this.alertCtrl.create({
                  header: "Error: Please Check",
                  message: "Login attempt failed",
                  buttons: [{ text: "OK", role: 'cancel' }]
              });
              await alert.present();
             
          }

          loading.dismiss();
      }
      else {
          let alert = await this.alertCtrl.create({
              header: "Please check",
              message: "Please make sure all error messages are corrected.",
              buttons: ["OK"]
          });
          await alert.present();
         
      }
  }

  createAccount() {
    this.router.navigate(['home']);
  }

  forgotPassword() {
      //TODO: Need to create forgot password page and implement password recovery
      // console.log("Need to create forgot password page and implement password recovery");

      // this.navCtrl.push(ForgotPasswordPage);
  }


}
