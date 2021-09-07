import { Component, Input, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import { AlertController, ModalController } from '@ionic/angular';
import { PhoneContactType, CallType, KeyValueType, FormsErrorMessageType, FormErrorTypeEnum, NetcastDto, SqlSearchPredicateDto, NetcastGenreDto, MemberType, NetcastViewModel, MeetingDto } from '../../models/index'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
// import { EmailValidator } from '../../validators/index'
// import {
//     PhoneRingerComponent, PicPreviewComponent,
// } from '../../components/index';
import {
    Service
} from '../../services/index'
// import { Phone, LoginPage } from '../../pages/index';
// import { dateValidator } from '../../validators/date.validator';
// import { DatePicker } from '@ionic-native/date-picker/ngx';

@Component({
  selector: 'app-edit-meeting-modal',
  templateUrl: './edit-meeting-modal.component.html',
  styleUrls: ['./edit-meeting-modal.component.scss'],
})
export class EditMeetingModalComponent implements OnInit {
  @Input() value:any;
  constructor(
	// private events: Events,
	private fb: FormBuilder,
	private viewCtrl: ModalController,
	private service: Service,
	private alertCtrl: AlertController,
	// private datePicker: DatePicker,
  ) {

  }

  ngOnInit() {
    this.model = this.value;
    console.log(this.model);
    this.createForm();
  }
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

    model: MeetingDto;
   
    formGroup: FormGroup

    createForm() {

        this.formGroup = this.fb.group({
            title: new FormControl(this.model.title, [
                Validators.maxLength(200),
                Validators.required

            ]),
            description: new FormControl(this.model.description, [
                Validators.maxLength(4000)
            ]),
           

            meetingTime: new FormControl(this.model.meetDate.toISOString(), [
                Validators.required
            ]),
           

            meetingLength: new FormControl(this.model.meetLength, [
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
        let originalContent: string = "";
        try {
            if (this.formGroup.valid) {

                console.log("formGroup: ", this.formGroup);

                let title = this.formGroup.get('title').value;
                //console.log("get.value title");
                let description = this.formGroup.get('description').value;
                //console.log("get.value description");
                let meetingDateTime: string = this.formGroup.get('meetingTime').value;
                console.log("get.value meetingTime: ", meetingDateTime);
                let meetingLength = Number(this.formGroup.get('meetingLength').value);
                //console.log("get.value meetingLength");

                if (this.service.isEmpty(event) === false) {
                    originalContent = (<Element>event.target).innerHTML;
                    (<Element>event.target).innerHTML = '<i class="fa fa-spinner fa-spin"></i> Please Wait';
                    (<Element>event.target).setAttribute("disabled", "true");
                }

                this.model.title = title;
                this.model.description = description;

                this.model.meetLength = meetingLength;

                let meetDate: moment.Moment = moment(meetingDateTime);
                console.log("meetDate: ", meetDate);
                let currentDate: moment.Moment = moment();
                console.log("currentDate: ", currentDate);
                if (currentDate > meetDate) {
                    //console.log("in the past");

                    let alert = await this.alertCtrl.create({
                        header: "Please Check",
                        subHeader: "The meeting must be set in the future. Please choose a meeting date and time that is in the future.",
                        buttons: ['OK']
                    });
                    await alert.present();
                    throw ("The meeting must be set in the future. Please choose a netcast date and time that is in the future.");
                }

                this.model.meetDate = meetDate.toDate();

                let accessToken: string = await this.service.getAccessToken();

                let isDebugging: boolean = false;

                if (isDebugging) {
                  
                    this.viewCtrl.dismiss();
                }
                else {
                    let meetingDto: MeetingDto = await this.service.updateMeeting(this.model, accessToken);
                    if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                        // console.log("event: ", event);
                        (<Element>event.target).innerHTML = originalContent;
                        //(<Element>event.target).removeAttribute("disabled");
                    }
                    this.viewCtrl.dismiss(meetingDto);
                   
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

            console.log("edit meeting error:", error);

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
        this.viewCtrl.dismiss();
    }
}
