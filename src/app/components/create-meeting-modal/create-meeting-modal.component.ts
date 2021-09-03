import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ModalController,AlertController } from '@ionic/angular';
import { KeyValueType, MemberType, MeetingDto } from '../../models/index'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'

import {
    Service
} from '../../services/index'
// import { PicPreviewComponent } from '../pic-preview/pic-preview.component';

@Component({
  selector: 'app-create-meeting-modal',
  templateUrl: './create-meeting-modal.component.html',
  styleUrls: ['./create-meeting-modal.component.scss'],
})
export class CreateMeetingModalComponent implements OnInit {

  constructor(
        private fb: FormBuilder,
        private viewCtrl: ModalController,
        private service: Service,
        private alertCtrl: AlertController,
  	) {
        this.model = new MeetingDto();
        this.createForm();
  }

  ngOnInit() {}

      model: MeetingDto;
    formGroup: FormGroup

    lengths: Array<KeyValueType> = [
        { 'key': '15 Minutes', 'value': 15 },
        { 'key': '30 Minutes', 'value': 30 },
        { 'key': '45 Minutes', 'value': 45 },
        { 'key': '1 Hour', 'value': 60 },
        { 'key': '1 Hr 15 Min', 'value': 75 },
        { 'key': '1 Hr 30 Min', 'value': 90 },
        { 'key': '1 Hr 45 Min', 'value': 105 },
        { 'key': '2 Hr', 'value': 120 },
        { 'key': '2 Hr 30 Min', 'value': 150 },
        { 'key': '3 Hr', 'value': 180 },
        { 'key': '3 Hr 30 Min', 'value': 210 },
        { 'key': '4 Hr', 'value': 240 },
        { 'key': '5 Hr', 'value': 300 },
        { 'key': '6 Hr', 'value': 360 }
    ];

    createForm() {
        this.formGroup = this.fb.group({
            title: new FormControl('', [
                Validators.maxLength(200),
                Validators.required

            ]),
            description: new FormControl('', [
                Validators.maxLength(4000)
            ]),
          
            meetingTime: new FormControl('', [
                Validators.required
            ]),
            meetingLength: new FormControl('', [
                Validators.pattern('^[0-9]{1,3}$'),
                Validators.required
            ])
        });

    }

  
    async popup(title: string, message: string) {
        let alert = await this.alertCtrl.create({
            header: title,
            message: message,
            buttons: ['OK']
        });
        await alert.present();
    }

    async submit(): Promise<void> {
        let originalContent: string;
        try {
            if (this.formGroup.valid) {
                let title: string = this.formGroup.get('title').value;
                let description: string = this.formGroup.get('description').value;
                //let netcastDateStr = this.formGroup.get('netcastDate').value;
                let meetingDateTime: string = this.formGroup.get('meetingTime').value;
               
                let meetingLength: number = Number(this.formGroup.get('meetingLength').value);

                if (this.service.isEmpty(event) === false) {
                    originalContent = (<Element>event.target).innerHTML;
                    (<Element>event.target).innerHTML = '<i class="fa fa-spinner fa-spin"></i> Please Wait';
                    (<Element>event.target).setAttribute("disabled", "true");
                }

                let profile: MemberType = await this.service.getProfile();

                let meetingDto = new MeetingDto();
                meetingDto.title = title;
                meetingDto.description = description;
                meetingDto.isPrivate = false;
                meetingDto.memberId = profile.memberId;

                meetingDto.meetLength = meetingLength;

                
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
                let meetDate: moment.Moment = moment(meetingDateTime);
                //console.log("meetDate: ", meetDate);
                let currentDate: moment.Moment = moment();
                //console.log("currentDate: ", currentDate);
                if (currentDate > meetDate) {
                    //console.log("in the past");

                    let alert = await this.alertCtrl.create({
                        header: "Please Check",
                        subHeader: "The meeting must be set in the future. Please choose a meeting date and time that is in the future.",
                        buttons: ['OK']
                    });
                    await alert.present();
                    throw ("The meeting must be set in the future. Please choose a meeting date and time that is in the future.");
                }

                meetingDto.meetDate = meetDate.toDate();

                let accessToken: string = await this.service.getAccessToken();

                let isDebugging = false;

                if (!isDebugging) {
                    let meeting: MeetingDto = await this.service.createMeeting(meetingDto, accessToken);
                    //console.log("nc: ", nc);
                    //console.log("netcastDataUriImage", this.netcastDataUriImage);
                  

                    if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                        (<Element>event.target).innerHTML = originalContent;
                        //(<Element>event.target).removeAttribute("disabled");
                    }
                    this.viewCtrl.dismiss(meeting);
                }
                else {
                   
                    this.viewCtrl.dismiss();
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
            console.log("create meeting:", error);


            let alert = await this.alertCtrl.create({
                header: "Please Check",
                subHeader: "Sorry, unable to create the meeting. Please try again later.",
                buttons: ['OK']
            });
            await alert.present();
        }
    }

    cancel(): void {
        this.viewCtrl.dismiss();
    }

}
