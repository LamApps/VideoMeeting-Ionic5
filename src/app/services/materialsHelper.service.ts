import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

import {
  MaterialAlertMessageType,
  MaterialActionAlertMessageType,
} from '../models/index';



import {
  AlertController,
} from '@ionic/angular';

@Injectable({providedIn:'root'})
export class MaterialsHelperService {
  constructor(
    private alertCtrl: AlertController,
    
  ) { }
  private isVideoHidden = new Subject<any>();

  getSubject() {
    return this.isVideoHidden;
  }
  async openAlert(data: MaterialAlertMessageType) {
    let alert = await this.alertCtrl.create({
      header: data.title,
      message: data.message,
      buttons: ["OK"]
    });

    this.isVideoHidden.next(true);
    await alert.present();

    await alert.onDidDismiss();
    this.isVideoHidden.next(false);
  }

  openActionAlert(data: MaterialActionAlertMessageType): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: data.title,
        message: data.message,
        buttons: [
          {
            text: data.yesButton,
            handler: () => {
              data.doAction = true;
              this.isVideoHidden.next(true);
            }
          },
          {
            text: data.noButton,
            role: 'cancel',
            handler: () => {
              data.doAction = false;
              this.isVideoHidden.next(false);
              resolve(data.doAction);
            }
          }
        ]
      });
      alert.present();

      //console.log("TODO: implement -> openActionAlert: ", data);
      //resolve();

      //this.dialogs.confirm(data.message, data.title)
      //	.then((value: number) => {
      //		if (value === 1) {
      //			data.doAction = true;
      //			resolve(true);
      //		}
      //		else {
      //			data.doAction = false;
      //			resolve(false);
      //		}
      //	})
      //	.catch((e) => {
      //		data.doAction = false;
      //		resolve(false);
      //	})
    });
  }

  //openIncomingCall(call: CallType): Promise<IncomingCallResponseEnum> {
  //	return new Promise<IncomingCallResponseEnum>((resolve, reject) => {
  //		let data = new IncomingCallDialogType();
  //		data.call = call;
  //		data.avatarBaseUrl = this.configService.avatarBaseUrl;
  //		let dialogRef = this.dialog.open(MaterialDialogExampleComponent, {
  //			width: '250px',
  //			data: data
  //		});

  //		dialogRef.afterClosed().subscribe(result => {
  //			console.log('The dialog was closed');
  //			resolve(data.response);
  //		});
  //	});
  //}

  // openCustomDialog<T>(customComponent: ComponentRef<T>): Promise<boolean> {
  // 	return new Promise<boolean>((resolve, reject) => {
  // 		let dialogRef = this.dialog.open(customComponent, {
  // 			width: '300px'
  // 		});

  // 		dialogRef.afterClosed().subscribe(result => {
  // 			console.log('The dialog was closed');
  // 			resolve(data.doAction);
  // 		});
  // 	});
  // }

  //openSnackBar(data: MaterialSnackBarMessageType) {
  //	this.snackBar.openFromComponent(MaterialSnackBarComponent, {
  //		duration: 3000,
  //		data: data,
  //		horizontalPosition: 'center',
  //		verticalPosition: 'top'
  //	});
  //}
}
