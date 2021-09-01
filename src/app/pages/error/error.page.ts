import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../services/index';

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class ErrorPage implements OnInit {
  constructor(
    private service: Service,
    private router: Router,
) { }
  ngOnInit() {
  }
	resetApp(): void {
    console.log("error.page.ts resetApp()");
    this.service
        .doLogout()
        .then(() => {
            this.service.unsetLocalBlockedEmails();
        })
        .catch(error => {
            console.log("error.page.ts logOut error:", error);

        })
        //.then(() => {
        //    if (this.service.isSignalrConnected() === false) {
        //        console.log("starting signalr connection");
        //        return this.service.startConnection();
        //    }
        //    else {
        //        return;
        //    }

        //})
        //.catch((e) => {
        //    console.log("start signalr error: ", e);
        //})
        .then(() => {
            // this.navCtrl.setRoot(LoginPage);
            this.router.navigate(['login']);
        });
  }
}
