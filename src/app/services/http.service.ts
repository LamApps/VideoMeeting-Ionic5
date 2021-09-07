import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { JsHelperService } from './index';

@Injectable({providedIn:'root'})
export class HttpService {
    private readonly BASE_URI = 'https://nofb.org';
    private _headers = new HttpHeaders() ;
    constructor(
        public http: HttpClient,
        public jsHelperService: JsHelperService
    ) {
        this._headers.set('cache-control', 'no-cache');
        this._headers.set('X-Requested-With', 'XMLHttpRequest');
        this._headers.set('Access-Control-Allow-Origin', '*');
        this._headers.set('content-type', 'application/x-www-form-urlencoded')
    }

    setBearer(bearerToken: string) {
        this._headers.set('authorization', 'bearer ' + bearerToken);
    }

    get(partialUrl: string, parameters): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let url: string = this.appendBaseUri(partialUrl)

            let queryString: string = this.jsHelperService.toQueryString(parameters);
            
            this.http.get(url + queryString, {
                headers: this._headers,
            })
                .toPromise()
                .then(() => {
                    resolve()

                })
                .catch((error) => {
                    reject(error)
                });
        })
    }

    post(partialUrl: string, body: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let url: string = this.appendBaseUri(partialUrl)

            let queryString: string = this.jsHelperService.toQueryString(body);

            this.http.post(url, queryString, {
                headers: this._headers,
            })
                .toPromise()
                .then((test) => {
                    console.log(test + 'from httpsrvice')
                    resolve()
                })
                .catch((error) => {
                    console.log(error + 'from httpservice')
                    
                    reject(error)
                });
        })
    }



    private appendBaseUri(partialUrl: string): string {
        return `${this.BASE_URI}/${partialUrl}`;
    }

}