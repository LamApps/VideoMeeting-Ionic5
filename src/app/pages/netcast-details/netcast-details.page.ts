import { Component, OnInit, ViewChild } from '@angular/core';
import {
	NavController,
  LoadingController,
} from '@ionic/angular';

import { Service } from '../../services/index';
import { CallType, NetcastDto, NetcastViewModel } from '../../models/index';

import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { PhoneRingerComponent } from '../../components/index';

@Component({
  selector: 'app-netcast-details',
  templateUrl: './netcast-details.page.html',
  styleUrls: ['./netcast-details.page.scss'],
})
export class NetcastDetailsPage implements OnInit {

	constructor(

		public navCtrl: NavController,
    private service: Service,
    private loadingCtrl: LoadingController,
    private router: Router,
    private route: ActivatedRoute,

    ) {
        this.netcastVM = null;
    }
  ngOnInit() {
    if (this.service.isSignalrConnected() === false) {
      this.service.startConnection();
    }
    this.route.queryParams.subscribe(params => {
      this.netcastId = params['id'];
    });
  }

	@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

    isMember: boolean;
    isLoggedIn: boolean;

    netcastId: number;
    netcast: NetcastDto;
    netcastVM: NetcastViewModel;
    receivePhoneLineInvitation: Subscription;
    receiveRemoteLogout: Subscription;
  
  
    // ionViewCanEnter(): Promise<boolean> {
    //     // guest
    //     return new Promise<boolean>(async (resolve) => {
    //         let canActivatePage: boolean = await this.service.canActivatePage();
    //         if (canActivatePage) {
    //             resolve(true);
    //         }
    //         else {
    //             resolve(false);
    //         }
    //     });
    // }


    ionViewDidEnter() {
      let loader:HTMLIonLoadingElement;
      this.loadingCtrl.create({
          message: "Please wait...",
          duration: 5000
      }).then((loadRes)=>{
        loadRes.present();
        loader = loadRes;
      });

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

          this.service.checkIsLoggedIn()
              .then((isLoggedIn: boolean) => {
                  this.isLoggedIn = isLoggedIn;
              })
              .catch((e) => {
                  console.log("netcast-dashboard.page ionViewDidEnter() checkIsLogged() error, ", e);
              })



        console.log("this.netcastId: ", this.netcastId);

        let accessToken: string;
        this.service.getAccessToken()
            .then((token: string) => {
                accessToken = token;
                return;
            })
            .then(() => {
                return this.service.getNetcastById(this.netcastId, accessToken);
            })
            .then((netcastDto: NetcastDto) => {
                this.netcast = netcastDto;
                return;
            })
            .then(() => {
                this.netcastVM = this.service.mapToNetcastViewModel(this.netcast);
            })
            .catch((e) => {
                console.log("Error trying to get netcast details: ", e);
            })
            .then(() => {
                loader && loader.dismiss();
            });

	}

	ionViewWillLeave() {
		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.endListeners();
		}
    this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
    this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
		// this.events.unsubscribe("phoneRinger:receivePhoneLineInvitation:accepted");
		// this.events.unsubscribe("phoneRinger:receiveRemoteLogout");
    }

    viewNetcast(): void {
      this.router.navigate(['netcastee', {id: this.netcastId}]);
        // this.navCtrl.setRoot(NetcasteePage, { netcastId: this.netcastId });
    }

    close(): void {
        this.navCtrl.pop();
    }
}
