import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';
import {
	NavController,
	NavParams,
	AlertController,
	LoadingController,
} from '@ionic/angular';
import {
	Service,
} from '../../services/index';
import {
	ListItemType,
	CompanyProfileDto,
	PbxLineDto,
	IdDto,
	CallType,
} from "../../models/index";
import { PhoneRingerComponent } from '../../components/index';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.page.html',
  styleUrls: ['./company-profile.page.scss'],
})
export class CompanyProfilePage implements OnInit {

  constructor(
    private alertCtrl: AlertController,
		public navCtrl: NavController,
		public navParams: NavParams,
		private service: Service,
		private loadingCtrl: LoadingController,
    private route: ActivatedRoute
  ) {}
	@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;
	companyImgSrc: string;
	companyName: string;
	companyDescription: string;
	companyProfileId: number;
	_pbxlines: Array<ListItemType>;
	receivePhoneLineInvitation: Subscription;
	receiveRemoteLogout: Subscription;
  ngOnInit() {
    this.companyProfileId = Number(this.route.params.pipe(pluck('id')));
  }

  ionViewWillEnter() {
      // fires each time user enters page but before the page actually becomes the active page
      // use ionViewDidEnter to run code when the page actually becomes the active page
      if (this.service.isSignalrConnected() === false) {
          this.service.startConnection();
      }
  }
	ionViewDidEnter() {
		// fires each time

		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.startListeners();
			this.receivePhoneLineInvitation = this.phoneRinger.getSubjects('receivePhoneLineInvitation').subscribe((call) => {
				if (this.service.isEmpty(call) === false) {
					this.service.acceptedCall = call;
					// this.navCtrl.setRoot(Phone);
				}
			});
		
			this.receiveRemoteLogout = this.phoneRinger.getSubjects('receiveRemoteLogout').subscribe((connectionId) => {
				this.service.doLogout()
				.catch((error) => {
					console.log("app-shell.ts logOut error:", error);
				})
				.then(() => {
					// this.router.navigate(['login']);
				})
			});
		}

		if (this.service.isEmpty(this.companyProfileId) === false) {
			this.init(this.companyProfileId);
		}
		else {
			this.alertCtrl.create({
				header: "ERROR",
				message: "Unable to load company profile. Missing the companies id.",
				buttons: ["OK"]
			}).then((altRes)=>{
				altRes.present();
			})
		}
	}

	ngOnDestroy() {
		if (this.service.isEmpty(this.phoneRinger) === false) {
			this.phoneRinger.endListeners();
		}
		this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
		this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
	}

	// #endregion lifecycle hooks

	set companyProfile(value: CompanyProfileDto) {
		if (this.service.isEmpty(value) === false) {
			this.companyName = value.companyName;
			this.companyDescription = value.description;
			this.companyImgSrc = this.service.isEmpty(value.logoFilename) ? this.service.defaultAvatar
				: this.service.pbxContentUrl + value.companyProfileId.toString() + "/" + value.logoFilename + "?" + Date.now().toString();
			this.companyProfileId = value.companyProfileId;
		}
	}

	get pbxlines(): Array<ListItemType> {
		return this._pbxlines;
	}

	setPbxlines(value: Array<PbxLineDto>): void {
		this._pbxlines = new Array<ListItemType>();
		value.forEach((v) => {
			let item = new ListItemType();
			item.id = v.pbxLineId.toString();
			item.imgSrc = this.service.isEmpty(v.iconFilename) ? this.service.defaultAvatar
				: this.service.pbxContentUrl + v.companyProfileId.toString() + "/"
				+ this.service.pbxLineImageFolder.toString() + "/"
				+ v.iconFilename + "?" + Date.now().toString();
			item.title = v.lineName;
			item.content = v.description;
			this._pbxlines.push(item);
		});
	}

	async init(companyProfileId: number): Promise<void> {
		let loader = await this.loadingCtrl.create({
			message: "Please wait...",
			duration: 5000
		});
		await loader.present();

		try {
			let accessToken = await this.service.getAccessToken();
			if (this.service.isEmpty(accessToken)) {
				throw ("Unable to request access. Please try again later.")
			}

			let companyProfile: CompanyProfileDto;
			try {
				companyProfile = await this.service.getCompanyProfileById(companyProfileId, accessToken);
				this.companyProfile = companyProfile;
			}
			catch (e) {
				throw ("Unable to request profile. Please try again later.")
			}

			if (this.service.isEmpty(companyProfile)) {
				throw ("Unable to retrieve profile.")
			}

			let idDto = new IdDto();
			idDto.id = companyProfile.companyProfileId;

			let pbxlines: Array<PbxLineDto>;
			try {
				pbxlines = await this.service.getPbxLinesByCompanyProfileId(idDto, accessToken);
				this.setPbxlines(pbxlines);
				//console.log("pbxlines: ", this.pbxlines);
			}
			catch (e) {
				this.alertCtrl.create({
					header: "Notice",
					message: "Sorry, unable to grab the Pbx Lines for this company",
					buttons: ["OK"]
				}).then((altRes)=>{
          altRes.present();
        })
			}
		}
		catch (e) {
			this.alertCtrl.create({
				header: "Error",
				message: e,
				buttons: ["OK"]
			}).then((altRes)=>{
        altRes.present();
      })
		}
		finally {
			loader && loader.dismiss();
		}

		return;
	}

	async gotoCustomerPbxLine(pbxlineId: number): Promise<void> {
		console.log("gotCustomerPbxLine pbxlineId: ", pbxlineId);
		// this.navCtrl.setRoot(CustomerPbxPage, { pbxlineId: pbxlineId });
	}
}
