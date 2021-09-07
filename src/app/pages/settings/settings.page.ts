import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import {
  AlertController,
  Platform,
} from '@ionic/angular';
import {
  Service,
} from '../../services/index';
import { Subscription } from "rxjs";
import {
    CallType, MaterialAlertMessageType,
} from "../../models/index";

import {
    PhoneRingerComponent,
} from '../../components/index';
import { Router } from '@angular/router';

declare var cordova: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    public alertCtrl: AlertController,
    private service: Service,
    private platform: Platform,
    private ngZone: NgZone,
    private router:Router,
  ) {
    this.isVideoHidden = false;
  }
    // #region ViewChild
    @ViewChild('phoneRinger') phoneRinger: PhoneRingerComponent;

    @ViewChild('localVideoElement') localVideoElement: ElementRef;
    // #endregion ViewChild

    // #region Variables

    onAppPause: Subscription;
    onAppResume: Subscription;
    onVideoHidden: Subscription;
    onReceivePhoneLineInvitation: Subscription;
    onReceiveRemoteLogout : Subscription;


    canToggle: boolean;
    isVideoHidden: boolean;

    selectedDeviceId: string;
    localStream: MediaStream;
    videoDeviceInfos: Array<MediaDeviceInfo>;
    cameraLabels: Array<string> = ['front camera', 'back camera'];

    hasIncoming: boolean; // NOTE: if this is true, then the user is currently answering an incoming call

    receivePhoneLineInvitation: Subscription;
    receiveRemoteLogout: Subscription;

    videoDeviceIds: Array<string>;
    isFrontFacing: boolean = false;
    ngOnInit() {
    }
    ionViewWillEnter() {
      // fires each time user enters page but before the page actually becomes the active page
      // use ionViewDidEnter to run code when the page actually becomes the active page
      if (this.service.isSignalrConnected() === false) {
          this.service.startConnection();
      }
    }
    ionViewDidEnter() {
      console.log("settings ionViewDidEnter");
      //this.canToggle = false;

      //this.isVideoHidden = false;

      this.onAppPause = this.platform.pause.subscribe(() => {
          if (this.service.isEmpty(this.service.localMediaStream) === false) {
              let audioEnabled = false;
              this.service.updateMediaStreamAudio(this.service.localMediaStream, audioEnabled);
              console.log("after mute: ", this.service.localMediaStream);
          }
      });

      this.onAppResume = this.platform.resume.subscribe(() => {
          if (this.service.isEmpty(this.service.localMediaStream) === false) {
              let audioEnabled = true;
              this.service.updateMediaStreamAudio(this.service.localMediaStream, audioEnabled);
              console.log("after unmute: ", this.service.localMediaStream);
          }
      });

      this.onVideoHidden = this.service.getMaterialHelperSubject().subscribe((isVideoHidden)=>{
        if (typeof cordova !== "undefined" && this.platform.is("ios")) {
          this.ngZone.run(() => {
              // iosrtc does the opposite of intended behavior, so we add negate
              this.isVideoHidden = isVideoHidden;
              setTimeout(() => {
                  cordova.plugins.iosrtc.refreshVideos();
              });
          })
      }
      })

      if (this.service.isEmpty(this.phoneRinger) === false) {
          this.phoneRinger.startListeners();
        }
        this.onReceivePhoneLineInvitation = this.service.getObservable('receivePhoneLineInvitation').subscribe((call) => {
          if (this.service.isEmpty(call) === false) {
              this.service.acceptedCall = call;
              // this.navCtrl.setRoot(Phone);
              this.router.navigate(['phone']);
          }
        });
    
        this.onReceiveRemoteLogout = this.service.getObservable('receiveRemoteLogout').subscribe((connectionId) => {
          this.service.doLogout()
          .catch((error) => {
              console.log("app-shell.ts logOut error:", error);
          })
          .then(() => {
              // this.router.navigate(['login']);
              this.router.navigate(['login']);
          })
        });

      this.startLocalVideo();

  }
  ionViewWillLeave() {
    if (this.service.isEmpty(this.phoneRinger) === false) {
        this.phoneRinger.endListeners();
    }

    // this.service.getMaterialHelperSubject().unsubscribe();

    console.log("settings ionViewWillLeave()");

    this.stopLocalVideo();

    this.onAppPause && this.onAppPause.unsubscribe();
    this.onAppResume && this.onAppResume.unsubscribe();
    this.onVideoHidden && this.onVideoHidden.unsubscribe();
    this.onReceiveRemoteLogout && this.onReceiveRemoteLogout.unsubscribe();
    this.onReceivePhoneLineInvitation && this.onReceivePhoneLineInvitation.unsubscribe();
  }
  async startLocalVideo(): Promise<void> {
    this.canToggle = false;
    try {
        //this.localVideoElement.nativeElement.load();
        await this.stopLocalVideo();
        let mediaDeviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

        if (this.service.isEmpty(mediaDeviceInfos)) {
            throw ("No media devices found");
        }

        console.log("mediaDeviceInfos: ", mediaDeviceInfos);
        this.videoDeviceInfos = mediaDeviceInfos.filter(mediaDeviceInfo => {
            return mediaDeviceInfo.kind === "videoinput";
        });
        console.log("videoDeviceInfos: ", this.videoDeviceInfos);
        if (this.service.isEmpty(this.videoDeviceInfos) || this.videoDeviceInfos.length < 0) {
            throw ("There are no video devices.");
        }

        if (this.videoDeviceInfos.length > 1) {
            this.canToggle = true;
        }

        //if camera source has been selected before display that, else display front
        if (this.service.activeVideoDeviceId) {
            console.log("getting deviceId from storage");
            this.setVideoDeviceId(this.service.activeVideoDeviceId);
        } else if (this.videoDeviceInfos.length > 0) {
            console.log("getting default deviceId");
            this.setVideoDeviceId(this.videoDeviceInfos[0].deviceId);
        }
        else {
            throw ('No video devices found');
        }

        let stream: MediaStream = await this.service.getLocalMediaStream();

        this.service.localMediaStream = stream;
        console.log("stream: ", stream);
        this.service.attachMediaStream(this.localVideoElement.nativeElement, this.service.localMediaStream);
    }
    catch (e) {
        let alert = new MaterialAlertMessageType();
        alert.title = "Please Check";
        alert.message = e.toString();
        this.service.openAlert(alert);
    }
}

async stopLocalVideo(): Promise<void> {
    if (this.service.isEmpty(this.service.localMediaStream) === false) {
        this.service.stopMediaStream(this.service.localMediaStream);
    }
    this.service.localMediaStream = null;

    if (this.service.isIos()) {
        this.localVideoElement.nativeElement.src = null;
    }
    else {
        this.localVideoElement.nativeElement.srcObject = null;
    }

    return;
}

setVideoDeviceId(deviceId: string) {
    try {
        this.service.activeVideoDeviceId = deviceId;
        return;
    }
    catch (e) {
        throw (e);
    }
}

showAllVideos() {
    if (typeof cordova !== "undefined" && this.platform.is("ios")) {
        this.ngZone.run(() => {
            this.isVideoHidden = false;
            setTimeout(() => {
                cordova.plugins.iosrtc.refreshVideos();
            });
        })
    }
}

hideAllVideos() {
    //console.log("hiding all videos");
    if (typeof cordova !== "undefined" && this.platform.is("ios")) {
        this.ngZone.run(() => {
            this.isVideoHidden = true;
            setTimeout(() => {
                cordova.plugins.iosrtc.refreshVideos();
            });
        })
    }
}

async toggleCamera(): Promise<void> {
    try {
        if (this.videoDeviceInfos.length < 1) {
            // the user doesn't have any video devices
            throw ("No video devices found.");
        }

        if (this.videoDeviceInfos.length === 1) {
            // only one video device, can not toggle if user only has one device
            throw ("Only 1 Video device available.");
        }

        // the user has more than one device to toggle

        let currentVideoDeviceId: string = this.service.activeVideoDeviceId;
        let lastIndex: number = this.videoDeviceInfos.length - 1;
        let nextIndex: number = -1;
        let index: number = this.videoDeviceInfos.findIndex((m: MediaDeviceInfo) => {
            return m.deviceId == currentVideoDeviceId;
        });

        if (index < 0) {
            throw ("No video device found.");
        }

        if (index < lastIndex) {
            nextIndex = index + 1;
        }
        else {
            nextIndex = 0;
        }

        this.setVideoDeviceId(this.videoDeviceInfos[nextIndex].deviceId);
        console.log("deviceId: ", this.service.activeVideoDeviceId);
        await this.stopLocalVideo();
        let mediaStream: MediaStream = await this.service.getLocalMediaStream();
        this.service.localMediaStream = mediaStream;
        this.localVideoElement.nativeElement.srcObject = this.service.localMediaStream;
    }
    catch (e) {
        let alert = new MaterialAlertMessageType();
        alert.title = "Error";
        alert.message = e.toString();
        this.service.openAlert(alert);
        return;
    }
  }
}
