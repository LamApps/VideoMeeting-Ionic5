import { Component } from '@angular/core';
import {
    Platform,
    AlertController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Service } from './services/index';

import { MemberType, GuestProfileType } from './models';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isMember: boolean;
  isLoggedIn: boolean;
  userName: string;
  email: string;
  imgSrc: string;

	constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private alertCtrl: AlertController,
    private service: Service,
    private router: Router,
	) {}
  ngOnInit() {
    console.log("app.component.ts ngOnInit()");
    this.isMember = false;
    this.isLoggedIn = false;
    this.startSubscriptions();
    this.initializeApp();
  }

  ngOnDestroy() {
      this.endSubscriptions();
  }
  startSubscriptions() {

    console.log("starting app.component.ts subscriptions");

    this.service.getObservable('isMember').subscribe((isMember) => {
        console.log("isMember:changed: ", isMember.changed);
        this.isMember = this.service.isEmpty(isMember.changed) === false ? true : false;
    });

    this.service.getObservable('isLoggedIn').subscribe((isLoggedIn) => {
        console.log("isLoggedIn:changed: ", isLoggedIn.changed);
        this.isMember = this.service.isEmpty(isLoggedIn.changed) === false ? true : false;
    });

    this.service.getObservable('memberEmail').subscribe((email) => {
        console.log("email:changed: ", email.changed);
        this.email = email.changed;
    });

    this.service.getObservable('userName').subscribe((userName) => {
        console.log("userName:changed: ", userName.changed);
        this.userName = userName.changed;
    });

    this.service.getObservable('memberImgSrc').subscribe((imgSrc) => {
        console.log("imgSrc:changed: ", imgSrc.changed);
        this.imgSrc = imgSrc.changed;
    });
  }

  endSubscriptions() {
    this.service.unsubscribeObservable();
  }

  async initializeApp() {

      console.log("initializing app");

      //console.log("awaiting this.platform.ready()");

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      //console.log("readySource: ", readySource)
      //console.log("platformVersion: ", version);

      this.platform.resume.subscribe(async () => {
          console.log('app.component.ts resumed')
          //let canActivatePage: boolean = await this.service.canActivatePage();
          //if (this.service.isEmpty(canActivatePage)) {
          //    // after app resumes from paused state, we will check to make sure
          //    // the user can activate the page, if not, send them to the login page
          //    // await this.service.promptLoginChoices();

          //    this.rootPage = LoginPage;

          //}

      })
      this.platform.pause.subscribe(() => {
          console.log('app.component.ts paused')
      })

      // for browser testing, we need to check to see if cordova is
      // loaded. if not we skip using this plugin for browser testing
      // if (typeof cordova !== "undefined" && this.platform.is("ios")) {
      //     console.log("is IOS");
      //     cordova.plugins.iosrtc.registerGlobals();
      // }

      //window.plugins.iosrtc.registerGlobals();

      // load adapter.js
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "assets/js/adapter.js";
      script.async = false;
      document.getElementsByTagName("head")[0].appendChild(script);

      this.statusBar.styleDefault();
      console.log("hiding splashscreen");
      this.splashScreen.hide();

      // TODO: the app requires an internet connection for most all the use cases
      // so we need to detect and make sure the user has an internet connection
      // else send them to a page that warns them that internet connection is required.
      this.startApp();
      this.service.checkCameraPermissions()
          .then((hasPermissions: boolean) => {
              if (hasPermissions) {
                  return this.service.checkMicrophonePermissions();
              }
              else {
                  throw ("Camera permission required");
              }
          })
          .then((hasPermissions) => {
              if (hasPermissions) {
                  this.startApp();
              }
              else {
                  // TODO: need to display proper error message on errorPage
                  // console.log("app.component.ts initializeApp() no permissions");
                  // this.rootPage = ErrorPage;
                  throw ("Microphone permission required");
              }
          })
          .catch(async (error) => {
              console.log("app.component.ts initializeApp() error: ", error);

              let alert = await this.alertCtrl.create({
                header: "Warning",
                message: "Live Net Video requires your permission to the camera and microphone so you can do live video phone calls.",
                buttons: ["OK"]
              })
              await alert.present();
          })

  }

  async startApp(): Promise<void> {
      console.log("startApp()");

      try {
          let canActivatePage: boolean = await this.service.canActivatePage();
          if (this.service.isEmpty(canActivatePage)) {
              // unable to start page, send the user to the error page
              // TODO: need to set error page that has error message for user and allows
              // the user to perform some action.
              console.log('Empty');
          }
          else {
              // is the user loggedin
              this.isLoggedIn = await this.service.checkIsLoggedIn();
            
              if (this.service.isEmpty(this.isLoggedIn)) {
                  // not logged in send them to the login page
                  this.router.navigate(['login']);
              }
              else {
                  // user is loggedIn, are they are member or guest user
                  this.isMember = await this.service.isMember();

                  let memberProfile: MemberType;
                  let guestProfile: GuestProfileType;
                  if (this.isMember) {
                      // loggedin user is a member
                      memberProfile = await this.service.getProfile();
                      if (!this.service.isEmpty(memberProfile)) {
                          this.email = memberProfile.email;
                          this.userName = memberProfile.firstName + " " + memberProfile.lastName;
                          this.imgSrc = this.service.isEmpty(memberProfile.avatarFileName) ? this.service.defaultAvatar
                              : this.service.avatarBaseUrl + memberProfile.avatarFileName + "?" + Date.now().toString();
                      }
                  }
                  else {
                      // loggedin user is a guest
                      guestProfile = await this.service.getGuestProfile();
                      if (!this.service.isEmpty(guestProfile)) {
                          this.email = guestProfile.email;
                          this.userName = this.service.isEmpty(guestProfile.name) ? guestProfile.email : guestProfile.name;
                          this.imgSrc = this.service.isEmpty(guestProfile.avatarDataUri) ? this.service.defaultAvatar
                              : guestProfile.avatarDataUri;
                      }
                      
                  }

                  let isEmailReady: boolean = await this.service.isEmailReady();
                  if (isEmailReady === false) {
                      if (this.service.isEmpty(this.email)) {

                      }
                      else {
                          await this.service.setEmail(this.email);
                      }
                  }
                  else {
                  }

              }
          }
      }
      catch (e) {
      }
      this.splashScreen && this.splashScreen.hide();
  }
}
