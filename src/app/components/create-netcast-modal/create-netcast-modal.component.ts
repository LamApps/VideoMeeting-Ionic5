import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ModalController,AlertController } from '@ionic/angular';
import { KeyValueType, NetcastDto, SqlSearchPredicateDto, NetcastGenreDto, MemberType } from '../../models/index'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'

import {
    Service
} from '../../services/index'

import { PicPreviewComponent } from '../pic-preview/pic-preview.component';

@Component({
  selector: 'app-create-netcast-modal',
  templateUrl: './create-netcast-modal.component.html',
  styleUrls: ['./create-netcast-modal.component.scss'],
})
export class CreateNetcastModalComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private service: Service,
    private alertCtrl: AlertController,
  ) {
    this.model = new NetcastDto();
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

    this.createForm();
  }

  ngOnInit() {}

  @ViewChild(PicPreviewComponent) picPreview: PicPreviewComponent;

  newBase64Image: string;

    genres: KeyValueType[];

    //netcastTime: string;

    //netcastHourErrorMessage: FormsErrorMessageType;
    //netcastMinuteErrorMessage: FormsErrorMessageType;

    defaultAvatar = this.service.defaultAvatar;

    image: string = this.defaultAvatar;

    showRemoveImage: boolean = false;

    model: NetcastDto;
    formGroup: FormGroup

    createForm() {
        this.formGroup = this.fb.group({
            title: new FormControl('', [
                Validators.maxLength(200),
                Validators.required

            ]),
            description: new FormControl('', [
                Validators.maxLength(4000)
            ]),
            //isPrerecordered: new FormControl(0, [
            //    Validators.required
            //]),
            //localFileLocation: new FormControl('', [
            //    Validators.maxLength(500)
            //]),
            tags: new FormControl('', [
                Validators.maxLength(300)
            ]),
            isPrivate: new FormControl(0, [
                Validators.required
            ]),
            password: new FormControl('', [
                Validators.maxLength(25)
            ]),
            netcastTime: new FormControl('', [
                Validators.required
            ]),
            //netcastDate: new FormControl('', [
            //    dateValidator,
            //    Validators.required
            //]),
            //netcastHour: new FormControl('', [
            //    Validators.required,
            //    Validators.pattern('^[0-9]{1,2}$'),
            //    Validators.max(12),
            //    Validators.min(1)
            //]),
            //netcastMinute: new FormControl('', [
            //    Validators.required,
            //    Validators.pattern('^[0-9]{1,2}$'),
            //    Validators.max(59),
            //    Validators.min(0)
            //]),
            //netcastTime: new FormControl('', [

            //]),
            //isPm: new FormControl(true, [
            //    Validators.required
            //]),
            avatarDataUri: new FormControl(''),
            netcastGenreId: new FormControl('', [
                Validators.pattern('^[0-9]{1,5}$'),
                Validators.required
            ])
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
    async submit(): Promise<void> {
        let originalContent: string;
        try {
            if (this.formGroup.valid) {
                let title: string = this.formGroup.get('title').value;
                let description: string = this.formGroup.get('description').value;
                //let netcastDateStr = this.formGroup.get('netcastDate').value;
                let netcastDateTime: string = this.formGroup.get('netcastTime').value;
                let isPrivate: boolean = this.formGroup.get('isPrivate').value;
                //let netcastHour: number = Number(this.formGroup.get('netcastHour').value);
                //let netcastMinute: number = Number(this.formGroup.get('netcastMinute').value);
                //let isPm = this.formGroup.get('isPm').value;
                let tags: string = this.formGroup.get('tags').value;
                let password: string = this.formGroup.get('password').value;
                let netcastGenreId: number = Number(this.formGroup.get('netcastGenreId').value);

                if (this.service.isEmpty(event) === false) {
                    originalContent = (<Element>event.target).innerHTML;
                    (<Element>event.target).innerHTML = '<i class="fa fa-spinner fa-spin"></i> Please Wait';
                    (<Element>event.target).setAttribute("disabled", "true");
                }

                let profile: MemberType = await this.service.getProfile();

                let netcastDto = new NetcastDto();
                netcastDto.title = title;
                netcastDto.description = description;
                netcastDto.isPrivate = isPrivate;
                netcastDto.memberId = profile.memberId;
                netcastDto.hPassword = password;
                netcastDto.tags = tags;
                netcastDto.netcastGenreId = netcastGenreId;

                
                //let minutes: number;

                //if (this.service.isEmpty(isPm) === false) {
                //    netcastHour = netcastHour < 12 ? netcastHour + 12 : netcastHour;
                //    minutes = (netcastHour * 60);
                //}
                //else if (netcastHour < 12) {
                //    minutes = (netcastHour * 60);
                //}
                //else {
                //    minutes = 0;
                //}

                //minutes = minutes + netcastMinute;

                //let netcastDate: moment.Moment = moment(netcastDateStr).add(minutes, 'm');
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

                netcastDto.startDateTime = netcastDate.toDate();



                let accessToken: string = await this.service.getAccessToken();


                let isDebugging = false;

                if (!isDebugging) {
                    let nc: NetcastDto = await this.service.createNetcast(netcastDto, accessToken);
                    //console.log("nc: ", nc);
                    //console.log("netcastDataUriImage", this.netcastDataUriImage);
                    if (!this.service.isEmpty(this.newBase64Image)) {
                        let updatedNc: NetcastDto = await this.service.addNetcastImage(this.newBase64Image, nc.netcastId, accessToken);
                        //console.log("updatedNc: ", updatedNc);
                        nc = updatedNc;
                    }

                    if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                        (<Element>event.target).innerHTML = originalContent;
                        //(<Element>event.target).removeAttribute("disabled");
                    }
                    // this.viewCtrl.dismiss(nc);
                }
                else {
                    console.log("this.image: ", this.image);
                    console.log("this.newBase64Image: ", this.newBase64Image);
                    // this.viewCtrl.dismiss();
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

            if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                (<Element>event.target).innerHTML = originalContent;
                //(<Element>event.target).removeAttribute("disabled");
            }
            console.log("form-add-netcast.component.ts submit error:", error);


            let alert = await this.alertCtrl.create({
                header: "Please Check",
                subHeader: "Sorry, unable to create netcast. Please try again later.",
                buttons: ['OK']
            });
            await alert.present();
        }
    }

    cancel(): void {
        // this.viewCtrl.dismiss();
    }
}
