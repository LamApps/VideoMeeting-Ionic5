import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import {
  ActionSheetController,
  Platform,
} from '@ionic/angular';

import { Subscription } from 'rxjs';
import { filter, distinctUntilKeyChanged } from 'rxjs/operators';

import {
  Service,
} from '../../services/index';

import {
  SdpMessageType,
  IceMessageType,
  ObservableMessageType,
  NetcastType,
  NetcastKind,
  DataChannelKind,
  DcJsonType,
  SystemEventEnum,
  RTCDataChannelStateEnum,

  RequestNetcastStubType,
  RtcIceConnectionStateEnum,
  NetcastDto,
  MaterialAlertMessageType,
} from '../../models/index';
import { Router, ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

declare var cordova: any;
@Component({
  selector: 'app-netcaster',
  templateUrl: './netcaster.page.html',
  styleUrls: ['./netcaster.page.scss'],
})
export class NetcasterPage implements OnInit {
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private platform: Platform,
    private ngZone: NgZone,
    private service: Service,
    private router: Router,
    private route: ActivatedRoute,

  ) {
      this.isVideoHidden = false;
  }

  @ViewChild('mainVideoElement') mainVideoElement: ElementRef;


  isVideoHidden: boolean;

  onAppPause: Subscription;
  onAppResume: Subscription;
  onVideoHidden: Subscription;

  canSwitchVideo: boolean;
  mediaDevices: Array<MediaDeviceInfo>;
  availableVideoDevices: Array<MediaDeviceInfo>;
  currentVideoDevice: MediaDeviceInfo;

  netcastConnections: NetcastType[];

  // indicates the last direct child node the netcaster traversed to refer a relay
  currentRelayIndex: number = 0;

  // we only allow 3 children nodes for the netcaster
  get maxRelays(): number {
      return 3;
  }

  // used in multi camera systems
  //netcastStreamId: string;

  // for testing only, in production we only use one stream at a time, unless
  // the browser allows two cameras to be used at once.
  // mediaStreams: MediaStream[];

  mediaStream: MediaStream;

  memberId: number;
  netcastId: number;
  netcast: NetcastDto;

  //remoteGuid: string;
  localGuid: string;
  ngOnInit() {
  }
  ionViewDidEnter() {
    // fires each time view goes to foreground

    this.netcastId = Number(this.route.params.pipe(pluck('id')));

    this.netcastConnections = new Array<NetcastType>();
    this.canSwitchVideo = false;
    this.mediaDevices = new Array<MediaDeviceInfo>();
    this.availableVideoDevices = new Array<MediaDeviceInfo>();
    this.currentVideoDevice = null;
    this.mediaStream = null;

    this.onAppPause = this.platform.pause.subscribe(() => {
        if (this.service.isEmpty(this.mediaStream) === false) {
            let audioEnabled = false;
            this.service.updateMediaStreamAudio(this.mediaStream, audioEnabled);
            console.log("after mute: ", this.mediaStream);
        }

        // when app pauses, we update the db to remove connectionGuid, so others will know the
        // netcaster is not streaming
        if (!this.service.isEmpty(this.netcast) && !this.service.isEmpty(this.netcast.connectionGuid)) {
            this.netcast.connectionGuid = "";
            this.service.getAccessToken()
                .then((accessToken: string) => {
                    this.service.updateNetcast(this.netcast, accessToken);
                })
            
        }

    });

    this.onAppResume = this.platform.resume.subscribe(() => {
        if (this.service.isEmpty(this.mediaStream) === false) {
            let audioEnabled = true;
            this.service.updateMediaStreamAudio(this.mediaStream, audioEnabled);
            console.log("after unmute: ", this.mediaStream);
        }

        // when app resumes, we update the db to add connectionGuid to others will know that the
        // netcaster is netcasting
        if (!this.service.isEmpty(this.netcast) && this.service.isEmpty(this.netcast.connectionGuid)) {
            this.netcast.connectionGuid = this.localGuid;
            this.service.getAccessToken()
                .then((accessToken: string) => {
                    this.service.updateNetcast(this.netcast, accessToken);
                })
        }

    });

    this.onVideoHidden = this.service.getMaterialHelperSubject().subscribe((isHidden) => {
        // only hide or unhide video in cordova ios app
        if (typeof cordova !== "undefined" && this.service.isIos()) {
            this.ngZone.run(() => {
                // iosrtc does the opposite of intended behavior, so we add negate
                this.isVideoHidden = isHidden;
                setTimeout(() => {
                    cordova.plugins.iosrtc.refreshVideos();
                });
            })
        }
    });


    try {
      
        this.startApp();

    }
    catch (e) {
        console.log("error starting netcast: ", e);

        let alert = new MaterialAlertMessageType();
        alert.title = "Error";
        alert.message = "An error has prevented the netcast to start. Please try again later."
        this.service.openAlert(alert);

    }
}

ionViewWillEnter() {
    // fires each time user enters page but before the page actually becomes the active page
    // use ionViewDidEnter to run code when the page actually becomes the active page
    if (this.service.isSignalrConnected() === false) {
        this.service.startConnection();
    }
}

ionViewWillLeave() {
    // fires each time user leaves page, but before the user actually leaves the page
    // use ionViewDidLeave() to run code after the page unloads
    this.hangUp();
    this.endSubscriptions();
    this.service.broadcastDisconnected(this.localGuid);

    this.onVideoHidden && this.onVideoHidden.unsubscribe();
    this.onAppPause && this.onAppPause.unsubscribe();
    this.onAppResume && this.onAppResume.unsubscribe();
}

ionViewWillUnload() {
    // fired after leaving a non-cached view
}

async startApp(): Promise<void> {
    try {
        this.mediaDevices = await navigator.mediaDevices.enumerateDevices();

        console.log("mediaDevices: ", this.mediaDevices);

        this.availableVideoDevices = this.mediaDevices.filter((m: MediaDeviceInfo) => {
            return m.kind == "videoinput";
        });

        console.log("availableVideoDevices: ", this.availableVideoDevices);

        if (this.service.isEmpty(this.availableVideoDevices)) {

            throw ("no video devices found");
        }

        this.currentVideoDevice = this.availableVideoDevices[0];

        if (this.availableVideoDevices.length > 1) {
            this.canSwitchVideo = true;
            console.log("canSwitchVideo: ", this.canSwitchVideo);
        }

        this.mediaStream = await this.getMediaStream(this.mediaDevices, this.currentVideoDevice.deviceId);

        console.log("mediaStream: ", this.mediaStream);

        let accessToken: string = await this.service.getAccessToken();

        if (this.service.isEmpty(accessToken)) {
            throw ("Access is denied.");
        }

        let name: string = "";
        await this.service.initPhoneService(name);

        this.localGuid = await this.service.localGuid;
        console.log("localGuid: ", this.localGuid);

        if (this.service.isEmpty(this.localGuid)) {
            throw ("missing local Guid");
        }


        if (this.service.isEmpty(this.mediaStream)) {
            throw ("unable to get video from camera");
        }

        await this.service.attachMediaStream(this.mainVideoElement.nativeElement, this.mediaStream);

        //this.netcastStreamId = this.mediaStream.id;

        // grab the netcast db record
        this.netcast = await this.service.getNetcastById(this.netcastId, accessToken);
       
        if (!this.service.isEmpty(this.netcast)) {
          

            // make sure the netcaster is the owner of the netcast
            if (this.netcast.memberId !== this.memberId) {
                throw ("Access denied");
            }

            this.netcast.connectionGuid = this.localGuid;
            // update the netcast db record
            let canStart: boolean = await this.service.startNetcast(this.netcast.netcastId, this.localGuid, accessToken);
            if (canStart) {
                await this.startSubscriptions();
            }
            else {
                throw ("Unable to start netcast.");
            }
            
        }
        else {
            throw ("Unable to update the netcast ConnectionGuid");
        }
        
    }
    catch (e) {
        throw (e);
    }
}

async stopVideos(): Promise<void> {
    //this.mediaStream = null;

    this.service.stopMediaStream(this.mediaStream);
    if (this.service.isIos()) {
        this.mainVideoElement.nativeElement.src = null;
    }
    else {
        this.mainVideoElement.nativeElement.srcObject = null;
    }

    this.mediaStream = null;
    return;
}

async hangUp(): Promise<void> {
    console.log("hanging up");

    if (this.netcastConnections.length > 0) {
        this.netcastConnections.forEach((n: NetcastType) => {
            n.peerConnection.close();
        });

        this.netcastConnections = new Array<NetcastType>();
    }

    this.stopVideos();

    // update streaming status aka change the netcast.connectionGuid
    this.netcast.connectionGuid = "";
    let accessToken = await this.service.getAccessToken();

    await this.service.endNetcast(accessToken);
}

// #region signalr Subscriptions

receiveSDP: Subscription;
receiveICE: Subscription;
receiveRequestNetcast: Subscription;
someoneDisconnected: Subscription;
receiveDisconnect: Subscription;
receiveRequestNetcastStub: Subscription;
// #endregion

startSubscriptions(): void {
    console.log("starting subscription");

    this.receiveDisconnect = this.service.receiveDisconnect
        .asObservable()
        .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
        .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
        .subscribe(async (message: ObservableMessageType) => {
            console.log("someoneDisconnected message: ", message.timestamp);
            try {
                let remoteGuid: string = message.message;

                if (this.service.isEmpty(remoteGuid) === false) {
                    this.handleDisconnectEvent(remoteGuid);
                }
            }
            catch (e) {
                console.log("Receive someoneDisconnected error: ", e);
            }
        });

    this.someoneDisconnected = this.service.someoneDisconnected
        .asObservable()
        .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
        .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
        .subscribe(async (message: ObservableMessageType) => {
            console.log("someoneDisconnected message: ", message.timestamp);
            try {
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let result: any = JSON.parse(json);
                    // get the remoteGuid
                    let remoteGuid = result.remoteGuid;

                    //check if backupNetCasterConnection
                    this.handleDisconnectEvent(remoteGuid);
                }
                else {
                    throw ("Received empty someoneDisconnected message.")
                }
            }
            catch (e) {
                console.log("Receive someoneDisconnected error: ", e);
            }
        });

    this.receiveSDP = this.service.receiveSDP
        .asObservable()
        .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
        .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
        .subscribe(async (message: ObservableMessageType) => {
            console.log("receiveSDP message: ", message.timestamp);
            try {
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let sdpMessage: SdpMessageType = this.service.jsonToObject<SdpMessageType>(json, true);
                    console.log("receive sdp : ", sdpMessage);
                    await this.handleSdpMessage(sdpMessage);
                }
                else {
                    throw ("Received empty SDP message.")
                }
            }
            catch (e) {
                // fatal error
                //let alert = new MaterialAlertMessageType();
                //alert.title = "Error";
                //alert.message = e;
                //this.service.openAlert(alert);
                console.log("Receive SDP error: ", e);
            }
        });

    this.receiveICE = this.service.receiveICE
        .asObservable()
        .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
        .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
        .subscribe(async (message: ObservableMessageType) => {
            console.log("receiveICE message: ", message.timestamp);
            try {
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let iceMessage: IceMessageType = this.service.jsonToObject<IceMessageType>(json, true);
                    await this.handleIceMessage(iceMessage);
                }
                else {
                    throw ("Received empty ice package.")
                }
            }
            catch (e) {
                // fatal error
                //let alert = new MaterialAlertMessageType();
                //alert.title = "Error";
                //alert.message = e;
                //this.service.openAlert(alert);
                console.log("Receive ICE error: ", e);
            }
        });

    this.receiveRequestNetcast = this.service.receiveRequestNetcast
        .asObservable()
        .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
        .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
        .subscribe(async (message: ObservableMessageType) => {
            console.log("receive request netcast: ", message);
            try {
                let json = JSON.parse(message.message);
                console.log("json: ", json);
                if (this.service.isEmpty(json) === false) {
                    let remoteGuid: string = json.remoteGuid;
                    console.log("remoteGuid: ", remoteGuid);
                    if (this.netcastConnections.length < this.maxRelays) {
                        // we still have available child node slots for use
                        // NOTE: the system only allows 3 max child nodes for the root netcaster

                        if (this.service.isEmpty(this.mediaStream) === false) {
                            console.log("sendNetcastOffer: ", remoteGuid);
                            await this.sendNetcastOffer(remoteGuid, this.mediaStream);
                        }
                        else {
                            throw ("no media stream to netcast");
                        }
                    }
                    else {
                        console.log("at max relays");
                        // get an available stub and relay it to the requester
                        // the stub will relay the stream to the requester
                        // NOTE: we will switch relay indexs
                        let r: RequestNetcastStubType = new RequestNetcastStubType();
                        r.requesterGuid = remoteGuid;
                        this.requestNetcastStub(r);
                        //r.senderGuid = this.localGuid;
                    }
                }
                else {
                    throw ("Received empty request netcast.")
                }
            }
            catch (e) {
                console.trace();
                console.log("Receive request netcast error: ", e);
            }
        });

    this.receiveRequestNetcastStub = this.service.receiveRequestNetcastStub
        .asObservable()
        .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
        .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
        .subscribe(async (message: ObservableMessageType) => {
            console.log("receiveSDP message: ", message.timestamp);
            try {
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let re: RequestNetcastStubType = this.service.jsonToObject<RequestNetcastStubType>(json, true);
                    await this.handleRequestNetcastStub(re);
                }
                else {
                    throw ("Received empty SDP message.")
                }
            }
            catch (e) {
                // fatal error
                //let alert = new MaterialAlertMessageType();
                //alert.title = "Error";
                //alert.message = e;
                //this.service.openAlert(alert);
                console.log("Receive SDP error: ", e);
            }
        });
}

endSubscriptions(): void {
    console.log("ending subscriptions");
    this.receiveSDP && this.receiveSDP.unsubscribe();
    this.receiveICE && this.receiveICE.unsubscribe();
    this.receiveRequestNetcast && this.receiveRequestNetcast.unsubscribe();
    this.someoneDisconnected && this.someoneDisconnected.unsubscribe();
}

startPeerConnectionListeners(netcast: NetcastType): void {
    console.log("starting pc listeners" + this.service.stringify(netcast.peerConnection));
    try {

        netcast.peerConnection.oniceconnectionstatechange = (evt: Event) => {
            console.log("oniceconnectionstatechange event: ", evt);

            this.iceStateChangeHandler(netcast);
        }

        netcast.peerConnection.onicecandidate = async (event: RTCPeerConnectionIceEvent): Promise<void> => {
            try {
                console.log("sending ice to " + netcast.remoteGuid + " : ", event.candidate);
                await this.service.getAccessToken();
                await this.service.sendICE(netcast.remoteGuid, this.service.stringify(event.candidate))
            }
            catch (e) {
                console.log("send ice error: ", e);
            }
        };

        netcast.peerConnection.onnegotiationneeded = async (event: Event): Promise<void> => {
            //note this gets called by webrtc built in code
            console.log("onnegogiationneeded evt:", event);
            //let localSdpOffer: RTCSessionDescriptionInit = await netcast.peerConnection.createOffer();
            //await netcast.peerConnection.setLocalDescription(localSdpOffer);
            //await this.service.sendSDP(netcast.remoteGuid, this.service.stringify(localSdpOffer));

            return;
        };

        // NOTE: when we receive a remote media stream
        //netcast.peerConnection.ontrack = (event: RTCTrackEvent) => {
        //    // in the current system, the netcaster won't receive a stream from another user
        //}

        //pc.onaddstream = async (event: MediaStreamEvent) => {
        //	console.log("reveiced Remote Stream: ", event.stream);
        //};

        netcast.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            console.log("netcast.peerConnection.ondatachannel event: ", event);
            let dc = event.channel;
            this.startDataChannelListeners(dc);
        }

        //netcast.peerConnection.onconnectionstatechange = (event: Event) => {
        //    console.log("netcast.peerConnection.onconnectionstatechange", event);
        //}

        netcast.peerConnection.onicegatheringstatechange = (event: Event) => {
            console.log("netcast.peerConnection.onicegatheringstatechange", event);
        }

        netcast.peerConnection.onsignalingstatechange = (event: Event) => {
            console.log("netcast.peerConnection.onsignalingstatechange", event);
        }
        
        return;
    }
    catch (e) {
        throw (e);
    }
}

startDataChannelListeners(dc: RTCDataChannel): void {
    dc.onbufferedamountlow = (event: Event) => {
        console.log("datachannel.onbufferedamountlow event", event)
    };

    dc.onerror = (event: any) => {
        console.log("datachannel.onerror event: ", event);
    };

    dc.onmessage = async (event: MessageEvent): Promise<void> => {
        console.log("datachannel.onmessage event: ", event);
        await this.handleDcMessage(event);
        return;
    };

    dc.onopen = (event: Event) => {
        console.log("datachannel.onopen event: ", event);
    };

    dc.onclose = (event: Event) => {
        console.log("datachannel.onclose event: ", event);
    };
}

async handleDcMessage(event: MessageEvent): Promise<void> {
    try {
        let remoteDc: RTCDataChannel = event.target as RTCDataChannel;
        let json: string = event.data;

        //console.log("handling DcMessage json: ", json);

        let dcKind: string = remoteDc.label;
        if (dcKind === DataChannelKind.dcJsonType) {
            let dcJsonType: DcJsonType = this.service.jsonToObject<DcJsonType>(json);
            //console.log("dcJsonType: ", dcJsonType);
            let remoteGuid = dcJsonType.remoteGuid;
            let typeName: string = dcJsonType.objectType;

            //NOTE: we only handle expected types
            switch (typeName) {
                case String.name:
                    await this.handleStringMessage(dcJsonType.json);
                    break;
                case SystemEventEnum.name:
                    let systemEvent: SystemEventEnum = dcJsonType.json as SystemEventEnum;
                    await this.handleSystemEvent(systemEvent, remoteGuid);
                    break;
                case RequestNetcastStubType.objectName:
                    let r: RequestNetcastStubType = this.service.tryParseJson(dcJsonType.json) as RequestNetcastStubType;
                    this.handleRequestNetcastStub(r);
                    break;
                case SdpMessageType.name:
                    let sdpMessage: SdpMessageType = this.service.tryParseJson(dcJsonType.json) as SdpMessageType;
                    await this.handleSdpMessage(sdpMessage);
                    break;
                default:
                    throw ("Received unknow objectType from " + DataChannelKind.dcJsonType);
            }
        }
        else if (dcKind === DataChannelKind.dcBinaryType) {
            console.log("receive binary data: ", json);
            // TODO: write handler to handle binary data
        }
        else {
            throw ("unknown DataChannelKind: " + dcKind);
        }

        return;
    }
    catch (e) {
        throw (e);
    }
}

async handleStringMessage(message: string): Promise<void> {
    console.log("received dc string message: ", message);
    return;
}

async handleSystemEvent(systemEvent: SystemEventEnum, remoteGuid: string): Promise<void> {
    try {
        console.log('received system event: ', systemEvent, remoteGuid);
        switch (systemEvent) {
            case SystemEventEnum.disconnected:
                this.handleDisconnectEvent(remoteGuid);
                break;
            default:
                throw ("Unknown system event: " + systemEvent);
        }

        return;
    }
    catch (e) {
        throw (e);
    }
}

handleDisconnectEvent(remoteGuid: string): void {
    // remove the user from netcastConnections array
    let netcast: NetcastType = this.getPc(remoteGuid, this.netcastConnections);
    if (this.service.isEmpty(netcast) === false) {
        this.removePc(netcast);
    }
    return;
}

async handleSdpMessage(sdpMessage: SdpMessageType): Promise<void> {
    try {
        if (this.service.isEmpty(sdpMessage) === false && this.service.isEmpty(sdpMessage.sender) === false) {
            let sdp: RTCSessionDescription = this.service.jsonToObject<RTCSessionDescription>(sdpMessage.sdp);
            if (sdp.type === "answer") {
                let n: NetcastType = this.getPc(sdpMessage.sender, this.netcastConnections);
                if (n) {
                    await n.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
                }
                else {
                    throw ("unable to get peerconnection to handle the sdp answer from remoteGuid: " + sdpMessage.sender);
                }
            }
            else {
                throw ("netcaster currently can not receive offers. Did not receive sdp answer: " + this.service.stringify(sdpMessage));
            }
        }
        else {
            throw ("Received SDP message without other users information.")
        }
    }
    catch (e) {
        throw (e);
    }
}

async handleIceMessage(iceMessage: IceMessageType): Promise<void> {
    try {
        console.log("handling iceMessage: ", iceMessage);

        if (this.service.isEmpty(iceMessage) === false && this.service.isEmpty(iceMessage.sender) === false) {
            let ice: RTCIceCandidate = this.service.jsonToObject<RTCIceCandidate>(iceMessage.ice, true);
            let n: NetcastType = this.getPc(iceMessage.sender, this.netcastConnections);
            if (n) {

                if (this.service.isEmpty(ice) === false) {
                    await n.peerConnection.addIceCandidate(new RTCIceCandidate(ice));
                }
                else {
                    // nothing to handle, null ice signals end of sending ice packages
                    console.log("end of ice");
                    await n.peerConnection.addIceCandidate(null);

                }
            }
            else {
                throw ("unable to retrieve peerconnection to handle ice message from: " + iceMessage.sender);
            }

        }
        else {
            throw ("Received is package without the other users information.");
        }

        return;
    }
    catch (e) {
        throw (e);
    }
}

async handleRequestNetcastStub(r: RequestNetcastStubType): Promise<void> {
    // check if this node has any children node slots available
    // NOTE: a node will have upto maxRelay nodes
    if (this.netcastConnections.length < this.maxRelays) {
        // TODO: this is node is a stub, using signalr to send this users remoteGuid
        // to the requester. The requeter will then connect to this stub
        await this.service.sendNetcastStub(r.requesterGuid);
        return;
    }
    else {
        // this node is full, send the message down the line
        this.requestNetcastStub(r);
        return;
    }
}

iceStateChangeHandler(netcast: NetcastType) {
    if (this.service.isEmpty(netcast) === false) {
        let status = netcast.peerConnection.iceConnectionState;
        switch (status) {
            case RtcIceConnectionStateEnum.closed:
                this.handleIceConnectionStateClosed(netcast);
                break;
            case RtcIceConnectionStateEnum.failed:
                this.handleIceConnectionStateFailed(netcast);
                break;
            case RtcIceConnectionStateEnum.disconnected:
                console.log("IceConnectionState: ", RtcIceConnectionStateEnum.disconnected);
                break;
            case RtcIceConnectionStateEnum.completed:
                console.log("IceConnectionState: ", RtcIceConnectionStateEnum.completed);
                break;
            default:
                console.log("IceConnectionState: ", status)
        }
    }
    else {
        console.log("netcast is empty because previously handled");
    }
};

handleIceConnectionStateFailed(netcast: NetcastType) {
    console.log("ice status failed: ", status);
    // fallback, will remove netcast if exist in array
    //let n: NetcastType = this.netcastConnections.find((n: NetcastType) => {
    //	return n.peerConnection.remoteDescription.sdp == netcast.peerConnection.remoteDescription.sdp;
    //});

    if (this.service.isEmpty(netcast) === false) {
        this.removePc(netcast);
    }
}

handleIceConnectionStateClosed(netcast: NetcastType) {
    console.log("ice status closed: ", status);
    // fallback, will remove netcast if exist in array
    //let n: NetcastType = this.netcastConnections.find((n: NetcastType) => {
    //	return n.peerConnection.remoteDescription.sdp == netcast.peerConnection.remoteDescription.sdp;
    //});

    if (this.service.isEmpty(netcast) === false) {
        this.removePc(netcast);
    }
}

removePc(netcast: NetcastType): NetcastType {
    // removes the netcast from array and returns it
    try {
        let index = this.netcastConnections.findIndex((n: NetcastType) => {
            return n.remoteGuid == netcast.remoteGuid;
        });

        if (index > -1) {
            netcast.peerConnection.close();
            // delete one element from array and return first deleted element
            return this.netcastConnections.splice(index, 1)[0];
        }
        else {
            return null;
        }
    }
    catch (e) {
        throw (e);
    }
}

getPc(remoteGuid: string, netcasts: NetcastType[]) {
    return netcasts.find((n: NetcastType) => {
        return n.remoteGuid == remoteGuid;
    });
}

showPeers(): void {
    console.log("netcastConnections : ", this.netcastConnections);
}

async sendNetcastOffer(remoteGuid: string, mediaStream: MediaStream): Promise<void> {
    try {
        let outgoing: NetcastType;

        console.log("getting pc");
        outgoing = this.getPc(remoteGuid, this.netcastConnections);
        console.log("got pc", outgoing);

        if (this.service.isEmpty(outgoing) === false) {
            // if remoteGuid exists in array, replace mediastream
            console.log("switching mediastream");
            await this.switchMediaStream(outgoing, mediaStream);
            console.log("done switching mediastream");
        }
        else {
            // remoteGuid does not exist, create new pc and push it to array
            console.log("creating outgoing");
            outgoing = this.initNetcast(remoteGuid, NetcastKind.outgoing);
            console.log("new outgoing: ", outgoing);
            outgoing.mediaStream = mediaStream;

            console.log("outgoing adding tracks");
            outgoing.mediaStream.getTracks().forEach((t: MediaStreamTrack) => {
                outgoing.peerConnection.addTrack(t, outgoing.mediaStream);
            });

            let localSdpOffer: RTCSessionDescriptionInit = await outgoing.peerConnection.createOffer();
            console.log("created localSdpOffer: ", localSdpOffer);
            await outgoing.peerConnection.setLocalDescription(localSdpOffer);
            console.log("sending sdp Offer to: ", outgoing.remoteGuid, localSdpOffer);

            await this.service.getAccessToken();
            console.log("sending sdp");
            await this.service.sendSDP(outgoing.remoteGuid, this.service.stringify(localSdpOffer));
        }
        return;
    }
    catch (e) {
        throw (e);
    }
}

requestNetcastStub(r: RequestNetcastStubType, currentTry?: number): boolean {
    // switch to next PeerConnection, transverse down the node to get the next available remoteGuid node to relay
    // send the free node's remoteGuid to the user requesting a netcast
    // the user will then send the requestNetcast request to the available relay node

    console.log("try: ", currentTry);

    let maxTrys: number = 3;
    if (typeof currentTry === "undefined") {
        currentTry = 0;
    }
    else {
        currentTry++;
    }

    if (currentTry <= maxTrys) {
        let relayIndex: number = this.getRelayIndex();

        let netcastBranch: NetcastType = this.netcastConnections[relayIndex];
        if (this.service.isEmpty(netcastBranch)) {
            if (currentTry < maxTrys) {
                return this.requestNetcastStub(r, currentTry);
            }
            else {
                // unable to send request
                return false;
            }
        }
        else {
            // send the request to get node relay stub using datachannel and then signalr fallback
            let dc: RTCDataChannel = netcastBranch.getDataChannel(DataChannelKind.dcJsonType);
            if (this.service.isEmpty(dc) === false) {
                if (dc.readyState == RTCDataChannelStateEnum.open) {
                    let message = new DcJsonType();
                    message.remoteGuid = this.localGuid;
                    message.json = this.service.stringify(r);
                    message.objectType = RequestNetcastStubType.objectName;
                    dc.send(this.service.stringify(message));

                    // request sent
                    return true;
                }
                else {
                    // datachannel not ready for this node, move to the next one
                    return this.requestNetcastStub(r, currentTry);
                }
            }
            else {
                //no datachannel, use signalr fallback

                this.service.sendRequestNetcastStub(netcastBranch.remoteGuid, r);
                return true;
            }
        }
    }
    else {
        console.log("too many trys");
        return;
    }
}

getRelayIndex(): number {
    // this method is used to switch between the relay branches
    ++this.currentRelayIndex; //increment
    let relayIndex: number = this.currentRelayIndex; //assign
    if (relayIndex >= this.maxRelays) {
        relayIndex = 0; //reset
    }

    return relayIndex;
}

initNetcast(remoteGuid: string, netcastKind: NetcastKind): NetcastType {

    console.log("initNetcast remoteGuid, netcastKind: ", remoteGuid, netcastKind);

    try {
        let netcast: NetcastType = this.getPc(remoteGuid, this.netcastConnections);

        if (this.service.isEmpty(netcast)) {
            console.log("no existing netcast");
            netcast = new NetcastType();
            netcast.remoteGuid = remoteGuid;
            console.log("created netcastType:", netcast);
            let pc: RTCPeerConnection = this.service.createRtcPeerConnection();
            console.log("created peerConnection: ", pc);
            // Create all your data channels when you create your peerconnection
            // otherwise creating a new datachannel will trigger onnegotiationneeded
            if ("createDataChannel" in pc) {
                try {
                    console.log("datachannel in pc");
                    let dc: RTCDataChannel = pc.createDataChannel(DataChannelKind.dcJsonType);
                    console.log("dc: ", dc);
                    netcast.dataChannels.push(dc);
                    console.log("added dc");
                }
                catch (e) {
                    console.log("unable to create datachannel error: ", e)
                }

            }

            pc.oniceconnectionstatechange = (evt: Event) => {
                console.log("oniceconnectionstatechange event: ", evt);

                this.iceStateChangeHandler(netcast);
            }

            pc.onicecandidate = async (event: RTCPeerConnectionIceEvent): Promise<void> => {
                try {
                    console.log("sending ice to " + netcast.remoteGuid + " : ", event.candidate);
                    await this.service.getAccessToken();
                    await this.service.sendICE(netcast.remoteGuid, this.service.stringify(event.candidate))
                }
                catch (e) {
                    console.log("send ice error: ", e);
                }
            };

            netcast.peerConnection = pc;
            netcast.peerConnection.addIceCandidate(null);
            console.log("starting Pc listeners");
            //this.startPeerConnectionListeners(netcast);


           

   
          

            console.log("finished pc listeners");
            netcast.netcastKind = netcastKind;
            console.log("netcastConnections: ", this.netcastConnections);
            this.netcastConnections.push(netcast);
        }

        return netcast;
    }
    catch (e) {
        throw (e);
    }
}

async switchMediaStream(netcast: NetcastType, newMediaStream: MediaStream): Promise<void> {
    let promises = [];

    netcast.mediaStream = newMediaStream;

    let senders = netcast.peerConnection.getSenders();
    //console.log("senders: ", senders);

    let tracks = netcast.mediaStream.getTracks();
    //console.log("tracks: ", tracks);

    senders.forEach((s: RTCRtpSender) => {
        promises.push(
            s.replaceTrack(
                tracks.find((t: MediaStreamTrack) => {
                    return t.kind == s.track.kind;
                })
            )
        );
    })

    let results = Promise.all(promises);

    console.log("offerVideo results: ", results);

    return;
}

async switchCamera(): Promise<void> {
    try {
        if (this.canSwitchVideo === true) {
            console.log("this.currentVideoDevice: ", this.currentVideoDevice);

            let currentDeviceId: string = this.currentVideoDevice.deviceId;
            let lastIndex: number = this.availableVideoDevices.length - 1;
            let nextIndex: number = -1;
            let index: number = this.availableVideoDevices.findIndex((m: MediaDeviceInfo) => {
                return m.deviceId == currentDeviceId;
            });

            if (index < 0) {
                throw ("No media devices found.");
            }

            if (index < lastIndex) {
                nextIndex = index + 1;
            }
            else {
                nextIndex = 0;
            }

            this.currentVideoDevice = this.availableVideoDevices[nextIndex];

            console.log("switch videoDevice: ", this.currentVideoDevice);

            this.service.stopMediaStream(this.mediaStream);
            this.mediaStream = null;
            if (this.service.isIos()) {
                this.mainVideoElement.nativeElement.src = null;
            }
            else {
                this.mainVideoElement.nativeElement.srcObject = null;
            }

            this.mediaStream = await this.getMediaStream(this.mediaDevices, this.currentVideoDevice.deviceId);

            await this.service.attachMediaStream(this.mainVideoElement.nativeElement, this.mediaStream);

            let promises = [];

            this.netcastConnections.forEach((n: NetcastType) => {
                promises.push(this.switchMediaStream(n, this.mediaStream));
            });

            let result = await Promise.all(promises);
            console.log("swithCamera result: ", result);

            return;
        }
        else {
            throw ("Device does not have another camera to switch");
        }

    }
    catch (e) {
        console.log("switchCamera error: ", e);
    }
}

async getMediaStream(mediaDevices: Array<MediaDeviceInfo>, videoDeviceId: string): Promise<MediaStream> {
    try {
        let hasSpeakers: boolean = false;
        let hasMicroPhone: boolean = false;
        let hasCamera: boolean = false;

        let audioOutputIndex: number = mediaDevices.findIndex((m: MediaDeviceInfo) => {
            return m.kind === "audiooutput" && this.service.isEmpty(m.groupId) === false;
        });

        if (audioOutputIndex > -1) {
            hasSpeakers = true;
        }

        let audioInputIndex: number = mediaDevices.findIndex((m: MediaDeviceInfo) => {
            return m.kind === "audioinput";
        });

        if (audioInputIndex > -1) {
            hasMicroPhone = true;
        }

        let videoDeviceIndex: number = mediaDevices.findIndex((m: MediaDeviceInfo) => {
            return m.kind === "videoinput";
        });

        if (videoDeviceIndex > -1) {
            hasCamera = true;
        }

        if (hasCamera === false) {
            throw ("No cameras found.");
        }

        // TODO: put together the constraints and grab the LocalMediaStream
        // for the deviceId

        let constraints: MediaStreamConstraints = {};

        let videoConstraints: MediaTrackConstraints = {
            deviceId: { exact: videoDeviceId }
        }

        //let videoConstraints: MediaTrackConstraints = {
        //    deviceId: { exact: videoDeviceId },
        //    frameRate: 15,
        //    width: 320,
        //    height: 240
        //}

        constraints.video = videoConstraints;
        constraints.audio = (hasSpeakers && hasMicroPhone) ? true : false;

        let mediaStream: MediaStream = await this.getUserMedia(constraints);

        return mediaStream;
    }
    catch (e) {
        //console.log("e: ", e);
        throw (e);
    }
}

async getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    try {
        let mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        return mediaStream;
    }
    catch (e) {
        throw (e);
    }
}

async deleteAllConnections(): Promise<void> {
    let promises = [];
    this.netcastConnections.forEach((n: NetcastType) => {
        promises.push(
            this.sendDisconnect(n)
                .catch((e) => {
                    return;
                })
                .then(() => {
                    this.removePc(n);
                    return;
                })
        );

    });
    let results = await Promise.all(promises);
    console.log("deleteAllConnections results: ", results);
}

async sendDisconnect(netcast: NetcastType): Promise<void> {
    let dc: RTCDataChannel = netcast.getDataChannel(DataChannelKind.dcJsonType);
    if (this.service.isEmpty(dc) === false && dc.readyState === RTCDataChannelStateEnum.open) {
        let message = new DcJsonType();
        message.remoteGuid = this.localGuid;
        // TODO: status should be from a lookup list or enum
        message.json = SystemEventEnum.disconnected;
        message.objectType = SystemEventEnum.name;
        dc.send(this.service.stringify(message));
    }
    else {
        await this.service.getAccessToken();
        await this.service.sendDisconnect(netcast.remoteGuid);
    }

    return;
}

showAllVideos() {
    if (typeof cordova !== "undefined" && this.service.isIos()) {
        this.ngZone.run(() => {
            this.isVideoHidden = false;
            setTimeout(() => {
                cordova.plugins.iosrtc.refreshVideos();
            });
        })
    }
}

hideAllVideos() {
    if (typeof cordova !== "undefined" && this.service.isIos()) {
        this.ngZone.run(() => {
            this.isVideoHidden = true;
            setTimeout(() => {
                cordova.plugins.iosrtc.refreshVideos();
            });
        })
    }
}

async openActionSheet(): Promise<void> {
    let afterCloseShowVideos: boolean = true;
    //let actionButtons: Array<any> = [
    //    {
    //        text: 'Close Menu',
    //        role: 'destructive', // will always sort to be on the bottom
    //        icon: !this.service.isIos() ? 'close' : null
    //    },
    //    {
    //        text: 'Switch Camera',
    //        icon: !this.service.isIos() ? 'camera' : null,
    //        handler: () => {
    //            this.switchCamera();
    //        }
    //    },
    //    {
    //        text: 'Disconnect All',
    //        icon: !this.service.isIos() ? 'close' : null,
    //        handler: () => {
    //            this.deleteAllConnections();
    //        }
    //    },
    //    {
    //        text: 'Peers',
    //        icon: !this.service.isIos() ? 'people' : null,
    //        handler: () => {
    //            this.showPeers();
    //        }
    //    }

    //];

    let actionButtons: Array<any> = [
        {
            text: 'Close Menu',
            role: 'destructive', // will always sort to be on the bottom
            icon: !this.service.isIos() ? 'close' : null
        },
        {
            text: 'Switch Camera',
            icon: !this.service.isIos() ? 'camera' : null,
            handler: () => {
                this.switchCamera();
            }
        },
        {
            text: 'Exit',
            icon: !this.service.isIos() ? 'close' : null,
            handler: () => {
                // this.navCtrl.setRoot(NetcastListPage);
                this.router.navigate(['netcast-list']);
            }
        }

    ];

    let actionSheet = await this.actionSheetCtrl.create({
        buttons: actionButtons
    });

    if (this.service.isIos()) {
        this.hideAllVideos();
    }

    await actionSheet.present();

    await actionSheet.onDidDismiss();
    if (afterCloseShowVideos) {
        if (this.service.isIos()) { this.showAllVideos(); }
    }
  }

}
