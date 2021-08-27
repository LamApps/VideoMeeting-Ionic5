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
    this.service.isMember().then((isMember:boolean)=>{
      this.isMember = isMember;
    });
    this.service.getIsLoggedIn().then((isLoggedIn:boolean)=>{
      this.isLoggedIn = isLoggedIn;
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
