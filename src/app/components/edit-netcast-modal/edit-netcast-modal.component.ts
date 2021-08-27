import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { NavController, AlertController, NavParams } from '@ionic/angular';
import { PhoneContactType, CallType, KeyValueType, FormsErrorMessageType, FormErrorTypeEnum, NetcastDto, SqlSearchPredicateDto, NetcastGenreDto, MemberType, NetcastViewModel } from '../../models/index'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
// import { EmailValidator } from '../../validators/index'
import {
    PhoneRingerComponent, PicPreviewComponent,
} from '../../components/index';
import {
    Service
} from '../../services/index'
// import { Phone, LoginPage } from '../../pages/index';
// import { dateValidator } from '../../validators/date.validator';
// import { DatePicker } from '@ionic-native/date-picker';

@Component({
  selector: 'app-edit-netcast-modal',
  templateUrl: './edit-netcast-modal.component.html',
  styleUrls: ['./edit-netcast-modal.component.scss'],
})
export class EditNetcastModalComponent implements OnInit {

  constructor(
	private navCtrl: NavController,
	// private events: Events,
	private navParams: NavParams,
	private fb: FormBuilder,
	// private viewCtrl: ViewController,
	private service: Service,
	private alertCtrl: AlertController,
	// private datePicker: DatePicker,
  ) {
	this.model = this.navParams.data as NetcastDto;
	this.viewModel = this.service.mapToNetcastViewModel(this.model);
	this.image = this.viewModel.imageSrc;

	this.isPrivate = this.viewModel.isPrivate;
	//this.netcastHourErrorMessage = new FormsErrorMessageType();
	//this.netcastMinuteErrorMessage = new FormsErrorMessageType();
	//this.netcastHourErrorMessage.errorTypeName = FormErrorTypeEnum.pattern;
	//this.netcastHourErrorMessage.displayValue = "Please enter a number between 1 and 12";
	//this.netcastMinuteErrorMessage.errorTypeName = FormErrorTypeEnum.pattern;
	//this.netcastMinuteErrorMessage.displayValue = "Please enter a number between 0 and 59";
	this.service.getAccessToken()
	    .then((accessToken: string) => {
	        let predicates = new SqlSearchPredicateDto();
	        predicates.orderBy = null;
	        predicates.paging = null;
	        predicates.sqlPredicates = null;
	        return this.service.getAllNetcastGenres(predicates, accessToken);
	    })
	    .then((n: NetcastGenreDto[]) => {
	        this.genres = new Array<KeyValueType>();
	        n.forEach((g) => {
	            let item = new KeyValueType();
	            item.key = g.value;
	            item.value = g.netcastGenreId;
	            this.genres.push(item);
	        });
	        this.genres = this.genres.slice();
	    })
	   
	    .catch((e) => {
	        console.log("EditNetcastModalComponent constructor error: ", e);
	    })

	this.createForm();
  }

	ngOnInit() {}
	@ViewChild(PicPreviewComponent) picPreview: PicPreviewComponent;

	newBase64Image: string;
    genres: KeyValueType[];

    //netcastHourErrorMessage: FormsErrorMessageType;
    //netcastMinuteErrorMessage: FormsErrorMessageType;

    defaultAvatar = this.service.defaultAvatar;

    //showNewDateTime: boolean = false;
    isPrivate: boolean;
    image: string = this.defaultAvatar;
    showRemoveImage: boolean = false;

    model: NetcastDto;
    viewModel: NetcastViewModel;
    formGroup: FormGroup

    createForm() {

        console.log("startDateTime: ", this.model.startDateTime);

        

        this.formGroup = this.fb.group({
            title: new FormControl(this.model.title, [
                Validators.maxLength(200),
                Validators.required

            ]),
            description: new FormControl(this.model.description, [
                Validators.maxLength(4000)
            ]),
            //isPrerecordered: new FormControl(0, [
            //    Validators.required
            //]),
            //localFileLocation: new FormControl('', [
            //    Validators.maxLength(500)
            //]),
            tags: new FormControl(this.model.tags, [
                Validators.maxLength(300)
            ]),
            isPrivate: new FormControl(this.model.isPrivate, [
                Validators.required
            ]),
            password: new FormControl(this.model.hPassword, [
                Validators.maxLength(25)
            ]),
            netcastTime: new FormControl(this.model.startDateTime.toISOString(), [
                Validators.required
            ]),
           
            avatarDataUri: new FormControl(''),
            netcastGenreId: new FormControl(this.model.netcastGenreId, [
                Validators.pattern('^[0-9]{1,5}$'),
                Validators.required
            ])
        });

    }

    onAvatarChanged(base64Image: string) {
        //console.log("onAvatarChanged: ", base64Image);

        //this.newBase64Image = base64Image;

        this.newBase64Image = base64Image;
        //console.log("onAvatarChanged");
        if (this.newBase64Image !== this.defaultAvatar) {

            this.showRemoveImage = true;
            //console.log("showRemoveImage: ", this.showRemoveImage);
        }
    }

    onImageSelected(imageDataUri: string): void {
        //console.log("form-add-contact.component.ts onImageSelected: imageDateUri: ", imageDataUri);
        //this.image = imageDataUri;

        this.image = imageDataUri;
        //console.log("onImageSelected");
        if (this.image !== this.defaultAvatar) {
            this.showRemoveImage = true;
        }
    }

    removeAvatar(): void {
        //this.image = this.defaultAvatar;
        //this.newBase64Image = "";
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

    //openCalendar(): void {
    //    this.datePicker.show({
    //        date: new Date(),
    //        mode: 'date',
    //        androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    //    }).then(
    //        date => {
    //            console.log('Got date: ', date);
    //            this.formGroup.controls.netcastDate.setValue(moment(date).format('MM/DD/YYYY'));
    //        },
    //        err => console.log('Error occurred while getting date: ', err)
    //    );

    //    console.log("this.formGroup: ", this.formGroup);

    //    console.log("get('netcastDate').errors: ", this.formGroup.controls.netcastDate.valid);
    //}

    //toggleShowNewDateTime(): void {
    //    if (this.showNewDateTime === false) {
    //        this.showNewDateTime = true;
    //    }
    //    else {
    //        this.showNewDateTime = false;
    //    }

    //}
    async submit(): Promise<void> {
        let originalContent: string = "";
        try {
            if (this.formGroup.valid) {
                let title = this.formGroup.get('title').value;
                let description = this.formGroup.get('description').value;
                //let netcastDateStr = this.formGroup.get('netcastDate').value;
                let netcastDateTime: string = this.formGroup.get('netcastTime').value;
                let isPrivate = this.formGroup.get('isPrivate').value;
                //let netcastHour: number = Number(this.formGroup.get('netcastHour').value);
                //let netcastMinute: number = Number(this.formGroup.get('netcastMinute').value);
                //let isPm = this.formGroup.get('isPm').value;
                let tags = this.formGroup.get('tags').value;
                let password = this.formGroup.get('password').value;
                let netcastGenreId = Number(this.formGroup.get('netcastGenreId').value);

                if (this.service.isEmpty(event) === false) {
                    originalContent = (<Element>event.target).innerHTML;
                    (<Element>event.target).innerHTML = '<i class="fa fa-spinner fa-spin"></i> Please Wait';
                    (<Element>event.target).setAttribute("disabled", "true");
                }

                this.model.title = title;
                this.model.description = description;
                this.model.tags = tags;
                this.model.netcastGenreId = netcastGenreId;

                if (password === this.model.hPassword) {
                    this.model.hPassword = password
                    this.model.isPrivate = true;
                }
                else if (password.length > 25) {
                    throw ("The password must be less than 25 characters");
                }
                else if (password.length >= 4 && password.length <= 25) {
                    this.model.hPassword = password;
                    this.model.isPrivate = true;
                }
                else {
                    this.model.isPrivate = false;
                    this.model.hPassword = "";
                }


                // TODO: remove these comments after testing the isPrivate and hPassword code
                //// check privacy, if is private, then require password if not already set
                //if (!this.service.isEmpty(isPrivate)) {
                //    if (this.service.isEmpty(password) && this.service.isEmpty(this.model.hPassword)) {
                //        throw ("Please enter a password if you wish to make your netcast private.");
                //    }
                //    else {
                //        this.model.isPrivate = true;
                //        if (!this.service.isEmpty(password)) {
                //            this.model.hPassword = password;
                //        }
                //    }
                //}
                //else {
                //    this.model.isPrivate = false;
                //    this.model.hPassword = "";
                //}


                // showNewDateTime === true and netcastDateStr not empty
                // and netcastHour not empty and netcastMinute not empty, and isPm not empty
                // then create the new schedule

                let netcastDate: moment.Moment = moment(netcastDateTime);
                //console.log("meetDate: ", meetDate);
                let currentDate: moment.Moment = moment();
                //console.log("currentDate: ", currentDate);
                if (currentDate > netcastDate) {
                    //console.log("in the past");

                    let alert = await this.alertCtrl.create({
                        header: "Please Check",
                        subHeader: "The netcast must be set in the future. Please choose a netcast date and time that is in the future.",
                        buttons: ['OK']
                    });
                    await alert.present();
                    throw ("The netcast must be set in the future. Please choose a netcast date and time that is in the future.");
                }

                this.model.startDateTime = netcastDate.toDate();

                //if (this.showNewDateTime === true && !this.service.isEmpty(netcastDateStr)) {
                //    let minutes: number;

                //    if (this.service.isEmpty(isPm) === false) {
                //        netcastHour = netcastHour < 12 ? netcastHour + 12 : netcastHour;
                //        minutes = (netcastHour * 60);
                //    }
                //    else if (netcastHour < 12) {
                //        minutes = (netcastHour * 60);
                //    }
                //    else {
                //        minutes = 0;
                //    }

                //    minutes = minutes + netcastMinute;

                //    let netcastDate: moment.Moment = moment(netcastDateStr).add(minutes, 'm');
                //    //console.log("meetDate: ", meetDate);
                //    let currentDate: moment.Moment = moment();
                //    //console.log("currentDate: ", currentDate);
                //    if (currentDate > netcastDate) {
                //        //console.log("in the past");

                //        let alert = this.alertCtrl.create({
                //            title: "Please Check",
                //            subTitle: "The netcast must be set in the future. Please choose a netcast date and time that is in the future.",
                //            buttons: ['OK']
                //        });
                //        alert.present();
                //        throw ("The netcast must be set in the future. Please choose a netcast date and time that is in the future.");
                //    }

                //    this.model.startDateTime = netcastDate.toDate();
                //}


                //let profile: MemberType = await this.service.getProfile();

                //let netcastDto = new NetcastDto();
                //netcastDto.title = title;
                //netcastDto.description = description;
                //netcastDto.isPrivate = isPrivate;
                //netcastDto.memberId = profile.memberId;
                //netcastDto.hPassword = password;
                //netcastDto.tags = tags;
                //netcastDto.netcastGenreId = netcastGenreId;

                



                let accessToken: string = await this.service.getAccessToken();

                let isDebugging: boolean = false;

                if (isDebugging) {
                    console.log("this.image: ", this.image);
                    console.log("this.newBase64Image: ", this.newBase64Image);
                    // this.viewCtrl.dismiss();
                }
                else {
                    let nc: NetcastDto = await this.service.updateNetcast(this.model, accessToken);
                    //console.log("nc: ", nc);
                    //console.log("netcastDataUriImage", this.netcastDataUriImage);
                    if (!this.service.isEmpty(this.newBase64Image)) {
                        let updatedNc: NetcastDto = await this.service.addNetcastImage(this.newBase64Image, nc.netcastId, accessToken);
                        //console.log("updatedNc: ", updatedNc);
                        nc = updatedNc;
                    }

                    if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                        // console.log("event: ", event);
                        (<Element>event.target).innerHTML = originalContent;
                        //(<Element>event.target).removeAttribute("disabled");
                    }
                    // this.viewCtrl.dismiss(nc);
                   
                }
                
               

               
            }
            else {

                let alert = await this.alertCtrl.create({
                    header: "Please Check",
                    subHeader: "Please make sure the form is filled out and any error messages are fixed.",
                    buttons: ['OK']
                });
                await alert.present();
            }
        }
        catch (error) {
            //TODO: Handle error

            //console.log("originalContent: ", originalContent);

            console.log("form-add-netcast.component.ts submit error:", error);

            if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                (<Element>event.target).innerHTML = originalContent;
                //(<Element>event.target).removeAttribute("disabled");
            }
            


            let alert = await this.alertCtrl.create({
                header: "Please Check",
                message: error,
                buttons: ['OK']
            });
            await alert.present();
        }
    }

    cancel(): void {
        // this.viewCtrl.dismiss();
    }
}
