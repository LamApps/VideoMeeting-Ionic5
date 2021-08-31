import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import {
	NavController,
	AlertController,
	LoadingController,
	ModalController,
} from '@ionic/angular';
import { Service } from '../../services/index';
import { MeetingDto, StringIdDto, MeetingAttendeeDto, OrderByDto, CallType } from '../../models/index';
import { PhoneRingerComponent, MeetingDetailsComponent } from '../../components/index';
// import { Phone, LoginPage, MeetingsDashboardPage } from '../index';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meeting-invites',
  templateUrl: './meeting-invites.page.html',
  styleUrls: ['./meeting-invites.page.scss'],
})
export class MeetingInvitesPage implements OnInit {
	constructor(
		private alertCtrl: AlertController,
		public navCtrl: NavController,
		private loadingCtrl: LoadingController,
		private modalCtrl: ModalController,
		private service: Service,
		private ngZone: NgZone,
    private router: Router,
	) {
		this.loading = true;
		this.meetings = new Array<MeetingDto>();
	}

	@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;
  ngOnInit() {
  }
	loading: boolean;
	isMember: boolean;
	isLoggedIn: boolean;
	meetings: Array<MeetingDto>;
	email: string;
  receivePhoneLineInvitation: Subscription;
  receiveRemoteLogout: Subscription;


    ionViewCanenter(): Promise<boolean> {
        // guest
        return new Promise<boolean>(async (resolve) => {
            let canActivatePage: boolean = await this.service.canActivatePage();
            if (canActivatePage) {
                let isLoggedIn: boolean = await this.service.getIsLoggedIn();
                resolve(isLoggedIn);
            }
            else {
                resolve(false);
            }
        });
    }

    ionViewWillEnter() {
        // fires each time user enters page but before the page actually becomes the active page
        // use ionViewDidEnter to run code when the page actually becomes the active page
        if (this.service.isSignalrConnected() === false) {
            this.service.startConnection();
        }
    }

	ionViewDidEnter() {
		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.startListeners();
      this.receivePhoneLineInvitation = this.phoneRinger.getSubjects('receivePhoneLineInvitation').subscribe((call: CallType) => {
        if (this.service.isEmpty(call) === false) {
          this.service.acceptedCall = call;
          // this.navCtrl.setRoot(Phone);
          this.router.navigate(['phone']);
        }
      });
  
      this.receiveRemoteLogout = this.phoneRinger.getSubjects('receiveRemoteLogout').subscribe((connectionId: string) => {
        this.service.doLogout()
          .catch((error) => {
            console.log("app-shell.ts logOut error:", error);
          })
          .then(() => {
            // this.navCtrl.setRoot(LoginPage);
            this.router.navigate(['login']);
          })
      });

		}

    this.service.getEmail()
        .then((email: string) => {
            this.email = email;
            return;
        })
        .then(() => {
            return this.service.isMember();
        })
			.then((isMember) => {
				this.isMember = isMember;
			})
			.then(() => {
				return this.getInvitesFromServer();
			})
			.catch((e) => {
				this.alertCtrl.create({
					header: "Error",
					message: e,
					buttons: ["OK"]
				}).then((altRes)=>{
          altRes.present();
        })
			})
	}

	ionViewWillLeave() {
		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.endListeners();
		}

		this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
		this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
	}

	updateInvites(meetingAttendee: MeetingAttendeeDto): void {
		let index = this.meetings.findIndex((value) => {
			return value.meetingId == meetingAttendee.meetingId;
		})

		if (index > -1) {
			this.ngZone.run(() => {
				this.meetings.splice(index, 1);
			})
		}
	}

	refreshInvites(refresher) {
		console.log('Begin async operation', refresher);
		this.getInvitesFromServer()
			.catch((e) => {
				this.alertCtrl.create({
					header: "Please Check",
					message: e,
					buttons: ['OK']
				}).then((altRes)=>{
          altRes.present();
        })
			})
			.then(() => {
				refresher.complete();
			});
	}

	async getInvitesFromServer(): Promise<void> {
		try {
			let loader = await this.loadingCtrl.create({
				message: "Please wait...",
				duration: 5000
			});
			await loader.present();

			let accessToken: string;
			try {
				accessToken = await this.service.getAccessToken();
			}
			catch (e) {
				throw ("Unable to get access at this time. Please try again later.");
			}

			if (this.service.isEmpty(accessToken)) {
				throw ("Unable to get access at this time.");
			}

			let inviteList: Array<MeetingDto>;

			try {
				let dto: StringIdDto = new StringIdDto();
				dto.id = this.email;
				let orderBy = new OrderByDto();
				orderBy.column = "MeetDate";
				orderBy.direction = "DESC";
				dto.orderBy = [orderBy];
				// grab all meetings that is user has not rsvp (accept or deny)
				inviteList = await this.service.getMeetingsByAttendeeEmail(dto, accessToken);
			}
			catch (e) {
				throw ("Unable to get meeting invites.");
			}

			if (this.service.isEmpty(inviteList) === false) {
				this.meetings = inviteList;
			}

			loader && loader.dismiss();
		}
		catch (e) {
			this.alertCtrl.create({
				header: "Please Check",
				message: e,
				buttons: ['OK']
			}).then((altRes)=>{
        altRes.present();
      })
		}

		return;
	}

	async acceptRsvp(meeting: MeetingDto): Promise<void> {
		try {
			let attendee: MeetingAttendeeDto;

			if (this.service.isEmpty(meeting) === false) {
				attendee = meeting.meetingAttendees.find((value) => {
					return value.email.toLowerCase() == this.email.toLowerCase();
				});
			}

			if (this.service.isEmpty(attendee) === false) {
				attendee.rsvp = true;
				let accessToken = await this.service.getAccessToken()
				if (this.service.isEmpty(accessToken)) {
					throw ("Access Denied.");
				}

				let updated: MeetingAttendeeDto = await this.service.updateMeetingAttendee(attendee, accessToken);
				if (this.service.isEmpty(updated) === false) {
					this.updateInvites(updated);
					this.alertCtrl.create({
						header: "SUCCESS",
						message: "Your RSVP was sent. This meeting has been added to your Scheduled Meetings list",
						buttons: ['OK']
					}).then((altRes)=>{
            altRes.present();
          })
				}
				else {
					throw ("RSVP request failed");
				}
			}
			else {
				throw ("Missing invitation information");
			}
		}
		catch (e) {
			this.alertCtrl.create({
				header: "Please Check",
				message: e,
				buttons: ['OK']
			}).then((altRes)=>{
        altRes.present();
      })
		}
	}

	async denyRsvp(meeting: MeetingDto): Promise<void> {
		try {
			let attendee: MeetingAttendeeDto;

			if (this.service.isEmpty(meeting) === false) {
				attendee = meeting.meetingAttendees.find((value) => {
					return value.email.toLowerCase() == this.email.toLowerCase();
				});
			}

			if (this.service.isEmpty(attendee) === false) {
				attendee.rsvp = false;
				let accessToken = await this.service.getAccessToken()
				if (this.service.isEmpty(accessToken)) {
					throw ("Access Denied.");
				}

				let updated: MeetingAttendeeDto = await this.service.updateMeetingAttendee(attendee, accessToken);
				if (this.service.isEmpty(updated) === false) {
					this.updateInvites(updated);

					this.alertCtrl.create({
						header: "SUCCESS",
						message: "Your RSVP was sent. All meeting attendees will be notified, you are not attending.",
						buttons: ['OK']
					}).then((altRes)=>{
            altRes.present();
          })
				}
				else {
					throw ("RSVP request failed");
				}
			}
			else {
				throw ("Missing invitation information");
			}
		}
		catch (e) {
			this.alertCtrl.create({
				header: "Please Check",
				message: e,
				buttons: ['OK']
			}).then((altRes)=>{
        altRes.present();
      })
		}
	}

	async meetingDetails(meeting: MeetingDto) {
		let meetingDetailsModal = await this.modalCtrl.create({
      component: MeetingDetailsComponent, 
      componentProps: {meeting}
    });
		await meetingDetailsModal.present();
	}

	gotoMeetingsDashboardPage() {
		// this.navCtr÷l.setRoot(MeetingsDashboardPage);
    this.router.navigate(['meeting-dashboard']);
	}
}
