import { Injectable } from '@angular/core';
//import { Camera } from 'ionic-native';
import { Camera } from '@ionic-native/camera/ngx';

@Injectable({providedIn:'root'})
export class CameraService {
	constructor(
		private camera: Camera
	) { }
	photoSize = 600;

	takePicture(): Promise<string> {
		//While simulatng in browser, plugin prompts in visual studio, not in browser.
		return new Promise<string>((resolve, reject) => {
			//console.log('taking picture')
			this.camera.getPicture({
				sourceType: this.camera.PictureSourceType.CAMERA,
				mediaType: this.camera.MediaType.PICTURE,
				destinationType: this.camera.DestinationType.DATA_URL,
				quality: 80,
				targetWidth: this.photoSize,
                targetHeight: this.photoSize,
                encodingType: this.camera.EncodingType.JPEG,
				correctOrientation: true
			})
				.then((imageData) => {
					//console.log("camera imageData: ", imageData);
					// imageData is a base64 encoded string
                    if (imageData.search(/^data:image\//) > -1) {
                        resolve(imageData);
                    }
                    else {
                        resolve("data:image/jpeg;base64," + imageData)
                    }
					
					//resolve(imageData);
				})
				.catch(error => {
					reject(error)
					console.log('error while taking picture', error)
				})
		})
	}

    openGallery(): Promise<string> {
        //console.log("opening Gallery");
		return new Promise<string>((resolve, reject) => {
			let cameraOptions = {
				sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
				mediaType: this.camera.MediaType.PICTURE,
				destinationType: this.camera.DestinationType.DATA_URL,
				quality: 80,
				targetWidth: this.photoSize,
                targetHeight: this.photoSize,
                encodingType: this.camera.EncodingType.JPEG,
				correctOrientation: true
			}
			this.camera.getPicture(cameraOptions)
				.then((imageData) => {
                    //console.log("gallery imageData: ", imageData);

                    //resolve(imageData);

					// imageData is a base64 encoded string
                    if (imageData.search(/^data:image\//) > -1) {
                        resolve(imageData);
                    }
                    else {
                        resolve("data:image/jpeg;base64," + imageData)
                    }

					//resolve("data:image/jpeg;base64," + imageData)
					//resolve(imageData)
				})
				.catch(errror => {
					reject(errror);
					console.log('error while opening gallary', errror)
				})
		})
	}
}
