import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

//import { ThirdPartyFiles } from '../services/thirdpartyFiles';
import { JsHelperService } from '../services/jsHelper.service';

@Injectable({ providedIn: 'root' })
export class appService {
	constructor(public jsHelperService: JsHelperService) {
	}

	GetMemberByEmail(email: string) {
		let self: any = this;
		return new Promise((resolve, reject) => {
			//Instead of Creating an object on the fly, write a class to define a structure.
			let postParams = {
				Email: email,
			};
			self.jsHelperService.ajaxRequest("POST", "https://nofb.org/LNVApi/Member/GetMemberByEmail", postParams)
				.then((data) => {
					console.log("Member Data: ", data);
				});
		})
	}

	SendInvitation(email: string) {
		//Create webapi for saving email id and sending invitations
	}

	IsEmailUnique(email: string) {
		//call GetMemberByEmail method and if it returns null, this email is Unique.
		//or Implement a web api.
	}

	IsEmailReal(email: string) {
		//Write new api to check if provided email is real or fake
	}
}