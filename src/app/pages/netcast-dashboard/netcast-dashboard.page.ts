import { Component, OnInit, ViewChild } from '@angular/core';
import {
	NavController,
  ModalController,
} from '@ionic/angular';

import { Service } from '../../services/index';
import { CallType, NetcastDto } from '../../models/index';
import { PhoneRingerComponent, CreateNetcastModalComponent, EditNetcastModalComponent } from '../../components/index';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-netcast-dashboard',
  templateUrl: './netcast-dashboard.page.html',
  styleUrls: ['./netcast-dashboard.page.scss'],
})
export class NetcastDashboardPage implements OnInit {
	constructor(

		public navCtrl: NavController,
    private service: Service,
    private modalCtrl: ModalController,
    private router: Router,
	) {}

	@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

	isMember: boolean;
  isLoggedIn: boolean;
  receivePhoneLineInvitation: Subscription;
  receiveRemoteLogout: Subscription;

  ngOnInit() {
    if (this.service.isSignalrConnected() === false) {
        this.service.startConnection();
    }
  }

  ionViewDidEnter() {
  if (this.service.isEmpty(this.phoneRinger) === false) {
    this.phoneRinger.startListeners();
  }
  this.service.getObservable('receivePhoneLineInvitation').subscribe((call: CallType) => {
    if (this.service.isEmpty(call) === false) {
      this.service.acceptedCall = call;
      // this.navCtrl.setRoot(Phone);
      this.router.navigate(['phone']);

    }
  });

  this.service.getObservable('receiveRemoteLogout').subscribe((connectionId: string) => {
    this.service.doLogout()
      .catch((error) => {
        console.log("app-shell.ts logOut error:", error);
      })
      .then(() => {
        // this.navCtrl.setRoot(LoginPage);
        this.router.navigate(['login']);
      })
  });


  this.service.isMember()
    .then((isMember) => {
      this.isMember = isMember;
          });

      this.service.checkIsLoggedIn()
          .then((isLoggedIn: boolean) => {
              this.isLoggedIn = isLoggedIn;
          })
          .catch((e) => {
              console.log("netcast-dashboard.page ionViewDidEnter() checkIsLogged() error, ", e);
          })
  }

  ionViewWillLeave() {
    if (this.service.isEmpty(this.phoneRinger) === false) {
      this.phoneRinger.endListeners();
    }

    this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
    this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
  }

  gotoNetcastListPage(): void {
      // this.navCtrl.setRoot(NetcastListPage);
      this.router.navigate(['netcast-list']);
  }

  gotoNetcastSearchPage(): void {
      // this.navCtrl.setRoot(NetcastSearchPage);
      this.router.navigate(['netcast-search']);
  }

  async openCreateNetcastModal(): Promise<void> {
      try {
          let modal = await this.modalCtrl.create({
            component: CreateNetcastModalComponent
          });
          await modal.present()
          let {data} = await modal.onDidDismiss();
          if (!this.service.isEmpty(data)) {
            console.log(data);
              //success, update the netcast list.
              this.openEditNetcastModal(data.netcastId);

          }
          else {
              // nothing to do, user cancelled
          }
      }
      catch (e) {
          console.log("openCreateNetcastModal error: ", e);
      }
  }

  async openEditNetcastModal(netcastId: number): Promise<void> {
      try {
        let accessToken: string = await this.service.getAccessToken();
        let netcast: NetcastDto = await this.service.getNetcastById(netcastId, accessToken);
        console.log('before modal: ', accessToken, netcast);
          let modal = await this.modalCtrl.create({
            component: EditNetcastModalComponent, 
            componentProps: {castValue: netcast}
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
