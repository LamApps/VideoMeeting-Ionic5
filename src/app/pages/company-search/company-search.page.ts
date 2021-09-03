import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AlertController,
  LoadingController,
} from '@ionic/angular';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Service,
} from '../../services/index'

// import { Phone, CompanyProfilePage, LoginPage } from '../index'
import {
  CountryDto,
  ListItemType,
  LocationSearchDto,
  CompanyProfileDto,
  SearchTermDto,
  CallType
} from "../../models/index";

import { PhoneRingerComponent } from '../../components/index';

@Component({
  selector: 'app-company-search',
  templateUrl: './company-search.page.html',
  styleUrls: ['./company-search.page.scss'],
})
export class CompanySearchPage implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private service: Service,
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private router: Router,
  ) {
    this.showResults = false;
    this.createForms();
    this.showNameSearchForm = true;
    this.showLocationSearchForm = false;
  }
  // #region variables
  @ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

  showResults: boolean;
  showNameSearchForm: boolean;
  showLocationSearchForm: boolean;

  countries: Array<CountryDto>;

  profiles: Array<ListItemType>;
  receivePhoneLineInvitation: Subscription;
  receiveRemoteLogout: Subscription;
  ngOnInit() {
    let loader: HTMLIonLoadingElement;
    this.loadingCtrl.create({
        message: "Please wait...",
        duration: 2000
    }).then((loadRes)=>{
      loader = loadRes;
      loadRes.present();
    });
  
    this.service.getAccessToken()
        .then((accessToken: string) => {
            return this.service.getCountryIsoCodes(accessToken);
        })
        .then((countries: Array<CountryDto>) => {
            this.countries = countries;
            loader && loader.dismiss();
        })
        .catch((e) => {
            loader && loader.dismiss();
            this.alertCtrl.create({
                header: "Error",
                message: "Unable to load countries for location search.",
                buttons: ["OK"]
            }).then((altRes)=>{
              altRes.present();
            })
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
    // fires each time loaded
    if (this.service.isEmpty(this.phoneRinger) === false) {
        this.phoneRinger.startListeners();
    }
    this.receivePhoneLineInvitation = this.service.getObservable('receivePhoneLineInvitation').subscribe((call) => {
      if (this.service.isEmpty(call) === false) {
          this.service.acceptedCall = call;
          // this.navCtrl.setRoot(Phone);
      }
    });

    this.receiveRemoteLogout = this.service.getObservable('receiveRemoteLogout').subscribe((connectionId) => {
      this.service.doLogout()
      .catch((error) => {
          console.log("app-shell.ts logOut error:", error);
      })
      .then(() => {
          // this.router.navigate(['login']);
      })
    });
  }

  ionViewWillLeave() {
      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.endListeners();
      }
      this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();
      this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();
  }


  // #endregion lifecycle hooks
  set companyProfiles(value: Array<CompanyProfileDto>) {
      if (this.service.isEmpty(value)) {
          this.profiles = null;
      }
      else {
          this.profiles = new Array<ListItemType>();
          value.forEach((v) => {
              let item = new ListItemType();
              item.id = v.companyProfileId.toString();
              item.imgSrc = this.service.isEmpty(v.logoFilename) ? this.service.defaultAvatar
                  : this.service.pbxContentUrl + v.companyProfileId.toString() + "/" + v.logoFilename + "?" + Date.now().toString();
              item.title = v.companyName;
              item.content = v.description;
              this.profiles.push(item);
          });
      }
  }

  nameSearchForm: FormGroup;
  locationSearchForm: FormGroup;

  createForms() {
      this.nameSearchForm = this.fb.group({
          name: new FormControl('', [
              Validators.maxLength(300),
              Validators.required
          ])
      });

      this.locationSearchForm = this.fb.group({
          address: new FormControl('', [
              Validators.maxLength(300)
          ]),
          city: new FormControl('', [
              Validators.maxLength(300)
          ]),
          region: new FormControl('', [
              Validators.maxLength(300)
          ]),
          countryIsoCode: new FormControl('US', [
              Validators.maxLength(2)
          ])
      })
  }

  async searchByName(event: MouseEvent): Promise<void> {
      let loader = await this.loadingCtrl.create({
          message: "Searching...",
      });
      await loader.present();

      if (this.nameSearchForm.valid) {
          let originalContent: string;
          try {
              if (this.service.isEmpty(event) === false) {
                  originalContent = (<Element>event.target).innerHTML;
                  (<Element>event.target).innerHTML = '<i class="fa fa-spinner fa-spin"></i> Searching';
                  (<Element>event.target).setAttribute("disabled", "true");
              }

              let name = this.nameSearchForm.get('name').value;
              let accessToken: string;
              try {
                  accessToken = await this.service.getAccessToken();
              }
              catch (e) {
                  throw ("Unable to get access at this time, please try again.")
              }

              try {
                  let search = new SearchTermDto();
                  search.term = name;
                  this.companyProfiles = await this.service.searchCompanyProfilesByName(search, accessToken);
                  if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                      (<Element>event.target).innerHTML = originalContent;
                      (<Element>event.target).removeAttribute("disabled");
                  }

                  loader && loader.dismiss();
                  //console.log("search", search);
                  //console.log("this.companyProfiles: ", this.profiles);

                  if (this.service.isEmpty(this.profiles)) {
                      let alert = await this.alertCtrl.create({
                          header: "No Results Found",
                          message: "Please try a different search term",
                          buttons: ["OK"]
                      });
                      await alert.present();
                  }
                  else {
                      this.showResults = true;
                      this.showNameSearchForm = false;
                      this.showLocationSearchForm = false;
                  }
              }
              catch (e) {
                  console.log("error:", e);
                  throw ("An error occured while trying to search companies");
              }
          }
          catch (e) {
              if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                  (<Element>event.target).innerHTML = originalContent;
                  (<Element>event.target).removeAttribute("disabled");
              }
              loader && loader.dismiss();
              this.alertCtrl.create({
                  header: 'Error',
                  message: e,
                  buttons: ['OK']
              }).then((altRes)=>{
                altRes.present();
              })
          }
      }
      else {
          loader && loader.dismiss();
          this.alertCtrl.create({
              header: 'Please Check',
              message: "Please make sure the form is filled out and any error messages are fixed.",
              buttons: ['OK']
          }).then((altRes)=>{
            altRes.present();
          });

          return;
      }
  }

  async searchByLocation(event: MouseEvent): Promise<void> {
      let loader = await this.loadingCtrl.create({
          message: "Searching...",
      });
      await loader.present();

      if (this.locationSearchForm.valid) {
          let originalContent: string;
          try {
              if (this.service.isEmpty(event) === false) {
                  originalContent = (<Element>event.target).innerHTML;
                  (<Element>event.target).innerHTML = '<i class="fa fa-spinner fa-spin"></i> Searching';
                  (<Element>event.target).setAttribute("disabled", "true");
              }

              let address = this.locationSearchForm.get('address').value;
              let city = this.locationSearchForm.get('city').value;
              let region = this.locationSearchForm.get('region').value;
              let countryCode = this.locationSearchForm.get('countryIsoCode').value;
              let accessToken: string;
              try {
                  accessToken = await this.service.getAccessToken();
              }
              catch (e) {
                  throw ("Unable to get access at this time, please try again.")
              }

              try {
                  let search = new LocationSearchDto();
                  search.address = address;
                  search.city = city;
                  search.region = region;
                  search.countryIsoCode = countryCode;
                  this.companyProfiles = await this.service.searchCompanyProfilesByLocation(search, accessToken);
                  if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                      (<Element>event.target).innerHTML = originalContent;
                      (<Element>event.target).removeAttribute("disabled");
                  }
                  loader && loader.dismiss();

                  if (this.service.isEmpty(this.profiles)) {
                      let alert = this.alertCtrl.create({
                          header: "No Results Found",
                          message: "Please try a different search term",
                          buttons: ["OK"]
                      }).then((altRes)=>{
                        altRes.present();
                      });
                  }
                  else {
                      this.showResults = true;
                      this.showLocationSearchForm = false;
                      this.showNameSearchForm = false;
                  }
              }
              catch (e) {
                  console.log("error:", e);
                  throw ("An error occured while trying to search companies");
              }
          }
          catch (e) {
              if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                  (<Element>event.target).innerHTML = originalContent;
                  (<Element>event.target).removeAttribute("disabled");
              }
              loader && loader.dismiss();
              this.alertCtrl.create({
                  header: 'Error',
                  message: e,
                  buttons: ['OK']
              }).then((altRes)=>{
                altRes.present();
              });
          }
      }
      else {
          loader && loader.dismiss();
          this.alertCtrl.create({
              header: 'Please Check',
              message: "Please make sure the form is filled out and any error messages are fixed.",
              buttons: ['OK']
          }).then((altRes)=>{
            altRes.present();
          });
          return;
      }
  }

  // if name search form is displayed, hide the location search form
  toggleNameSearchForm(showNameSearchForm: boolean): void {
      if (this.service.isEmpty(showNameSearchForm) === false) {
          this.showLocationSearchForm = false;
      }
  }

  // if the location search form is displayed, hide the name search form
  toggleLocationSearchForm(showLocationSearchForm: boolean): void {
      if (this.service.isEmpty(showLocationSearchForm) === false) {
          this.showNameSearchForm = false;
      }
  }

  gotoCompanyProfile(companyProfileId: number): void {
      //console.log("id: ", companyProfileId);
      this.router.navigate(['/company-profile', {id: companyProfileId}]);

      // this.navCtrl.setRoot(CompanyProfilePage, { companyProfileId: companyProfileId });
  }
}
