import { Component, OnInit, ViewChild } from '@angular/core';

import {
	NavController,
    AlertController,
} from '@ionic/angular';
import {
    FormBuilder,
    Validators,
    FormGroup,
    //AbstractControl,
    FormControl
} from '@angular/forms'
import { Service } from '../../services/index';
import { CallType, SqlSearchPredicateDto, NetcastGenreDto, KeyValueType, IdDto, NetcastDto, ListItemType, SearchTermDto } from '../../models/index';

// import {
// 	LoginPage,
// 	Phone,

//     NetcastDetailsPage
// } from '../index'
import { PhoneRingerComponent } from '../../components/index';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-netcast-search',
  templateUrl: './netcast-search.page.html',
  styleUrls: ['./netcast-search.page.scss'],
})
export class NetcastSearchPage implements OnInit {
	constructor(
		public navCtrl: NavController,
    private service: Service,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private router: Router,
    ) {
        this.service.getAccessToken()
            .then((accessToken: string) => {
                let predicates = new SqlSearchPredicateDto();
                predicates.orderBy = null;
                predicates.paging = null;
                predicates.sqlPredicates = null;
                return this.service.getAllNetcastGenres(predicates, accessToken);
            })
            .then((n: NetcastGenreDto[]) => {
                this.genres = new Array<KeyValueType>();
                n.forEach((g) => {
                    let item = new KeyValueType();
                    item.key = g.value;
                    item.value = g.netcastGenreId;
                    this.genres.push(item);
                });
                this.genres = this.genres.slice();
            })

        this.createForm();

        this.showGenres = false;
        this.showSearchForm = true;
        this.showResults = false;
    }

	@ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;
  ngOnInit() {
  }
  genres: KeyValueType[];
  items: Array<ListItemType>;
  showGenres: boolean;
  showSearchForm: boolean;
  showResults: boolean;
  isMember: boolean;
  isLoggedIn: boolean;
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

  searchForm: FormGroup;

  createForm() {
      this.searchForm = this.fb.group({
          keyword: new FormControl('', [
              Validators.maxLength(300)
          ]),
          netcastGenreId: new FormControl('', [
              Validators.pattern('^[0-9]{1,5}$')
          ]),
          searchType: new FormControl('', [
              Validators.required
          ])
      });

      
  }

  async searchByKeyword(): Promise<void> {
      let originalContent: string;
      try {
          if (this.searchForm.valid) {
              if (this.service.isEmpty(event) === false) {
                  originalContent = (<Element>event.target).innerHTML;
                  (<Element>event.target).innerHTML = '<i class="fa fa-spinner fa-spin"></i> Please Wait';
                  (<Element>event.target).setAttribute("disabled", "true");
              }

              console.log("this.searchForm", this.searchForm);

              let searchType: string = this.searchForm.get('searchType').value;
              let genreId: number = this.searchForm.get('netcastGenreId').value;
              let keyword: string = this.searchForm.get('keyword').value;

              console.log("searchType, genreId, keyword: ", searchType, genreId, keyword);

              switch (searchType) {
                  case "genre":
                      this.searchByGenreId(genreId);
                      break;
                  case "title":
                      this.searchByTitle(keyword);
                      break;
                  case "tags":
                      this.searchByTags(keyword);
                      break;
                  case "description":
                      this.searchByDescription(keyword);
                      break;
                  default:
                      this.unableToSearch();

              }


              if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
                  (<Element>event.target).innerHTML = originalContent;
                  (<Element>event.target).removeAttribute("disabled");
              }

          }
          else {
              this.alertCtrl.create({
                  header: "Please Check",
                  message: "Please make sure a keyword is entered or a genre is selected for your search.",
                  buttons: ['OK']
              }).then((altRes)=>{
                altRes.present();
              });
          }
      }
      catch (e) {
          if (this.service.isEmpty(originalContent) === false && this.service.isEmpty(event) === false) {
              (<Element>event.target).innerHTML = originalContent;
              (<Element>event.target).removeAttribute("disabled");
          }
          console.log("netcast-search.page.ts submit error:", e);
          this.alertCtrl.create({
              header: "Please Check",
              message: "Sorry, unable to perform search. Please try again later.",
              buttons: ['OK']
          }).then((altRes)=>{
            altRes.present();
          })
      }
  }

  onSearchTypeChanged(selectedValue: any) {
      console.log("selectedValue: ", selectedValue);
      if (selectedValue === "genre") {
          this.showGenres = true;
      }
      else {
          this.showGenres = false;
      }
  }
  toggleSearchForm(showSearchForm: boolean): void {
      if (this.service.isEmpty(showSearchForm) === false) {
          this.showSearchForm = true;
      }
      else {
          this.showSearchForm = false;
      }
  }

  unableToSearch(): void {
      let alert = this.alertCtrl.create({
          header: "Error",
          message: "Sorry, unable to perform search. Please try again later.",
          buttons: ['OK']
      }).then((altRes)=>{
        altRes.present();
      });
  }

  async searchByGenreId(netcastGenreId: number): Promise<void> {
      let search = new IdDto();
      search.id = netcastGenreId;

      let accessToken: string = await this.service.getAccessToken();
      let dtos: NetcastDto[] = await this.service.getNetcastsByGenreId(search, accessToken);
      this.setNetcastDtos(dtos);
     
      this.showResults = true;
      this.showSearchForm = false;
  }

  async searchByTitle(title: string): Promise<void> {
      let search = new SearchTermDto();
      search.term = title;
      //console.log("search.term: ", title);
      let accessToken: string = await this.service.getAccessToken();
      let dtos: NetcastDto[] = await this.service.searchNetcastsByTitle(search, accessToken);
      //console.log("netcast-search dtos: ", dtos);
      this.setNetcastDtos(dtos);
      //console.log("this.items: ", this.items);
    
      this.showResults = true;
      this.showSearchForm = false;
  }

  async searchByTags(tag: string): Promise<void> {
      let search = new SearchTermDto();
      search.term = tag;
      let accessToken: string = await this.service.getAccessToken();
      let dtos: NetcastDto[] = await this.service.searchNetcastsByTags(search, accessToken);
      this.setNetcastDtos(dtos);
    
      this.showResults = true;
      this.showSearchForm = false;
  }

  async searchByDescription(description: string): Promise<void> {
      let search = new SearchTermDto();
      search.term = description;
      let accessToken: string = await this.service.getAccessToken();
      let dtos: NetcastDto[] = await this.service.searchNetcastsByDescription(search, accessToken);
      this.setNetcastDtos(dtos);
     
      this.showResults = true;
      this.showSearchForm = false;
  }

  setNetcastDtos(value: NetcastDto[]) {
      if (this.service.isEmpty(value)) {
          this.items = null;
      }
      else {
          this.items = new Array<ListItemType>();
          value.forEach((v) => {
              let item = new ListItemType();
              item.id = v.netcastId.toString();
              item.imgSrc = this.service.isEmpty(v.imageFilename) ? this.service.defaultAvatar
                  : this.service.netcastImageUrl + v.netcastId.toString() + "/" + v.imageFilename + "?" + Date.now().toString();
              item.title = v.title;
              item.content = v.description.substring(0, 300);
              if (item.content.length > 300) {
                  item.content = item.content + "...";
              }
              this.items.push(item);
          });
      }
  }

  gotoNetcastDetails(netcastId: number) {
      // this.navCtrl.push(NetcastDetailsPage, { netcastId: netcastId });
      this.router.navigate(['netcast-detail', {id: netcastId}])
  }
}
