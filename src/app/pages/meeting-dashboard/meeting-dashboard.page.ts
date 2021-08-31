import { Component, OnInit, ViewChild } from '@angular/core';
import {
	NavController,
  ModalController,
} from '@ionic/angular';

import { Service } from '../../services/index';
import { CallType, MeetingDto } from '../../models/index';

// import {
// 	MeetingsPage,
// 	MeetingInvitesPage,
// 	PastMeetingsPage,
// 	LoginPage,
// 	Phone
// } from '../index'
import { PhoneRingerComponent, CreateMeetingModalComponent, EditMeetingModalComponent } from '../../components/index';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meeting-dashboard',
  templateUrl: './meeting-dashboard.page.html',
  styleUrls: ['./meeting-dashboard.page.scss'],
})
export class MeetingDashboardPage implements OnInit {

	constructor(

		public navCtrl: NavController,
    private modalCtrl: ModalController,
    private service: Service,
    private router: Router,
	) {
	}

	@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

	isMember: boolean;

  receivePhoneLineInvitation: Subscription;
  receiveRemoteLogout: Subscription;

  ngOnInit() {
    if (this.service.isSignalrConnected() === false) {
        this.service.startConnection();
    }
  }
    // ionViewCanEnter(): Promise<boolean> {
    //     // member
    //     return new Promise<boolean>(async (resolve) => {
    //         let canActivatePage: boolean = await this.service.canActivatePage();
    //         if (canActivatePage) {
    //             let accessToken: string = await this.service.getAccessToken();
    //             let memberId: string = this.service.extractMemberId(accessToken);

    //             if (this.service.isEmpty(memberId) === false) {
    //                 resolve(true);
    //             }
    //             else {
    //                 resolve(false);
    //             }
    //         }
    //         else {
    //             resolve(false);
    //         }
    //     });
    // }

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


		this.service.isMember()
			.then((isMember) => {
				this.isMember = isMember;
			});
	}

	ionViewWillLeave() {
		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.endListeners();
		}

		this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
		this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
	}

	gotoMeetingsPage() {
		// this.navCtrl.setRoot(MeetingsPage);
    this.router.navigate(['mettings']);
	}

	gotoMeetingInvitesPage() {
		// this.navCtrl.setRoot(MeetingInvitesPage);
    this.router.navigate(['metting-invites']);
	}

	gotoPastMeetingsPage() {
		// this.navCtrl.setRoot(PastMeetingsPage);
    this.router.navigate(['past-meetings']);
  }

  async openCreateMeetingModal(): Promise<void> {
      try {
          let modal = await this.modalCtrl.create({
            component: CreateMeetingModalComponent
          });
          await modal.present()
          let { data } = await modal.onDidDismiss();
          if (!this.service.isEmpty(data)) {
              //success, update the netcast list.
              this.openEditMeetingModal(data.meetingId);

          }
          else {
              // nothing to do, user cancelled
          }
      }
      catch (e) {
          console.log("openCreateNetcastModal error: ", e);
      }
  }

    async openEditMeetingModal(meetingId: number): Promise<void> {
        try {
            let accessToken: string = await this.service.getAccessToken();
            let meeting: MeetingDto = await this.service.getMeetingById(meetingId, accessToken);
            let modal = await this.modalCtrl.create({
              component: EditMeetingModalComponent, 
              componentProps:{ value: meeting }
            });
            await modal.present()
            let { data } = await modal.onDidDismiss();
            if (!this.service.isEmpty(data)) {
                //success, update the netcast list.


            }
            else {
                // nothing to do, user cancelled
            }
        }
        catch (e) {
            console.log("openEditNetcastModal error: ", e);
        }
    }


}
