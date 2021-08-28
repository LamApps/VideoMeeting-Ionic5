import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  NavController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { FormBuilder, Validators, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import {
  Service,
} from '../../services/index';
import { matchingValidator } from '../../validators/matching.validator';
import { optionalEmail } from "../../validators/optionalEmail.validator";
// import {
//     EditAvatarPopoverPage,
//     Phone,
//     LoginPage,
// } from '../index'
// import { Subscription } from "rxjs/Subscription";
import {
    MemberType,
    AvatarEditType,
    CallType,
} from "../../models/index";
import {
    PhoneRingerComponent,
} from '../../components/index';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    private service: Service,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
  ) {
    this.createForm();
    this.hasIncoming = false;
  }
  @ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

  userProfile: MemberType

  nameForm: FormGroup;
  emailForm: FormGroup;
  passwordForm: FormGroup;

  pageLoading: boolean = false;
  saveNameLoading: boolean = false;
  saveEmailLoading: boolean = false;
  savePasswordLoading: boolean = false;

  hasIncoming: boolean;

  newBase64Image: string;
  defaultAvatar = this.service.defaultAvatar;
  image: string = this.defaultAvatar;

  // receivePhoneLineInvitation: Subscription;
  // receiveRemoteLogout: Subscription;

  // ionViewCanEnter(): Promise<boolean> {
  //     return new Promise<boolean>(async (resolve) => {
  //         let canActivatePage: boolean = await this.service.canActivatePage();
  //         //console.log("canActivatePage: ", canActivatePage);
  //         if (canActivatePage) {
  //             resolve(true);
  //         }
  //         else {
  //             resolve(false);
  //         }
  //     });
  // }
  ngOnInit() {
    let loader:HTMLIonLoadingElement;
    this.loadingCtrl.create({
        message: "Please wait...",
        duration: 5000
    }).then((response:HTMLIonLoadingElement)=>{
      loader = response;
      response.present();
    });
    let isMember: boolean;
    let accessToken: string;
    let profile: MemberType;
    this.service.getAccessToken()
        .then((data: string) => {
            accessToken = data;
            return;
        })
        .catch((e) => {
            console.log("getAccessToken error: ", e);
            throw ("Unable to get access at this time, please try again later.");
        })
        .then(() => {
            return this.service.isMember();
        })
        .then((data: boolean) => {
            isMember = data;
            if (this.service.isEmpty(isMember)) {
                throw ("Not a member");
            }
        })
        .then(() => {
            return this.service.getMyProfile(accessToken);
        })
        .then((data: MemberType) => {
            profile = data;
            if (this.service.isEmpty(profile)) {
                throw ("Unable to get user profile.");
            }
        })
        .catch((e) => {
            console.log("service.getMyProfile error: ", e);
            throw ("Unable to request user profile.");
        })
        .then(() => {
            this.userProfile = profile;
            this.nameForm.controls['firstName'].setValue(this.userProfile.firstName)
            this.nameForm.controls['lastName'].setValue(this.userProfile.lastName)

            //this.originalProfileAvatar = this.service.avatarBaseUrl + this.userProfile.avatarFileName;
            this.image = this.service.avatarBaseUrl + this.userProfile.avatarFileName + "?" + Date.now().toString();

        })
        .catch((e) => {
            this.alertCtrl.create({
                header: "Error",
                message: e,
                buttons: ["OK"]
            }).then((altres)=>{
              altres.present();
            })
        })
        .then(() => {
            loader && loader.dismiss();
        })


}

ionViewDidEnter() {
    if (this.service.isEmpty(this.phoneRinger) === false) {
        this.phoneRinger.startListeners();
        this.phoneRinger.getSubjects('receivePhoneLineInvitation').subscribe((call) => {
          if (this.service.isEmpty(call) === false) {
              this.service.acceptedCall = call;
              // this.navCtrl.setRoot(Phone);
          }
        });
    
        this.phoneRinger.getSubjects('receiveRemoteLogout').subscribe((connectionId) => {
          this.service.doLogout()
          .catch((error) => {
              console.log("app-shell.ts logOut error:", error);
          })
          .then(() => {
              this.router.navigate(['login']);
          })
        });
    }

}

ionViewWillLeave() {
    if (this.service.isEmpty(this.phoneRinger) === false) {
        this.phoneRinger.endListeners();
    }
}


onAvatarChanged(base64Image: string) {
    this.newBase64Image = base64Image;
}

removeAvatar(): void {
    this.image = this.defaultAvatar;
    this.newBase64Image = "";
}


onImageSelected(imageDataUri: string): void {
    //console.log("form-add-contact.component.ts onImageSelected: imageDateUri: ", imageDataUri);
    this.image = imageDataUri;
}

logOut() {
    this.service.doLogout()
        .catch((error) => {
            console.log("app-shell.ts logOut error:", error);
        })
        .then(() => {
            // this.navCtrl.setRoot(LoginPage);
        })
}

createForm() {
    this.emailForm = this.fb.group({
        email: new FormControl(
            this.service.isEmpty(this.userProfile) === false ? this.userProfile.email : ""
            , [
                Validators.minLength(5),
                Validators.maxLength(300),
                Validators.required,
                optionalEmail
            ]
            , this.validateEmailNotTaken.bind(this)
        )
    })

    this.nameForm = this.fb.group({
        firstName: new FormControl(
            this.service.isEmpty(this.userProfile) === false ? this.userProfile.firstName : "",
            [
                Validators.minLength(2),
                Validators.maxLength(50),
                Validators.required
            ]
        ),
        lastName: new FormControl(
            this.service.isEmpty(this.userProfile) === false ? this.userProfile.lastName : "",
            [
                Validators.minLength(2),
                Validators.maxLength(50),
                Validators.required
            ]
        )
    });

    this.passwordForm = this.fb.group(
        {
            newPassword: new FormControl(
                "",
                [

                    Validators.minLength(7),
                    Validators.maxLength(25)
                ]
            ),
            confirmPassword: new FormControl(
                "",
                [

                    Validators.minLength(7),
                    Validators.maxLength(25),
                    matchingValidator.bind(null, 'newPassword')
                ]
            )
        });
}

resetEmailForm(): void {
    this.emailForm.get('email').setValue(this.userProfile.email);
}

resetNameForm(): void {
    //this.originalProfileAvatar = this.service.avatarBaseUrl + this.userProfile.avatarFileName;
    this.image = this.service.avatarBaseUrl + this.userProfile.avatarFileName + "?" + Date.now().toString();
    this.nameForm.get('firstName').setValue(this.userProfile.firstName);
    this.nameForm.get('lastName').setValue(this.userProfile.lastName);
}

resetPasswordForm(): void {
    //this.passwordForm.get("currentPassword").setValue("");
    this.passwordForm.get("newPassword").setValue("");
    this.passwordForm.get("confirmPassword").setValue("");
}

validateEmailNotTaken(control: AbstractControl): Promise<any> {
    //let jwtToken = this.signalrService.jwtToken;
    console.log("control: ", control);
    return this.service.getAccessToken()
        .then((accessToken: string) => {
            // if it finds the email in the system, it will return the email
            // if not found in the system it will return empty string
            return this.service.isEmailUnique(control.value, accessToken);
        })
        .then((data: string) => {
            //console.log("isUnique: ", isUnique);
            let isUnique: boolean = false;
            if (this.service.isEmpty(data)) {
                isUnique = true;
            }
            else if (data === this.userProfile.email) {
                // if the email returned is the same as the users profile email,
                // we will not trigger an error, and consider it unique
                isUnique = true;
            }

            return isUnique ? null : { emailTaken: true }
        })
        .catch((err) => {
            return { emailTaken: true }
        })
    //if (this.jsHelperService.isEmpty(jwtToken) === false) {
    //}
    //else {
    //	this.navCtrl.setRoot(LoginPage, { errorMessage: "Missing authorization. Please log back in to regain authorization." });
    //}
}

validatePassword(control: AbstractControl): Promise<any> {
    //let jwtToken = this.signalrService.jwtToken;
    //console.log("validatePassword control: ", control);
    if (this.service.isEmpty(control.value)) {
        return new Promise<any>((resolve) => {
            return null;
        });
    }
    else {
        return this.service.getAccessToken()
            .then((accessToken: string) => {
                return this.service.verifyPassword((control.value), accessToken);
            })
            .then(res => {
                return res ? null : { invalidPassword: true }
            })
            .catch((err) => {
                return { invalidPassword: true }
            })
    }

    //if (this.jsHelperService.isEmpty(jwtToken) === false) {
    //}
    //else {
    //	this.navCtrl.setRoot(LoginPage, { errorMessage: "Missing authorization. Please log back in to regain authorization." });
    //}
}

updateNameAndAvatar(event: MouseEvent) {
    if (this.nameForm.valid) {
        let loading:HTMLIonLoadingElement;
        this.loadingCtrl.create({
            message: "Please wait...",
            duration: 5000
        }).then((response)=>{
          loading = response;
          response.present();
        });

        let originalContent: string;
        if (this.service.isEmpty(event) === false) {
            originalContent = (<Element>event.target).innerHTML;
            (<Element>event.target).innerHTML = 'Please Wait';
            (<Element>event.target).setAttribute("disabled", "true");
        }

        this.userProfile.firstName = this.nameForm.get('firstName').value;
        this.userProfile.lastName = this.nameForm.get('lastName').value;
        if (!this.service.isEmpty(this.newBase64Image)) {
            this.userProfile.avatarDataUri = this.newBase64Image;
        }
        else if (this.image === this.defaultAvatar) {
            this.userProfile.avatarDataUri = "";
        }



        //let jwtToken = this.signalrService.jwtToken;

        this.service.getAccessToken()
            .then((accessToken: string) => {
                return this.service.updateMyProfile(this.userProfile, accessToken)
            })
            .then((userProfile: MemberType) => {
                //console.log("userProfile: ", userProfile);
                this.userProfile = userProfile;
                this.resetNameForm();
                //this.nameForm.controls['firstName'].setValue(this.userProfile.firstName)
                //this.nameForm.controls['lastName'].setValue(this.userProfile.lastName)
                //this.guiHelperService.showToast('name updated', true)
                this.alertCtrl.create({
                    header: "Success",
                    message: "Name updated",
                    buttons: ["OK"]
                }).then((alertres)=>{
                  alertres.present();
                });
            })
            .catch((error) => {
                console.log('failed to update name', error)
            })
            .then(() => {
                if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                    (<Element>event.target).innerHTML = originalContent;
                    (<Element>event.target).removeAttribute("disabled");
                }
                loading.dismiss();
            })
    }
    else {
        this.alertCtrl.create({
            header: "Please check",
            message: "Please make sure all error messages are corrected.",
            buttons: ["OK"]
        }).then((altres)=>{
          altres.present();
        });
    }
}

updateEmail(event: MouseEvent) {
    if (this.nameForm.valid) {
        let loader:HTMLIonLoadingElement;
        this.loadingCtrl.create({
            message: "Please wait...",
            duration: 5000
        }).then((loadingRes)=>{
          loader = loadingRes;
          loadingRes.present();
        });

        let originalContent: string;
        if (this.service.isEmpty(event) === false) {
            originalContent = (<Element>event.target).innerHTML;
            (<Element>event.target).innerHTML = 'Please Wait';
            (<Element>event.target).setAttribute("disabled", "true");
        }

        let newEmail = this.emailForm.get('email').value;
        //let jwtToken = this.signalrService.jwtToken;
        let accessToken: string;
        this.service.getAccessToken()
            .then((token: string) => {
                accessToken = token;
                return this.service.updateEmail(newEmail, accessToken);
            })
            .then(() => {
                return this.service.updateUsername(newEmail, accessToken);
            })
            .then((userProfile: MemberType) => {
                this.userProfile = userProfile;

                this.resetEmailForm();
                //this.emailForm.controls['email'].setValue(this.userProfile.email)
                //this.guiHelperService.showToast('email updated', true)
                //this.emailForm.get('email').markAsUntouched();
                this.alertCtrl.create({
                    header: "Success",
                    message: "Email Updated",
                    buttons: ["OK"]
                }).then((altRes)=>{
                  altRes.present();
                });
            })
            .catch(error => {
                console.log('failed to update email && username', error)
            })
            .then(() => {
                if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                    (<Element>event.target).innerHTML = originalContent;
                    (<Element>event.target).removeAttribute("disabled");
                }
                loader.dismiss();
            })
    }
    else {
        this.alertCtrl.create({
            header: "Please check",
            message: "Please make sure all error messages are corrected.",
            buttons: ["OK"]
        }).then((altRest)=>{
          altRest.present();
        });
    }
}

updatePassword(event: MouseEvent) {
    if (this.nameForm.valid) {
        let loader : HTMLIonLoadingElement;
        this.loadingCtrl.create({
            message: "Please wait...",
            duration: 5000
        }).then((loaderRes)=>{
          loader = loaderRes;
          loaderRes.present();
        });

        let originalContent: string;
        if (this.service.isEmpty(event) === false) {
            originalContent = (<Element>event.target).innerHTML;
            (<Element>event.target).innerHTML = 'Please Wait';
            (<Element>event.target).setAttribute("disabled", "true");
        }

        let newPassword = this.passwordForm.get('newPassword').value

        this.service.getAccessToken()
            .then((accessToken: string) => {
                return this.service.changePassword(newPassword, accessToken);
            })
            .then((userProfile: MemberType) => {
                this.userProfile = userProfile;
                //this.guiHelperService.showToast('password updated', true)
                this.resetPasswordForm();
                this.alertCtrl.create({
                    header: "Success",
                    message: "Password updated",
                    buttons: ["OK"]
                }).then((altRes)=>{
                  altRes.present();
                });
            })
            .catch((e) => {
                console.log("account.ts updatePassword() error: ", e);
            })
            .then(() => {
                if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                    (<Element>event.target).innerHTML = originalContent;
                    (<Element>event.target).removeAttribute("disabled");
                }
                loader.dismiss();
            })
    }
    else {
        this.alertCtrl.create({
            header: "Please check",
            message: "Please make sure all error messages are corrected.",
            buttons: ["OK"]
        }).then((altRes)=>{
          altRes.present();
        });
    }
}
}
