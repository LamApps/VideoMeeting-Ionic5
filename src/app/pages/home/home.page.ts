import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Service } from '../../services/index';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  isMember: boolean;
  isLoggedIn: boolean;
  constructor(
    private router: Router,
    private service: Service
 	) {
    
   }
  ngOnInit(): void {
    this.service.isMember()
    .then((isMember) => {
      this.isMember = isMember;
    });
    this.service.getIsLoggedIn().then((isLoggedIn)=>{
      this.isLoggedIn = isLoggedIn;
    })
  }
    navigateToPhone() {
      this.router.navigate(['phone']);
    }
    navigateToMeetingsDashboardPage() {
      this.router.navigate(['meeting-dashboard']);
    }
    navigateToLogin() {
      console.log(this.router);
      this.router.navigate(['login']);
    }
    navigateToRegister() {
      this.router.navigate(['register']);
    }
    navigateToSettings() {
      this.router.navigate(['settings']);
    }
    navigateToCompanySearch() {
      this.router.navigate(['company-search']);
    }
    navigateToBlockList() {
      this.router.navigate(['block-list']);
    }
    navigateToAccount() {
      this.router.navigate(['account']);
    }
    navigateToNetcast() {
      this.router.navigate(['netcast']);
    }
    logOut() {
      this.service
          .doLogout()
          .then(() => {
              //console.log("doLogout complete")
              this.service.unsetLocalBlockedEmails();
          })
          .catch(error => {
              console.log("app-shell.ts logOut error:", error);
          })
          .then(() => {
              //console.log("navigate to login")
              // this.navCtrl.setRoot(LoginPage);
              this.router.navigate(['login']);
          });
  }
}
