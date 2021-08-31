import { Component, OnInit, ViewChild } from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  LoadingController,
  ActionSheetController,
  Platform,
  ModalController,
} from '@ionic/angular';

import { Service } from '../../services/index';
import { CallType, IdDto, NetcastViewModel } from '../../models/index';

// import {
//     LoginPage,
//     Phone,
//     NetcasterPage
// } from '../index'
import { PhoneRingerComponent, CreateNetcastModalComponent, EditNetcastModalComponent } from '../../components/index';
import { NetcastDto } from '../../models/netcast.dto';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
// import { NetcastDetailsPage } from '../netcast-details/netcast-details.page';
// import { NetcasteePage } from '../netcastee/netcastee.page';

@Component({
  selector: 'app-netcast-list',
  templateUrl: './netcast-list.page.html',
  styleUrls: ['./netcast-list.page.scss'],
})
export class NetcastListPage implements OnInit {
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private service: Service,
    private platform: Platform,
    private modalCtrl: ModalController,
    private router: Router,

) { }

@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

  ngOnInit() {
  }
  timestamp: number;

  netcastVMs: NetcastViewModel[];

  netcasteeBaseUrl: string = this.service.netcasteeBaseUrl;

  receivePhoneLineInvitation: Subscription;
  receiveRemoteLogout: Subscription;

  // ionViewCanEnter(): Promise<boolean> {
  //     // guest
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

  ionViewWillEnter() {

      // fires each time user enters page but before the page actually becomes the active page
      // use ionViewDidEnter to run code when the page actually becomes the active page
      if (this.service.isSignalrConnected() === false) {
          this.service.startConnection();
      }

      this.service.isCheckedIntoHubConnection()
          .then(() => {
              return this.service.getAccessToken();
          })
          .then((accessToken: string) => {
              this.getNetcastsFromServer(accessToken);
          })
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
              //let alert = this.alertCtrl.create({
              //    title: "Debugging",
              //    message: "received remote logout: " + connectionId,
              //    buttons: ['OK']
              //})
              //alert.present();
    
              this.service.doLogout()
                  .catch((error) => {
                      console.log("app-shell.ts logOut error:", error);
                  })
                  .then(() => {
                     this.router.navigate(['login']);
                      // this.navCtrl.setRoot(LoginPage);
                  })
          });
      }
  }

  ionViewWillLeave() {

      //let alert = this.alertCtrl.create({
      //    title: "Debugging",
      //    message: "ionViewWillLeave() ",
      //    buttons: ['OK']
      //})
      //alert.present();




      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.endListeners();
      }
     

      this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
      this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
  }


  async getNetcastsFromServer(accessToken: string): Promise<void> {
      let loader = await this.loadingCtrl.create({
          message: "Please wait retrieving Netcast list...",
          duration: 5000
      });
      await loader.present();

      try {
          let idDto: IdDto = new IdDto();
          let memberId: string = await this.service.getMemberId();
          idDto.id = Number(memberId);
          console.log("idDto: ", idDto);
          let netcasts: NetcastDto[] = await this.service.getNetcastsByMemberId(idDto, accessToken);
          this.netcastVMs = new Array<NetcastViewModel>();
          if (!this.service.isEmpty(netcasts)) {
              netcasts.forEach((n: NetcastDto) => {
                  try {
                      let vm: NetcastViewModel = this.service.mapToNetcastViewModel(n);
                      this.netcastVMs.push(vm);
                  }
                  catch (e) {
                      // NOTE: console log for debugging
                      console.log("netcast-list.page getNetcastsFromServer caught error trying to map netcastDto to netcastViewModel: ", e);
                  }
              })

              this.timestamp = new Date().getTime();
              this.netcastVMs = this.netcastVMs.slice();

          }

      }
      catch (e) {
          console.log("netcast-list.page.ts getNetcastsFromServer() error: ", e);
          let alert = await this.alertCtrl.create({
              header: "Warning",
              message: "Unable to retrieve netcasts at this time. Please try again later.",
              buttons: ['OK']
          });
          await alert.present();

      }
      finally {
          loader && loader.dismiss();
      }


  }

  async reloadNetcastList(): Promise<void> {
      try {
          let accessToken: string = await this.service.getAccessToken();
          this.getNetcastsFromServer(accessToken);
      }
      catch (e) {
          console.log("reloadNetcastList error: ", e);
          let alert = await this.alertCtrl.create({
              header: "Error",
              message: "Unable to retrieve updated netcasts at this time. Please try again later.",
              buttons: ['OK']
          });
          await alert.present();
      }
  }

  async openCreateNetcastModal(): Promise<void> {
      try {
          let modal = await this.modalCtrl.create({
            component:CreateNetcastModalComponent
          });
          await modal.present()
          let {data} = await modal.onDidDismiss();
          if (!this.service.isEmpty(data)) {
              //success, update the netcast list.
              this.reloadNetcastList();
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
      console.log(netcastId);
      try {
          let accessToken: string = await this.service.getAccessToken();
          let netcast: NetcastDto = await this.service.getNetcastById(netcastId, accessToken);
          let modal = await this.modalCtrl.create({
            component:EditNetcastModalComponent, 
            componentProps: { castValue: netcast }
          });
          await modal.present()
          let {data} = await modal.onDidDismiss();
          if (!this.service.isEmpty(data)) {
              //success, update the netcast list.
              this.reloadNetcastList();
          }
          else {
              // nothing to do, user cancelled
          }
      }
      catch (e) {
          console.log("openEditNetcastModal error: ", e);
      }
  }

  async confirmDelete(netcastId: number): Promise<void> {
      let alert = await this.alertCtrl.create({
          header: 'Confirm Deletion',
          message: 'Do you want to delete this netcast?',
          buttons: [
              {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: () => {
                      console.log('Cancel clicked');
                  }
              },
              {
                  text: 'Delete',
                  handler: () => {
                      this.deleteNetcast(netcastId);
                  }
              }
          ]
      });
      await alert.present();
  }

  async deleteNetcast(netcastId: number): Promise<void> {
      console.log("delete netcastId: ", netcastId);
      try {
          let accessToken: string = await this.service.getAccessToken();
          let netcastDto: NetcastDto = await this.service.getNetcastById(netcastId, accessToken);
          await this.service.deleteNetcast(netcastDto, accessToken);
          await this.getNetcastsFromServer(accessToken);
      // perform the delete and update the netcast list
      }
      catch (e) {
          console.log("delete netcast error", e);
          let alert = await this.alertCtrl.create({
              header: "Error",
              message: "Unable to delete the netcast at this time. Please try again later.",
              buttons: ['OK']
          });
          await alert.present();
      }
     
  }

  gotoNetcastDetails(netcastId: number) {
    //   this.navCtrl.push(NetcastDetailsPage, { netcastId: netcastId });
    this.router.navigate(['netcast-details', {id: netcastId}]);
  }

  startNetcast(netcastId: number) {
      // this.navCtrl.setRoot(NetcasterPage, { netcastId: netcastId });
  }

  async openActionSheet(): Promise<void> {
      let actionSheet = await this.actionSheetCtrl.create({
          buttons: [
              {
                  text: 'Create A Netcast',
                  role: 'destructive',
                  icon: !this.platform.is('ios') ? 'add-circle' : null,
                  handler: () => {
                      this.openCreateNetcastModal();
                  }
              },
              {
                  text: 'Refresh List',
                  icon: !this.platform.is('ios') ? 'refresh-circle' : null,
                  handler: () => {
                      this.reloadNetcastList();
                  }
              },
              {
                  text: 'Close',
                  role: 'cancel', // will always sort to be on the bottom
                  icon: !this.platform.is('ios') ? 'close' : null
              }
          ]
      });
      await actionSheet.present();
  }
}
