import { Component, OnInit, Input } from '@angular/core';
import {
	MeetingDto,
	MeetingAttendeeDto,
} from "../../models/index";
import { Service } from "../../services/index";

import * as moment from 'moment';

@Component({
  selector: 'app-meeting-item',
  templateUrl: './meeting-item.component.html',
  styleUrls: ['./meeting-item.component.scss'],
})
export class MeetingItemComponent implements OnInit {

	constructor(
		private service: Service,

	) {
		this.canAttend = false;
		this.attendees = new Array<MeetingAttendeeDto>();
	}

	@Input('meeting') inputMeeting: MeetingDto;

	_meeting: MeetingDto;
	get meeting(): MeetingDto {
		return this._meeting;
	}
	set meeting(value: MeetingDto) {
		this._meeting = value;
		if (this.service.isEmpty(value) === false) {
			this.canAttend = this.service.canEnterMeetingTime(value);

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

			//console.log("meetDate: " + value.title, value.meetDate);

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
	canAttend: boolean;
	canEdit: boolean;
	canDelete: boolean;

	attendees: Array<MeetingAttendeeDto>;

	ngOnInit() {
		this.meeting = this.inputMeeting;
		this.attendees = this.meeting.meetingAttendees;
	}

}
