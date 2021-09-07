import { Component, OnInit } from '@angular/core'
import { PopoverController, NavParams } from '@ionic/angular'

import { PhoneCallAction } from '../../models/phoneCallAction.enum'
@Component({
  selector: 'app-phone-call-action-popover',
  templateUrl: './phone-call-action-popover.component.html',
  styleUrls: ['./phone-call-action-popover.component.scss'],
})
export class PhoneCallActionPopoverComponent implements OnInit {
  
  isOnHold: boolean = false;
  
  
  constructor(private viewCtrl: PopoverController, private navParams: NavParams) {
    console.log(this.navParams.data)
    this.isOnHold = this.navParams.data.isOnHold;
  }
  ngOnInit() {}
  close(phoneCallAction: PhoneCallAction) {
      this.viewCtrl.dismiss(phoneCallAction);
  }

  privateMessage() {
      console.log('private message clicked')
      this.close(PhoneCallAction.PRIVATE_MESSAGE);
  }

  displayMain() {
      console.log('private message clicked')
      this.close(PhoneCallAction.DISPLAY_TO_MAIN);
  }

  hold() {
      console.log('private message clicked')
      this.close(PhoneCallAction.HOLD);
  }

  resumeCall() {
      console.log('call is resumed from holed')
      this.close(PhoneCallAction.RESUME_HOLD)
  }

  sendFile() {
      console.log('send file')
      this.close(PhoneCallAction.SEND_FILE)
  }

}
