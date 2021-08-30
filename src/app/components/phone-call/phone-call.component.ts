import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ElementRef,
  NgZone,
} from '@angular/core';
import {
  PopoverController,
} from '@ionic/angular';

import { PhoneCallActionPopoverComponent } from '../phone-call-action-popover/phone-call-action-popover.component';

import {
  PhoneCallAction
} from '../../models/phoneCallAction.enum'
import {
  //JwtToken,
  CallerType,
  //SdpMessageType,
  //PhoneLineType,
  //PhoneLineConnectionType,
  //HubConnection
} from '../../models/index'

import {
  //LocalStorageService,
  //ConfigService,
  //JsHelperService,
  //SignalrService,
  //VideoHelperService
  Service
} from '../../services/index'

//import 'webrtc-adapter';

declare var cordova: any;
@Component({
  selector: 'app-phone-call',
  templateUrl: './phone-call.component.html',
  styleUrls: ['./phone-call.component.scss'],
})
export class PhoneCallComponent implements OnInit {

  private className = "PhoneCallComponent";
  constructor(
    private ngZone: NgZone,
    private popoverCtrl: PopoverController,
    private service: Service
  ) {
    //this.isActive = true;
    this.isVideoHidden = true;
    this.isOnHold = false;
  }

  _isOnHold: boolean;
  get isOnHold(): boolean {
    return this._isOnHold;
  }
  set isOnHold(value: boolean) {
    this._isOnHold = value;
  }

  @ViewChild('remoteVideoElement') remoteVideoElement: ElementRef;

  @Output() onEndPhoneCallComponent: EventEmitter<CallerType> = new EventEmitter<CallerType>();
  @Output() onShowToMainVideo: EventEmitter<MediaStream> = new EventEmitter<MediaStream>();
  @Output() onPrivateMessageClicked: EventEmitter<string> = new EventEmitter<string>();

  //@Input('testProperty') testProperty: string;
  //@Input('pc') pc: RTCPeerConnection;
  @Input('pc') pc: any;
  //@Input('caller') caller: CallerType;
  @Input('caller') caller: CallerType;

  isVideoHidden: boolean;

  _remoteStream: MediaStream;
  get remoteStream(): MediaStream {
    return this._remoteStream;
  }
  set remoteStream(value: MediaStream) {
    this._remoteStream = value;
  }

  ionViewWillEnter() {
      // fires each time user enters page but before the page actually becomes the active page
      // use ionViewDidEnter to run code when the page actually becomes the active page
      if (this.service.isSignalrConnected() === false) {
          this.service.startConnection();
      }
  }


  ngOnInit() {
  }

  // start RtcPeerConnection listeners
  startPeerConnectionListeners(): Promise<void> {
    console.log("starting pc listeners");
    return new Promise<void>((resolve) => {
      this.pc.oniceconnectionstatechange = (evt: Event) => {
        console.log("phone-call.component.ts pc.oniceconnectionstatechange event: ", evt);

        this.iceStateChangeHandler(this.pc.iceConnectionState);
      }

      //NOTE: this is not implemented by the current RtcPeerConnection object
      //this.pc.onconnectionstatechange = (evt: Event) => {
      //	console.log("pc.onconnectionstatechange event: ", evt);
      //}

      this.pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        this.sendICE(event.candidate, this.caller.remoteGuid)
          .then(() => {
            console.log("ice sent: ", event.candidate);
          })
          .catch((error) => {
            console.log("send ice error: ", error);
          })
      };

      this.pc.onnegotiationneeded = (event) => {
        //note this gets called by webrtc built in code
        //console.log("onnegogiationneeded evt:", event);

        //this.pc.createOffer(function (localSdpOffer) {
        //    sendLocalSdp(localSdpOffer);
        //}, logError);

        //this.pc.createOffer()
        //	.then((offer) => {
        //		return this.pc.setLocalDescription(offer);
        //	})
        //	.then(() => {
        //		// Send the offer to the remote peer through the signaling server
        //	})
        //	.catch((error) => {
        //	});
      };

      // NOTE: when we receive a remote media stream
      this.pc.onaddstream = (event: MediaStreamEvent) => {
        this.remoteStream = event.stream;
        // render the dom
        //this.isActive = true;
        this.isVideoHidden = false;
        console.log("received remote stream: ", this.remoteStream);
        let videoElement: HTMLVideoElement = this.remoteVideoElement.nativeElement;
        videoElement.setAttribute("style", "z-index:300");
        // attach the remote video to the components video element
        this.service.attachMediaStream(videoElement, this.remoteStream)
          .then(() => {
            videoElement.muted = false;
            videoElement.play();
          })
          .catch((error) => {
              console.log(" this.pc.onaddstream error: ", error);
              this.isVideoHidden = true;
          });
      };

      resolve();
    });
  }

  iceStateChangeHandler(status: RTCIceConnectionState) {
    // TODO: handle the different webrtc ice connection states

    console.log("phone-call.component.ts iceStateChangeHandler() status: ", status);

    if (status === "closed") {
      console.log("phone-call-component.ts iceStateChangeHandler() state: ", status);
      //console.log("closed: ", evt);
      this.endCall();
    }
    else if (status === "failed") {
      console.log("phone-call-component.ts iceStateChangeHandler() state: ", status);
      this.endCall();
    }
    else if (status === "disconnected") {
      console.log("phone-call-component.ts iceStateChangeHandler() state: ", status);
      this.endCall();
    }
  };

  // Note: this will be called by the caller after their call is accepted by the other user
  // the caller webRtcHub listener will receiveAcceptCall response
  startP2pConnection(): Promise<void> {
    console.log("starting P2pConnection");
    return new Promise<void>((resolve, reject) => {
      this.pc.createOffer()
        .then((localSdpOffer) => {
          return this.pc.setLocalDescription(localSdpOffer);
        })
        .then(() => {
          console.log("created localSdpOffer: ", this.pc.localDescription);
          return this.sendSDP(this.pc.localDescription, this.caller.remoteGuid);
        })
        .then(() => {
          console.log("locaSdpOffer sent to: ", this.caller.remoteGuid);
          resolve();
        })
        .catch((error) => {
          reject(error);
        })
    });
  }

  // the parent component phone-test.ts will pass the sdp info to this component
  receiveSDP(sdp: RTCSessionDescription): Promise<void> {
    let methodName = "receiveSDP";
    console.log("receivedSDP from phone-test: ", sdp);
    return new Promise<void>((resolve, reject) => {
      // in the sysetm: when we receive sdp, we set it on pc
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
          console.log("setRemoteDescription done:", this.pc.remoteDescription);
          // in the system: if the sdp is an offer, then we create an answer.
          if (this.pc.remoteDescription.type === 'offer') {
            this.pc.createAnswer()
              .then((localSdpAnswer) => {
                return this.pc.setLocalDescription(localSdpAnswer);
              })
              .then(() => {
                console.log("created localSdpAnwer: ", this.pc.localDescription);
                return this.sendSDP(this.pc.localDescription, this.caller.remoteGuid);

                //.catch((error) => {
                //	let errorMessage = this.className + "." + methodName + " send sdp answer error: " + this.jsHelperService.stringify(error);
                //	console.log(errorMessage);
                //	reject(errorMessage);
                //});
              })
              .then(() => {
                console.log("sent localSdpAnswer to: ", this.caller.remoteGuid);
                resolve();
              })
              .catch((error) => {
                let errorMessage = this.className + "." + methodName + " create sdp answer error: " + this.service.stringify(error);
                console.log(errorMessage);
                reject(errorMessage);
              });
          }
          else {
            resolve();
          }
        })
        .catch((error) => {
          let errorMessage = this.className + "." + methodName + " setRemoteDescription error: " + this.service.stringify(error);
          console.log(errorMessage);
          reject(errorMessage);
        });
    });
  }

  sendSDP(sdp: RTCSessionDescriptionInit, remoteGuid: string): Promise<void> {
    //let methodName = "sendSDP";
    //console.log("phone-component sending SDP: ", sdp, remoteGuid);
    return new Promise<void>((resolve, reject) => {
      // TODO: implement sendLocalSDP
      this.service.sendSDP(this.caller.remoteGuid, this.service.stringify(sdp))
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject("snedSDP error: " + this.service.stringify(error));
        })
    });
  }

  receiveICE(ice: RTCIceCandidate): Promise<void> {
    //let methodName = "receiveSDP";
    //console.log("receiveICE from phone-test: ", ice);
    return new Promise<void>((resolve, reject) => {
      // in the sysetm: when we receive sdp, we set it on pc
      this.pc.addIceCandidate(new RTCIceCandidate(ice))
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  sendICE(candidate: RTCIceCandidate, remoteGuid: string): Promise<void> {
    let methodName = "sendICE";
    console.log("phone-component sending ICE candidate: ", candidate, remoteGuid);
    return new Promise<void>((resolve, reject) => {
      // TODO: implement sendLocalSDP
      this.service.sendICE(this.caller.remoteGuid, this.service.stringify(candidate))
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(methodName + ": " + this.service.stringify(error));
        })
    });
  }

  addLocalStream(localStream: MediaStream): Promise<void> {
    return new Promise<void>((resolve) => {
      console.log("adding local stream: ", localStream);
      this.pc.addStream(localStream);
      resolve();
    })
  }

  endCall() {
    console.log("phone-call.component.ts endCall() caller: ", this.caller);
    this.onEndPhoneCallComponent.emit(this.caller);
  }

  async phoneCallClicked(event: any) {
    let popover = await this.popoverCtrl.create({
      component: PhoneCallActionPopoverComponent, 
      componentProps: {
      isOnHold: this.isOnHold
    }});
    //console.log(event)
    this.service.getMaterialHelperSubject().next(true);
    // this.events.publish('isVideoHidden', true);
    await popover.present();

    let {data} = await popover.onDidDismiss();
    this.service.getMaterialHelperSubject().next(false);
    if (data.action === PhoneCallAction.DISPLAY_TO_MAIN) {
      if (this.service.isEmpty(this.isOnHold)) {
        this.onShowToMainVideo.emit(this.remoteStream)
      }
    }
    else if (data.action === PhoneCallAction.HOLD) {
      this.putOnHold();
      this.onShowToMainVideo.emit(null);
    }
    else if (data.action === PhoneCallAction.PRIVATE_MESSAGE) {
      this.onPrivateMessageClicked.emit(this.caller.remoteGuid)
    }
    else if (data.action === PhoneCallAction.RESUME_HOLD) {
      this.removeOnHold();
    }
    else if (data.action === PhoneCallAction.SEND_FILE) {
      console.log("Send File action", data.action);
    }
      //switch (action) {
      //	case PhoneCallAction.DISPLAY_TO_MAIN:
      //		this.onShowToMainVideo.emit(this.remoteStream)
      //		console.log(action)
      //		break;
      //	case PhoneCallAction.HOLD:
      //		this.putOnHold();
      //		break;
      //	case PhoneCallAction.PRIVATE_MESSAGE:
      //		this.onPrivateMessageClicked.emit(this.caller.remoteGuid)
      //		console.log(action)
      //		break;
      //	case PhoneCallAction.RESUME_HOLD:
      //		this.removeOnHold();
      //		break;
      //	case PhoneCallAction.SEND_FILE:
      //		console.log(action)
      //		break;
      //	default:
      //		break;
  }

  putOnHold() {
    console.log("putOn hold called")
    this.service.sendPutOnHold(this.caller.remoteGuid)
      .then(() => {
        //this.isActive = false; // hides the video and the putOnHoldButton
        this.hideVideo(true);
        this.isOnHold = true; // displays the remove on hold button
      })
      .catch((error) => {
        console.log("phone-call.component.ts -> putOnHold error", error);
      });
  }

  removeOnHold() {
    console.log("remove onhold called")

    this.service.sendRemoveOnHold(this.caller.remoteGuid)
      .then(() => {
        //this.isActive = true; // shows the video and the put on hold button
        this.hideVideo(false);
        this.isOnHold = false; // hide the remove hold button
      })
      .catch((error) => {
        console.log("phone-call.component.ts -> removeOnHold error", error);
      });
  }

  hideVideo(isHidden: boolean) {
    if (typeof cordova !== "undefined") {
      this.ngZone.run(() => {
          this.isVideoHidden = isHidden;
          if (this.service.isIos()) {
              setTimeout(() => {
                  cordova.plugins.iosrtc.refreshVideos();
              });
          }
          
      })
    }
  }
}
