import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AvatarEditType } from '../../models/index'
import { EditAvatarPopoverComponent } from '../../components/index'
import { PopoverController } from '@ionic/angular'
import { CameraService } from '../../services/index'

@Component({
  selector: 'app-pic-preview',
  templateUrl: './pic-preview.component.html',
  styleUrls: ['./pic-preview.component.scss'],
})
export class PicPreviewComponent implements OnInit {

  @Input() imageSource: string;
  @Output() onAvatarChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private popoverCtrl: PopoverController,
    private cameraService: CameraService
  ) {
  }

  ngOnInit() {}
  
  changeAvatarClick() {
    this.changeAvatar()
      .then(base64Image => {
        this.imageSource = base64Image.replace(/\s/g, "+");
        this.onAvatarChanged.emit(this.imageSource)
      })
      .catch(error => {
        console.log(error)
      })
  }

  changeAvatar(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      //console.log('editing the avatar')
      let popover = await this.popoverCtrl.create({
        component:EditAvatarPopoverComponent
      });
      await popover.present();
      let editType = await popover.onDidDismiss();
      switch (editType.data) {
        case AvatarEditType.OpenGallery:
          this.cameraService.openGallery()
            .then(base64Image => {
              //console.log('image taken from gallary: ', base64Image)
              resolve(base64Image);
            })
            .catch(error => {
              reject(error)
              console.log(error)
            })
          break;
        case AvatarEditType.TakePicture:
          this.cameraService.takePicture()
            .then(base64Image => {
              //console.log('image taken from camera')
              resolve(base64Image);
            })
            .catch(error => {
              reject(error)
              console.log(error)
            })
          break;
        default:
          break;
      }
    })
  }

}
