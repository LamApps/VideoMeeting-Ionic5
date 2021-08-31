import { Component, OnInit, ViewChild } from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';

import { Service } from '../../services/index';
import { MeetingDto, StringIdDto, OrderByDto, CallType } from '../../models/index';
import { PhoneRingerComponent, MeetingDetailsComponent, EditMeetingModalComponent } from '../../components/index';
// import { MeetingsDashboardPage, MeetingPage, Phone, LoginPage } from '../index';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {

  constructor(
    private service: Service,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private router: Router,

) {
    this.loading = true;
}

@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

  ngOnInit() {
  }
  loading: boolean;
  isMember: boolean;
  isLoggedIn: boolean;
  meetings: Array<MeetingDto>;
  receivePhoneLineInvitation: Subscription;
  receiveRemoteLogout: Subscription;


  ionViewCanEnter(): Promise<boolean> {
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


      let accessToken: string;

      // TODO: Add paging and filtering ability feature

      this.service.isMember()
          .then((isMember) => {
              this.isMember = isMember;
          })
          .then(() => {
              return this.service.getAccessToken();
          })
          .then((token: string) => {
              return this.getUpcomingMeetingsFromServer(accessToken);
          })
          .then((meetings: Array<MeetingDto>) => {
              this.meetings = meetings;
              //console.log("this.meetings: ", this.meetings);
          })
          .catch((e) => {
              console.log("error while getting upcoming meetings: ", e);
          })
          .then(() => {
              this.loading = false;
          });
  }

  ionViewWillLeave() {
      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.endListeners();
      }

      this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
      this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
    }

  refreshMeetings(refresher) {
      console.log('Begin async operation', refresher);
      this.service.getAccessToken()
          .then((accessToken: string) => {
              return this.getUpcomingMeetingsFromServer(accessToken);
          })
          .then((meetings: Array<MeetingDto>) => {
              this.meetings = meetings;
          })
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

  async getUpcomingMeetingsFromServer(accessToken: string): Promise<Array<MeetingDto>> {
      try {
          let loader = await this.loadingCtrl.create({
              message: "Please wait...",
              duration: 5000
          });
          await loader.present();

          let meetings: Array<MeetingDto>;
          let dto = new StringIdDto();
          let email = await this.service.getEmail();
          dto.id = email;
          let orderby = new OrderByDto();
          orderby.column = "MeetDate";
          orderby.direction = "ASC";
          dto.orderBy = [orderby];
          meetings = await this.service.getUpcomingMeetings(dto, accessToken);
          loader && loader.dismiss();
          return meetings;
      }
      catch (e) {
          throw (e);
      }
  }

  gotoMeeting(meeting: MeetingDto) {
      //console.log("attend Meeting: ", meeting);
      // this.navCtrl.setRoot(MeetingPage, { meetingId: meeting.meetingId })
      this.router.navigate(['meeting', {id:meeting.meetingId}]);
  }

  async meetingDetails(meeting: MeetingDto) {
      let meetingDetailsModal = await this.modalCtrl.create({
        component: MeetingDetailsComponent, 
        componentProps:{ value:meeting}
      });
      await meetingDetailsModal.present();
  }

  gotoMeetingsDashboardPage() {
      // this.navCtrl.setRoot(MeetingsDashboardPage);
      this.router.navigate(['meeting-dashboard']);
  }

  async editMeeting(meeting: MeetingDto): Promise<void> {
      let modal = await this.modalCtrl.create({
        component: EditMeetingModalComponent, 
        componentProps:{ value: meeting}
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
}
