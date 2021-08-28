import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Service } from '../../services/index';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  isMember: boolean;
  isLoggedIn: boolean;
  constructor(
    private router: Router,
    private service: Service
 	) {
    this.startSubscriptions();
   }
   startSubscriptions() {

    this.service.getObservable('isMember').subscribe((isMember) => {
        console.log("isMember:changed: ", isMember.changed);
        this.isMember = this.service.isEmpty(isMember.changed) === false ? true : false;
    });

    this.service.getObservable('isLoggedIn').subscribe((isLoggedIn) => {
        console.log("isLoggedIn:changed: ", isLoggedIn.changed);
        this.isMember = this.service.isEmpty(isLoggedIn.changed) === false ? true : false;
    });
  }
    navigateToPhone() {
      this.router.navigate(['/home']);
    }
    navigateToMeetingsDashboardPage() {
      this.router.navigate(['/home']);
    }
    navigateToLogin() {
      console.log(this.router);
      this.router.navigate(['/login']);
    }
    navigateToRegister() {
      this.router.navigate(['/register']);
    }
}
