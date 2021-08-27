import { Component, OnInit, Input } from '@angular/core';

import * as moment from 'moment';
import {
	NavParams,
} from '@ionic/angular';
import {
	MeetingDto,
	MeetingAttendeeDto,
} from "../../models/index";
import { Service } from "../../services/index";

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.scss'],
})
export class MeetingDetailsComponent implements OnInit {

	constructor(
		private navParams: NavParams,
		private service: Service,
		// private viewCtrl: ViewController,
	) {
		this.allowAttend = false;
		// this.meeting = this.navParams.data;
	}

	@Input('meeting') inputMeeting: MeetingDto;

	ngOnInit() {}
	
	_meeting: MeetingDto;
	get meeting(): MeetingDto {
		return this._meeting;
	}
	set meeting(value: MeetingDto) {
		this._meeting = value;
		if (this.service.isEmpty(value) === false) {
			this.allowAttend = this.service.canEnterMeetingTime(value);

			this.meetingId = value.meetingId;
			this.title = value.title;
			this.description = this.service.isEmpty(value.description) ? "" : value.description.substring(0, 500);
			this.fullDescription = value.description;
			this.isPrivate = this.service.isEmpty(value.isPrivate) ? "Open" : "Private";
			if (value.meetLength < 60) {
				this.duration = value.meetLength.toString() + " Min";
			}
			else {
				let hours = Math.floor(value.meetLength / 60);
				let minutes = value.meetLength % 60;
				this.duration = hours.toString() + " Hr " + minutes.toString() + " Min";
			}

			this.meetDateTime = moment(value.meetDate).format('ddd @ hh:mm A, MM/DD/YY');
			this.attendees = value.meetingAttendees;
		}
	}

	meetingId: number;
	title: string;
	description: string;
	fullDescription: string;
	meetDateTime: string;
	duration: string;
	isPrivate: string;
	allowAttend: boolean;

	attendees: Array<MeetingAttendeeDto>;

	close() {
		// this.viewCtrl.dismiss();
	}
}
