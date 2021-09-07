import { Injectable } from '@angular/core'
import { ToastController } from '@ionic/angular';

@Injectable({providedIn:'root'})
export class GuiHelperService {
    constructor(public toastCtrl: ToastController) {

    }
    async showToast(message: string,  isSuccess: boolean, duration: number = 3000, position: any = 'top') {
		let toast = await this.toastCtrl.create({
			message: message,
			duration: duration,
			position: position,
			cssClass: isSuccess ? 'color: green' : ' color: black'
		});
		toast.present();
	}
}