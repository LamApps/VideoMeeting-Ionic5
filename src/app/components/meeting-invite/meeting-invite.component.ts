import { Component, OnInit, Input } from '@angular/core';

import {
	MeetingDto,
	MeetingAttendeeDto,
} from "../../models/index";
import { Service } from "../../services/index";

import * as moment from 'moment';

@Component({
  selector: 'app-meeting-invite',
  templateUrl: './meeting-invite.component.html',
  styleUrls: ['./meeting-invite.component.scss'],
})
export class MeetingInviteComponent implements OnInit {

	constructor(
		private service: Service,
	) {
	}

	@Input('meeting') inputMeeting: MeetingDto;
	@Input('email') inputEmail: string;
	
	_meeting: MeetingDto;
	get meeting(): MeetingDto {
		return this._meeting;
	}
	set meeting(value: MeetingDto) {
		this._meeting = value;
		if (this.service.isEmpty(value) === false) {
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
		}
	}

	meetingId: number;
	title: string;
	description: string;
	fullDescription: string;
	meetDateTime: string;
	duration: string;
	isPrivate: string;
	email: string;
	attendee: MeetingAttendeeDto;

	ngOnInit() {
		this.meeting = this.inputMeeting;
		this.email = this.inputEmail;
		//console.log("email: ", this.email);
		//console.log("meeting: ", this.meeting);

		if (this.service.isEmpty(this.meeting) === false) {
			this.attendee = this.meeting.meetingAttendees.find((value) => {
				return value.email.toLowerCase() == this.email.toLowerCase();
			});
		}
	}

}
