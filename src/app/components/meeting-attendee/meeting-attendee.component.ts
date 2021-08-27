import { Component, OnInit, Input } from '@angular/core';
import {
	MeetingAttendeeDto,
} from "../../models/index";
import { Service } from "../../services/index";

@Component({
  selector: 'app-meeting-attendee',
  templateUrl: './meeting-attendee.component.html',
  styleUrls: ['./meeting-attendee.component.scss'],
})
export class MeetingAttendeeComponent implements OnInit {

	constructor(
		private service: Service,
	) {
	}
	@Input('meetingAttendee') inputMeetingAttendee: MeetingAttendeeDto;

	_meetingAttendee: MeetingAttendeeDto;
	get meetingAttendee(): MeetingAttendeeDto {
		return this._meetingAttendee;
	}
	set meetingAttendee(value: MeetingAttendeeDto) {
		this._meetingAttendee = value;
		if (this.service.isEmpty(value) === false) {
			this.name = value.name;
			this.email = value.email;
			if (typeof value.rsvp === "undefined" || value.rsvp === null) {
				this.rsvp = "Waiting On RSVP";
			}
			else if (value.rsvp === false) {
				this.rsvp = "Not Attending";
			}
			else if (value.rsvp === true) {
				this.rsvp = "Attending";
			}
			this.imgSrc = (this.service.isEmpty(value.member) === false && this.service.isEmpty(value.member.avatarFileName) === false) ?
				this.service.avatarBaseUrl + value.member.avatarFileName + "?" + Date.now().toString() : this.service.defaultAvatar;
		}
	}

	imgSrc: string;
	name: string;
	email: string;
	rsvp: string;

	ngOnInit() {
		this.meetingAttendee = this.inputMeetingAttendee;
	}
}
