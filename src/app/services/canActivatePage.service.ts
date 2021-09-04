import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Service } from './service.service';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class MemberGuard implements CanActivate{
  constructor(private service: Service, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise<boolean>(async (resolve) => {
        let canActivatePage: boolean = await this.service.canActivatePage();
        if (canActivatePage) {
            let accessToken: string = await this.service.getAccessToken();
            let memberId: string = this.service.extractMemberId(accessToken);

            if (this.service.isEmpty(memberId) === false) {
                resolve(true);
            }
            else {
                this.router.navigate(['login']);
            }
        }
        else {
            this.router.navigate(['error']);
        }
    });
  }
}

@Injectable({providedIn:'root'})
export class ActiveGuard implements CanActivate{
  constructor(private service: Service, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise<boolean>(async (resolve) => {
        let canActivatePage: boolean = await this.service.canActivatePage();
        if(canActivatePage){
            resolve(true);
        }else{
            this.router.navigate(['error']);
        }
    });
  }
}

@Injectable({providedIn:'root'})
export class LogInGuard implements CanActivate{
  constructor(private service: Service, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise<boolean>(async (resolve) => {
        let canActivatePage: boolean = await this.service.canActivatePage();
        if (canActivatePage) {
            let isLoggedIn: boolean = await this.service.getIsLoggedIn();
            if(isLoggedIn){
                resolve(true);
            }else{
                this.router.navigate(['login']);
            }
        }
        else {
            this.router.navigate(['error']);
        }
    });
  }
}