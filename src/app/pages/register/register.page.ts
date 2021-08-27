import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterDto } from '../../models/index';
import { Service } from '../../services/index';

import { NavController, LoadingController, PopoverController, AlertController } from '@ionic/angular';

import {
	Validators,
	FormBuilder,
	FormGroup,
  FormControl
} from '@angular/forms';

import { PicPreviewComponent } from '../../components';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    public navCtrl: NavController,
    // public navParams: NavParams,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private service: Service,
    private router: Router,
  ) {
    this.createForm();
  }
  @ViewChild(PicPreviewComponent) picPreview: PicPreviewComponent;
  ngOnInit() {
  }
  newBase64Image: string;

	public base64Image: string;

  defaultAvatar = this.service.defaultAvatar;

  image: string = this.defaultAvatar;

  showRemoveImage: boolean = false;

	imageSrc: string;

  formGroup: FormGroup;
	regForm: FormGroup;

	profilePicture: any = "assets/images/default-avatar.png";

  showPasswordText: boolean = false;

  ionViewWillEnter(): Promise<boolean> {
      //page
      return new Promise<boolean>(async (resolve) => {
        // resolve(true);
          let canActivatePage: boolean = await this.service.canActivatePage();
          //console.log("canActivatePage: ", canActivatePage);
          if (canActivatePage) {
              resolve(true);
          }
          else {
              resolve(false);
          }
      });
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
        firstName: new FormControl('', [
            Validators.maxLength(50),
            Validators.required

        ]),
        lastName: new FormControl('', [
            Validators.maxLength(50),
            Validators.required

        ]),
        email: new FormControl('', [
            Validators.minLength(5),
            Validators.maxLength(300),
            Validators.required,
            Validators.email

        ]),
        password: new FormControl('', [
            Validators.minLength(7),
            Validators.maxLength(25),
            Validators.required
        ]),
      
        avatarDataUri: new FormControl(''),
        
    });

  }

  onAvatarChanged(base64Image: string) {
      this.newBase64Image = base64Image;
      //console.log("onAvatarChanged");
      if (this.newBase64Image !== this.defaultAvatar) {

          this.showRemoveImage = true;
          //console.log("showRemoveImage: ", this.showRemoveImage);
      }
  }

  onImageSelected(imageDataUri: string): void {
      //console.log("form-add-contact.component.ts onImageSelected: imageDateUri: ", imageDataUri);
      this.image = imageDataUri;
      //console.log("onImageSelected");
      if (this.image !== this.defaultAvatar) {
          this.showRemoveImage = true;
      }
  }

  removeAvatar(): void {
      //console.log("removeAvatar");
      this.image = this.defaultAvatar;
      this.newBase64Image = "";
      this.picPreview.imageSource = this.defaultAvatar;
      this.showRemoveImage = false;
  }

  async popup(title: string, message: string) {
      let alert = await this.alertCtrl.create({
          header: title,
          message: message,
          buttons: ['OK']
      });
      await alert.present();
  }

	async submit() {
		console.log('register is called from register.ts')
		let loading = await this.loadingCtrl.create({
			message: "Please wait..."
		});

		//Display loading control, so that user knows the process still running
		await loading.present();
		
		//Fill details from form into register class object
		let registerData: RegisterDto = new RegisterDto();
		registerData.username = this.formGroup.get('email').value;
		registerData.firstName = this.formGroup.get('firstName').value;
		registerData.lastName = this.formGroup.get('lastName').value;
		registerData.email = this.formGroup.get('email').value;
		registerData.password = this.formGroup.get('password').value;
		registerData.avatarDataUri = this.base64Image;


		//let jwtToken = this.signalrService.jwtToken;

		this.service.getAccessToken()
			.then((accessToken: string) => {
				return this.service.register(registerData, accessToken);
			})
			.then(() => {
				//After success/failure dismiss loading controller
				loading.dismiss()
					.then(() => {
						this.service.memberLogIn(registerData.email, registerData.password, false)
							.then(() => {
								loading.dismiss()
									.then(() => {
										this.router.navigate(['home']);
									});
							})
							.catch((error) => {
								loading.dismiss()
									.then(() => {
										console.log("Something went wrong, error:", error);
									});
							});
					});
			})
			.catch((error) => {
				//After success/failure dismiss loading controller
				loading.dismiss()
					.then(async () => {
						console.log(error);

						let alert = await this.alertCtrl.create({
							header: "Please check",
							message: error.error_description,
							buttons: ["OK"]
						});
						await alert.present();

						//let toast = this.toastCtrl.create({
						//	message: error.error_description,
						//	duration: 5000,
						//	position: 'middle'
						//});
						//toast.present();
					});
			});

		//if (this.jsHelperService.isEmpty(jwtToken) === false) {
		//}
		//else {
		//	let prompt = this.alertCtrl.create({
		//		title: 'Error',
		//		message: "Sorry it appears your session credentials has been lost. Please click the reset button to try to reset your session or cancel to go back.",
		//		buttons: [
		//			{
		//				text: 'Cancel',
		//				handler: () => {
		//					this.navCtrl.pop();
		//				}
		//			},
		//			{
		//				text: 'Reset',
		//				handler: () => {
		//					this.signalrService.init()
		//						.then(() => {
		//							let alert = this.alertCtrl.create({
		//								title: 'SUCCESS',
		//								subTitle: "Your credentials have been reset. Please try your request again.",
		//								buttons: ['OK']
		//							});
		//							alert.present();
		//							prompt.dismiss();
		//						})
		//						.catch((error) => {
		//							let alert = this.alertCtrl.create({
		//								title: 'Error.',
		//								subTitle: 'Sorry we were unable to reset your credentials. This could be due to network errors. Please try again a little later.',
		//								buttons: ['OK']
		//							});
		//							alert.present();
		//							prompt.dismiss();
		//						});
		//				}
		//			}
		//		]
		//	});
		//	prompt.present();
		//}
	}


    cancel() {
        this.navCtrl.pop();
    }

	show() {
		console.log(this.regForm.controls)
	}

	// async editAvatar() {
	// 	console.log('editing the avatar')
	// 	let popover = await this.popoverCtrl.create({
  //     component:EditAvatarPopoverComponent});
	// 	await popover.present();
	// 	let editType = await popover.onDidDismiss();
	// 		switch (editType) {
	// 			case AvatarEditType.OpenGallery:
	// 				this.service.openGallery()
	// 					.then(base64Image => {
	// 						this.base64Image = base64Image;
	// 					})
	// 					.catch(error => {
	// 						console.log(error)
	// 					})
	// 				break;
	// 			case AvatarEditType.TakePicture:
	// 				this.service.takePicture()
	// 					.then(base64Image => {
	// 						this.base64Image = base64Image;
	// 					})
	// 					.catch(error => {
	// 						console.log(error)
	// 					})
	// 				break;
	// 			default:
	// 				break;
	// 		}
	// }
}
