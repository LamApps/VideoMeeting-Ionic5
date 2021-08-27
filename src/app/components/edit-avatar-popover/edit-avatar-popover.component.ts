import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular'
import { AvatarEditType } from '../../models/avatarEdit.type'
@Component({
  selector: 'app-edit-avatar-popover',
  templateUrl: './edit-avatar-popover.component.html',
  styleUrls: ['./edit-avatar-popover.component.scss'],
})
export class EditAvatarPopoverComponent implements OnInit {

  constructor(public popOverCtrl: PopoverController) { }

  ngOnInit() {}
	close(editType: AvatarEditType) {
		this.popOverCtrl.dismiss(editType);
	}

	selectAvatar() {
		this.close(AvatarEditType.OpenGallery)
	}

	takeNewAvatar() {
		this.close(AvatarEditType.TakePicture)
	}
}
