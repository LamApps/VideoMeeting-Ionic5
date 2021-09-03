import { Component, OnInit, ComponentFactory,
  ComponentFactoryResolver,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  ElementRef,
  NgZone } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { Router } from '@angular/router';
//import { ScreenOrientation } from '@ionic-native/screen-orientation';
//import { AndroidPermissions } from '@ionic-native/android-permissions';
//import { Diagnostic } from '@ionic-native/diagnostic';
import { Subscription } from 'rxjs';
import { filter, distinctUntilKeyChanged } from 'rxjs/operators';

import {
    NavController,
    NavParams,
    AlertController,
    ModalController,
    LoadingController,
    //PopoverController,
    //FabList,
    //FabContainer,
    ActionSheetController,
    Platform,
} from '@ionic/angular';

import { PhoneCallComponent } from 'src/app/components/phone-call/phone-call.component';

import {
    ContactSearchModalComponent
} from '../../components/contact-search-modal/contact-search-modal.component'

import {
    PhoneLineInvitationModalComponent
} from '../../components/phone-line-invitation-modal/phone-line-invitation-modal.component'

import {
    CallType,
    SdpMessageType,
    IceMessageType,
    ProfileDto,
    PhoneLineConnectionType,
    CallerType,
    NotReadyForCallType,
    SmsMessageType,
    IncomingCallResponseEnum,
    ObservableMessageType,

    GenericUserType,
    TextMessageType,
    FormItemType,
    SendCopyOfMessageDto,
    MemberType,
    GuestProfileType,
    PbxLineDto,
    CompanyProfileDto,
    PbxCustomerType,
    PbxCallQueueDto,
    LongIdDto,
    PbxLineRepDto,
    PbxLineRepStatusDto,
    CompanyEmployeeDto,
    MaterialAlertMessageType
} from '../../models/index';

import {
    Service,
} from '../../services/index';
import { FormGetInfoComponent, PrivateMessagingComponent, FormCustomerPbxComponent, CustomerPbxInfoComponent, IncomingCallModalComponent, } from '../../components/index';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

//import 'webrtc-adapter';

declare var cordova: any;
@Component({
  selector: 'app-customer-pbx',
  templateUrl: './customer-pbx.page.html',
  styleUrls: ['./customer-pbx.page.scss'],
})
export class CustomerPbxPage implements OnInit {
  isChatExpanded: boolean = false;
  smsMessages: SmsMessageType[] = new Array;

  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private navCtrl: NavController,
      private modalCtrl: ModalController,
      private actionSheetCtrl: ActionSheetController,
      private platform: Platform,
      private navParams: NavParams,
      private alertCtrl: AlertController,
      private statusBar: StatusBar,
      private ngZone: NgZone,
      private service: Service,
      private loadingCtrl: LoadingController,
      private fb: FormBuilder,
      private router: Router,
  ) {
      this.hasIncoming = false;
      this.users = new Array<GenericUserType>();
      this.statusMessage = "";
      this.totalWaitTime = "";
      this.customersAhead = 0;
      this.createForm();
  }

  ngOnInit() {
  }
    // #region variables
    onAppPause: Subscription;
    onAppResume: Subscription;
    onVideoHidden: Subscription;

    callEnded: boolean;
    totalWaitTime: string;
    customersAhead: number;

    employee: GenericUserType;

    _companyEmployee: CompanyEmployeeDto;
    get companyEmployee(): CompanyEmployeeDto {
        return this._companyEmployee;
    }
    set companyEmployee(value: CompanyEmployeeDto) {
        this._companyEmployee = value;
        if (this.service.isEmpty(value) === false) {
            this.employee = new GenericUserType();

            this.employee.id = value.companyEmployeeId.toString();
            this.employee.name = value.member.firstName;
            this.employee.imgSrc = this.service.isEmpty(value.avatarFilename) ? this.service.defaultAvatar
                : this.service.pbxContentUrl + value.companyProfileId.toString() + "/" + this.service.employeeImageFolder + "/" + value.avatarFilename + "?" + Date.now().toString();
        }
        else {
            this.employee = null;
        }
    }

    statusMessage: string;
    pbxline: PbxLineDto;

    _companyProfile: CompanyProfileDto;
    set companyProfile(value: CompanyProfileDto) {
        this._companyProfile = value;

        if (this.service.isEmpty(value) === false) {
            this.genericCompanyProfile = new GenericUserType();
            this.genericCompanyProfile.id = value.companyProfileId.toString();
            this.genericCompanyProfile.name = value.companyName;
            this.genericCompanyProfile.imgSrc = this.service.isEmpty(value.logoFilename) ? this.service.defaultAvatar
                : this.service.pbxContentUrl + value.companyProfileId.toString() + "/" + value.logoFilename + "?" + Date.now().toString();
        }
        else {
            this.genericCompanyProfile = null;
        }
    }
    get companyProfile(): CompanyProfileDto {
        return this._companyProfile;
    }
    genericCompanyProfile: GenericUserType;

    customerProfile: PbxCustomerType;

    pagingTimer: number;

    pbxLineRep: PbxLineRepDto;
    pbxlineRepStatus: PbxLineRepStatusDto;

    _pbxCallQueue: PbxCallQueueDto;
    get pbxCallQueue(): PbxCallQueueDto {
        return this._pbxCallQueue;
    }

    async setPbxCallQueue(value: PbxCallQueueDto, accessToken: string): Promise<void> {
        //console.log("setPbxCallQueue: ", value, accessToken);
        this._pbxCallQueue = value;
        if (this.service.isEmpty(value) === false) {
            try {
                //let accessToken = await this.service.getAccessToken();
                if (this.service.isEmpty(accessToken) === false) {
                    if (this.service.isEmpty(value.pbxLineRepId) === false) {
                        if (this.service.isEmpty(this.pbxLineRep) ||
                            (this.service.isEmpty(this.pbxLineRep) === false && this.pbxLineRep.pbxLineRepId !== value.pbxLineRepId)
                        ) {
                            let idDto = new LongIdDto();
                            idDto.id = value.pbxLineRepId;
                            let statuses = await this.service.getPbxLineRepStatusByPbxLineRepId(idDto, accessToken);
                            //console.log("statuses: ", statuses);
                            let status = this.service.isEmpty(statuses) ? null : statuses[0];
                            if (this.service.isEmpty(status) === false) {
                                // we have a record.
                                this.pbxlineRepStatus = status;
                                // now we need to send a ping to confirm they are really online
                                // when we receive the response, then we will add the rep
                                await this.service.sendPing(status.connectionGuid);
                            }
                        }
                        else {
                            // its the same rep, so no need to update rep information
                        }
                    }
                    else {
                        // no rep assigned

                        this.clearRep();
                    }
                }
            }
            catch (e) {
                //console.log("error: ", e);
                //this.alertCtrl.create({
                //  title: "Error",
                //  message: e,
                //  buttons: ["OK"]
                //})

                let alert = new MaterialAlertMessageType();
                alert.title = "Error";
                alert.message = e.toString();
                this.service.openAlert(alert);
            }
        }
        else {
            this.clearRep();
        }
    }

    localGuid: string;
    sendInviteTimerRef: number; // timer for sending invite

    users: Array<GenericUserType>; // the list of users in the current phone conversation

    currentMessage: TextMessageType; // the most recente textMessage

    _textMessages: Array<TextMessageType>; // the list of textmessages
    get textMessages(): Array<TextMessageType> {
        return this._textMessages;
    }
    set textMessages(value: Array<TextMessageType>) {
        this._textMessages = value;
    }

    isBusy: boolean;

    callingTimer: number;

    currentAlert: HTMLIonAlertElement;

    phonelineInvitationModal: HTMLIonModalElement;
    incomingCallModal: HTMLIonModalElement;

    hasIncoming: boolean;

    isVideoHidden: boolean;

    //isLoggedIn: boolean;

    //isMember: boolean;

    // #endregion variables

    // #region ViewChild and Component Refs

    @ViewChild('phoneCallComponentInsert', { read: ViewContainerRef }) phoneCallComponentInsert: ViewContainerRef;
    @ViewChild('localVideoElement') localVideoElement: ElementRef;
    @ViewChild('mainVideoElement') mainVideoElement: ElementRef;
    @ViewChild('chatbox') private chatboxContainer: ElementRef;

    private _phoneCallComponentFactory: ComponentFactory<PhoneCallComponent>;
    get phoneCallComponentFactory(): ComponentFactory<PhoneCallComponent> {
        return this._phoneCallComponentFactory;
    }
    set phoneCallComponentFactory(value: ComponentFactory<PhoneCallComponent>) {
        this._phoneCallComponentFactory = value;
    }

    private phoneCallComponentRefs: Array<ComponentRef<PhoneCallComponent>>;

    // #endregion ViewChild and Component Refs

    // #region subscriptions
    receivePhoneLineInvitation: Subscription;

    receiveReadyForCall: Subscription;
    receiveNotReadyForCall: Subscription;
    receiveSDP: Subscription;
    receiveICE: Subscription;

    receiveNotAcceptCall: Subscription;
    receiveRemoteLogout: Subscription;
    receivePutOnHold: Subscription;
    receiveRemoveOnHold: Subscription;
    receiveGroupSmsMessage: Subscription;
    receivePrivateSmsMessage: Subscription;
    receiveHangUpNotice: Subscription;
    receiveCancelInvitation: Subscription;

    receivePingResponse: Subscription;
    receivePing: Subscription;
    receiveNewPbxLineRep: Subscription;
    receivePbxCallQueueOccupants: Subscription;

    // #endregion subscriptions

    // fired before everything, to check if a user can access a view

    // fires each time view goes to foreground
    ionViewDidEnter() {
        this.isVideoHidden = false;

        this.onVideoHidden = this.service.getMaterialHelperSubject().subscribe((isHidden)=>{
          if (typeof cordova !== "undefined" && this.service.isIos()) {
            this.ngZone.run(() => {
                // iosrtc does the opposite of intended behavior, so we add negate
                this.isVideoHidden = isHidden;
                setTimeout(() => {
                    cordova.plugins.iosrtc.refreshVideos();
                });
            })
          }
        })

        this.onAppPause = this.platform.pause.subscribe(() => {
            // disable all remote stream audio tracks
            if (this.service.isEmpty(this.phoneCallComponentRefs) === false) {
                this.phoneCallComponentRefs.forEach((p: ComponentRef<PhoneCallComponent>) => {
                    let phoneCallComponent = p.instance;
                    if (this.service.isEmpty(phoneCallComponent.remoteStream) === false) {
                        this.service.updateMediaStreamAudio(phoneCallComponent.remoteStream, false);
                    }
                });
            }
        });

        this.onAppResume = this.platform.resume.subscribe(async () => {
            // re-enable all remote stream audio tracks
            if (this.service.isEmpty(this.phoneCallComponentRefs) === false) {
                this.phoneCallComponentRefs.forEach((p: ComponentRef<PhoneCallComponent>) => {
                    let phoneCallComponent = p.instance;
                    if (this.service.isEmpty(phoneCallComponent.remoteStream) === false) {
                        this.service.updateMediaStreamAudio(phoneCallComponent.remoteStream, true);
                    }
                });
            }

            let canActivatePage: boolean = await this.service.canActivatePage();
            if (this.service.isEmpty(canActivatePage) === false) {
                let isLoggedIn: boolean = await this.service.getIsLoggedIn();
                if (this.service.isEmpty(isLoggedIn)) {
                    // prompt for login to resume
                    let didLogin: boolean = await this.service.promptLoginChoices();
                    if (this.service.isEmpty(didLogin)) {
                        // this.navCtrl.setRoot(LoginPage);
                    }
                }
            }
            else {
                // this.navCtrl.setRoot(LoginPage);
            }
        });

        let pbxLineId = this.navParams.get("pbxlineId");
        //console.log("pbxlineId: ", pbxLineId);
        let loader : HTMLIonLoadingElement;
        this.loadingCtrl.create({
            message: "Please wait...",
            duration: 5000
        }).then((loadRes)=>{
          loadRes.present();
          loader = loadRes;
        });

        if (this.service.isIos()) { this.hideAllVideos(); }

        this.localGuid = this.service.localGuid;

        this.service.checkCameraPermissions()
            .then((permission: boolean) => {
                if (permission === true) {
                    return this.service.checkMicrophonePermissions();
                }
                else {
                    throw("Permission to use the camera is required");
                }

            })
            .then((permission: boolean) => {
                if (permission) {
                    return this.startLocalVideo();
                }
                else {
                    throw ("Permission to use the microphone is required");
                }
            })
            .then(() => {
               
                if (this.service.isEmpty(pbxLineId)) {
                    throw ("Missing phone line identifier");
                }
                else {
                    return this.startApp(pbxLineId);
                }
               
            })
            .catch((e) => {
                let alert = new MaterialAlertMessageType();
                alert.title = "Permission Error";
                alert.message = e;
                this.service.openAlert(alert);
            })
            .then(() => {
                loader && loader.dismiss();
            })

        loader.onDidDismiss().then(() => {
            if (this.service.isIos()) { this.showAllVideos(); }
        })
    }

    ionViewWillEnter() {
        // fires each time user enters page but before the page actually becomes the active page
        // use ionViewDidEnter to run code when the page actually becomes the active page
        if (this.service.isSignalrConnected() === false) {
            this.service.startConnection();
        }

        this.isBusy = false;
        //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        this.startListeners();
    }



    // fires each time user leaves page, but before the user actually leaves the page
    // use ionViewDidLeave() to run code after the page unloads
    ionViewWillLeave() {
        //this.screenOrientation.unlock();
        //TODO: when the page goes out of focus we need to clean up certain phone elements

        //window.clearTimeout(this.sendInviteTimerRef);

        this.onVideoHidden && this.onVideoHidden.unsubscribe();

        this.onAppPause && this.onAppPause.unsubscribe();
        this.onAppResume && this.onAppResume.unsubscribe();

        this.hangUp()
            .then(() => {
                // release the camera
                //return this.service.unsetLocalMediaStream();
                if (this.service.isEmpty(this.service.localMediaStream) === false) {
                    let tracks: MediaStreamTrack[] = this.service.localMediaStream.getTracks();
                    console.log("tracks: ", tracks);
                    tracks.forEach((t) => {
                        t.stop();
                    });
                }
                this.service.localMediaStream = null;
            })
            .then(() => {
                this.endListeners();
                if (this.service.isIos()) {
                    this.localVideoElement.nativeElement.src = null;
                }
                else {
                    this.localVideoElement.nativeElement.srcObject = null;
                }

                console.log("phone.ts -> ionViewWillLeave() hangUp()")
            })
            .catch((error) => {
                console.log("phone.ts -> ionViewWillLeave() hangUp() error:", error)
            })
    }

    formGroup: FormGroup
    createForm() {
        this.formGroup = this.fb.group({
            subject: new FormControl('', [
                Validators.maxLength(300)

            ]),
            message: new FormControl('', [
                Validators.maxLength(1000)

            ]),
            name: new FormControl('', [
                Validators.maxLength(100)

            ])
        })
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

    async startApp(pbxlineId: number): Promise<void> {
        try {
            let accessToken: string;
            try {
                this.statusMessage = "Requesting Access";
                accessToken = await this.service.getAccessToken();
                this.statusMessage = "Access Granted";
            }
            catch (e) {
                throw ("Unable to get access at this time. Please try again later.")
            }
            try {
                this.statusMessage = "Retrieving Line Information";
                this.pbxline = await this.service.getPbxLineById(pbxlineId, accessToken);
            }
            catch (e) {
                throw ("Unable to request Pbx Line information");
            }

            try {
                this.statusMessage = "Retrieving Company Information";
                this.companyProfile = await this.service.getCompanyProfileById(this.pbxline.companyProfileId, accessToken);
            }
            catch (e) {
                throw ("Unable to request company information");
            }

            //console.log("isLoggedIn:", this.service.isLoggedIn);

            // check if user is logged in if not do instantGuestLogin

            let isLoggedIn: boolean = await this.service.getIsLoggedIn();

            if (this.service.isEmpty(isLoggedIn)) {
                // do instant guestLogin
                try {
                    this.statusMessage = "Creating identity for guest user.";
                    await this.service.instantGuestLogin();
                    this.statusMessage = "Identity created for guest user.";
                }
                catch (e) {
                    throw (e);
                }
            }

            try {
                await this.startInterface();
            }
            catch (e) {
                throw (e);
            }

            let isMember = await this.service.isMember();

            //console.log("isMember: ", isMember);

            if (this.service.isEmpty(this.customerProfile)) {
                this.customerProfile = new PbxCustomerType();
            }

            let name: string;
            let guestProfile = await this.service.getGuestProfile();
            let profile: MemberType = await this.service.getProfile();

            if (this.service.isEmpty(isMember)) {
                name = guestProfile.name;
            }
            else {
                name = profile.firstName + " " + profile.lastName;
            }

            let pbxCallQueue: PbxCallQueueDto;
            try {
                this.statusMessage = "Assigning a representative.";
                pbxCallQueue = await this.service.PbxCustomerCheckIn(pbxlineId, name);
                //console.log("pbxCallQueue:", pbxCallQueue);
            }
            catch (e) {
                console.log("e: ", e);
                throw ("Unable to place user into line queue.")
            }

            if (this.service.isEmpty(pbxCallQueue)) {
                throw ("Unable to put user into line queue.");
            }

            await this.setPbxCallQueue(pbxCallQueue, accessToken);

            this.customerProfile.id = pbxCallQueue.connectionGuid;
            this.customerProfile.name = name;
            this.customerProfile.email = this.service.isEmpty(isMember) === false ? profile.email : guestProfile.email;
            if (isMember) {
                this.customerProfile.imgSrc = this.service.isEmpty(profile.avatarFileName) ? this.service.defaultAvatar
                    : this.service.avatarBaseUrl + profile.avatarFileName + "?" + Date.now().toString();
            }
            else {
                this.customerProfile.imgSrc = this.service.defaultAvatar;
            }

            //console.log("pbxCallQueue: ", pbxCallQueue);

            if (this.service.isEmpty(pbxCallQueue.pbxLineRepId)) {
                // no pbx rep online to assign this to this pbxCallQueue
                try {
                    this.statusMessage = "Getting representative";
                    await this.service.pagePbxlineReps(pbxCallQueue.pbxCallQueueId, accessToken);
                    //this.statusMessage = "Page sent. Please wait, it could take several minutes for a representative to respond.";
                    // TODO: OPEN dialog with count down, if before 120 seconds a rep responds by clicking the link in their email or text message
                    // with the pbxCalLQueueId, then the rep is assigned to this user and signalr is sent to this user
                    // the user's listener will close the dialog box and rep will istantly connect to user
                    this.pagingTimer = window.setTimeout(() => {
                        this.statusMessage = "";

                        let alert = new MaterialAlertMessageType();
                        alert.title = "Offline";
                        alert.message = "Sorry, representatives are not available at this time.";
                        this.service.openAlert(alert);

                        //let alert = this.alertCtrl.create({
                        //  title: "Offline",
                        //  message: "Sorry, representatives are not available at this time.",
                        //  buttons: ["OK"]
                        //});
                        //alert.present();
                    }, 5000);
                }
                catch (e) {
                    //console.log("e: ", e);
                    //this.statusMessage = "";
                    //let alert = this.alertCtrl.create({
                    //  title: "Error",
                    //  message: "Unable to request a representative. Sorry, unable to get help at this time. Please try again later.",
                    //  buttons: ["OK"]
                    //});
                    //alert.present();

                    let alert = new MaterialAlertMessageType();
                    alert.title = "Error";
                    alert.message = "Unable to request a representative. Sorry, unable to get help at this time. Please try again later.";
                    this.service.openAlert(alert);
                }
            }
            else {
                this.statusMessage = "";
            }
        }
        catch (e) {
            this.statusMessage = "Error";
            //let alert = this.alertCtrl.create({
            //  title: "Error",
            //  message: e,
            //  buttons: ["OK"]
            //});
            //alert.present();

            let alert = new MaterialAlertMessageType();
            alert.title = "Error";
            alert.message = e.toString();
            this.service.openAlert(alert);

            await this.endConnection();
        }
    }

    async startInterface(): Promise<void> {
        //console.log("TODO: start the customer phone interface")
        try {
            let profile = await this.service.getProfile();
            let guestProfile = await this.service.getGuestProfile();
            let name: string = "";
            if (this.service.isEmpty(profile) === false) {
                let genericUser = new GenericUserType();
                genericUser.id = this.localGuid;
                genericUser.email = profile.email;
                genericUser.name = profile.firstName + " " + profile.lastName;
                name = genericUser.name;
                genericUser.imgSrc = this.service.isEmpty(profile.avatarFileName) ? this.service.defaultAvatar
                    : this.service.avatarBaseUrl + profile.avatarFileName;
                this.users.push(genericUser);
            }
            else if (this.service.isEmpty(guestProfile) === false) {
                let genericUser = new GenericUserType();
                genericUser.id = this.localGuid;
                genericUser.email = guestProfile.email;
                genericUser.name = guestProfile.name
                name = genericUser.name;
                genericUser.imgSrc = this.service.isEmpty(guestProfile.avatarDataUri) ? this.service.defaultAvatar
                    : guestProfile.avatarDataUri;
                this.users.push(genericUser);
            }

            try {
                this.statusMessage = "Check if phone service is available.";
                await this.service.initPhoneService(name);
                this.statusMessage = "Phone service is available.";
            }
            catch (e) {
                throw (e);
            }

            // set the phonecallcomponent factory
            this.phoneCallComponentFactory = this.componentFactoryResolver.resolveComponentFactory(PhoneCallComponent);
            // phoneCallComponentInsert should be empty when we first start the phone, (not wake from cached view)
            this.phoneCallComponentInsert.clear();
            // the phoneCallComponentRefs should be an empty array
            this.phoneCallComponentRefs = new Array<ComponentRef<PhoneCallComponent>>();

            this.isBusy = false;


            /*
            //NOTE: for now always resolves true;
            let hasCameraPermissions: boolean = false;

            try {
                this.statusMessage = "Checking camera permission.";
                hasCameraPermissions = await this.service.checkCameraPermissions();
                this.statusMessage = "Camera permission granted.";
            }
            catch (e) {
                throw ("Unable to check camera permissions.");
            }

            if (hasCameraPermissions === false) {
                throw ("Permission to use the camera not granted.");
            }

            let hasMicPermissions: boolean = false;
            try {
                this.statusMessage = "Checking microphone permission.";
                hasMicPermissions = await this.service.checkMicrophonePermissions();
                this.statusMessage = "Microphone permission granted.";
            }
            catch (e) {
                throw ("Unable to check microphone permissions.");
            }

            if (hasMicPermissions === false) {
                throw ("Permission to use the microphone not granted.");
            }
            */

            try {
                this.statusMessage = "Initializing video.";
                await this.startLocalVideo();
            }
            catch (e) {
                throw (e);
            }
           
        }
        catch (e) {
            throw (e)
        }
        return;
    }

    // broadcast hangUpNotice and endCall();
    async endConnection(): Promise<void> {
        //console.log("endConnection called this.service.phoneLine: ", this.service.phoneLine);
        if (this.service.isEmpty(this.service.phoneLine) === false) {
            try {
                //console.log("broadcasting hangup notice to phoneline:", this.service.phoneLine);
                await this.service.sendHangUpNotice(this.service.phoneLine.phoneLineGuid);
            }
            catch (e) {
                throw (e)
            }
        }
        await this.endCall();

        return;
    }

    async endCall(): Promise<void> {
        //console.log("ending call");
        this.service.localPhoneLineConnection = null;
        this.service.phoneLine = null;
        this.deleteAllPhoneCallComponents();
        this.service.localMediaStream = null;
        this.localVideoElement.nativeElement.srcObject = null;
        if (this.service.isEmpty(this.pbxCallQueue) === false) {
            try {
                //console.log("performing pbxCustomerCheckout this.pbxCallQueue: ", this.pbxCallQueue);
                await this.service.PbxCustomerCheckOut(this.pbxCallQueue.pbxCallQueueId);
            }
            catch (e) {
                console.log("customer-pbx.page endConnection error: ", e);
            }
        }

        //console.log("ending subscriptions");
        this.endListeners();

        if (this.service.isEmpty(this.pagingTimer) === false) {
            window.clearTimeout(this.pagingTimer);
        }
        this.isBusy = await this.service.isPhoneBusy();
        // TODO: modify the interface to show the user that they are nolong in the queue, maybe a summary of
        // their interaction with the rep
        this.callEnded = true;
        // this.navCtrl.setRoot(AppShellPage);
        this.router.navigate(['home']);
    }

    clearRep(): void {
        this.pbxLineRep = null;
        this.companyEmployee = null;
        this.pbxlineRepStatus = null;
        this.totalWaitTime = "Waiting";
        this.customersAhead = 0;
    }

    async startLocalVideo(): Promise<void> {
        try {
            await this.stopLocalVideo();

            let stream: MediaStream = await this.service.getLocalMediaStream();

            this.service.localMediaStream = stream;

            this.localVideoElement.nativeElement.setAttribute('style', 'z-index:300');

            await this.service.attachMediaStream(this.localVideoElement.nativeElement, this.service.localMediaStream);

            await this.service.attachMediaStream(this.mainVideoElement.nativeElement, this.service.localMediaStream, this.localGuid);
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    async stopLocalVideo(): Promise<void> {
        if (this.service.isEmpty(this.service.localMediaStream) === false) {
            this.service.stopMediaStream(this.service.localMediaStream);
        }
        this.service.localMediaStream = null;

        this.mainVideoElement.nativeElement.srcObject = null;
        this.localVideoElement.nativeElement.srcObject = null;
        return;
    }

    /*
    initLocalVideo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.service.isEmpty(this.service.localMediaStream) === false) {
                let tracks: MediaStreamTrack[] = this.service.localMediaStream.getTracks();
                console.log("tracks: ", tracks);
                tracks.forEach((t) => {
                    t.stop();
                });
            }
            this.service.localMediaStream = null;

            if (this.service.isIos()) {
                this.localVideoElement.nativeElement.src = null;
            }
            else {
                this.localVideoElement.nativeElement.srcObject = null;
            }

            this.service.getLocalMediaStream()
                .then((stream: MediaStream) => {
                    //console.log("got localMediaStream: ", stream);
                    return this.service.localMediaStream = stream;
                })
                .then(() => {
                    // attach localvideo to mainvideoElement by default, user can then switch
                    //console.log("attaching localMediaStream");
                    return this.service.attachMediaStream(this.mainVideoElement.nativeElement, this.service.localMediaStream, this.localGuid);
                })
                .then(() => {
                    //attach localvideo to localvideoElement
                    //console.log("attaching localMediaStream");
                    //return this.videoHelperService.attachMediaStream(this.localVideoElement.nativeElement, this.service.localMediaStream);
                    this.localVideoElement.nativeElement.setAttribute("style", "z-index:300");
                    return this.service.attachMediaStream(this.localVideoElement.nativeElement, this.service.localMediaStream);
                })
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    //throw ("ionViewDidLoad: error with getting local MediaStream: " + this.jsHelperService.stringify(error));
                    reject(error);
                });
        })
    }
    */

    async displayIncomingCall(call: CallType): Promise<void> {
        var audio = new Audio();
        audio.src = "assets/ringtone.mp3";
        audio.load();
        audio.play();
        // NOTE: you can display the datauri or the filename from call.profile
        // to display file <img src=""> src is configService.avatarBaseUrl + call.profile.filename

        // NOTE: you should modify this gui so it displays the caller and let the user also view who else is in the call
        // the call object will contain the caller information, plus an array of CallerType
        console.log("phone.ts -> displayIncomingCall() -> displaying incoming calls", call);
        this.hasIncoming = true;
        this.incomingCallModal = await this.modalCtrl.create({
          component: IncomingCallModalComponent, 
          componentProps: { call: call }});
          let {data} = await this.incomingCallModal.onDidDismiss();
          if (this.service.isIos()) { this.showAllVideos(); }
          if (data.data === IncomingCallResponseEnum.accept) {
              this.hasIncoming = false;
              this.service.acceptPhoneLineInvitation(call.phoneLineGuid, call.remoteGuid);
          }
          else if (data.data === IncomingCallResponseEnum.deny) {
              this.hasIncoming = false;
              this.service.sendNotAcceptCall(call.remoteGuid);
          }
          else if (data.data === IncomingCallResponseEnum.block) {
              this.hasIncoming = false;
              this.service.sendNotAcceptCall(call.remoteGuid);
              //let jwtToken = this.signalrService.jwtToken;
              this.service.getAccessToken()
                  .then((accessToken: string) => {
                      this.service.blockEmail(call.profile.email, accessToken);
                  })
          }
          else {
              this.hasIncoming = false;
              this.service.sendNotAcceptCall(call.remoteGuid);
          }

          audio.pause();
          audio.currentTime = 0;
        if (this.service.isIos()) { this.hideAllVideos(); }
        await this.incomingCallModal.present();
        setTimeout(() => {
            this.hasIncoming = false;

            this.incomingCallModal.dismiss();
        }, 30000)//has 30 seconds to respond
    }

    // Subscribe to phone.service webRtcHub Listeners
    // NOTE: this should start once when phone page is loaded with setRoot, use ionViewDidLoad() fires once
    startListeners(): void {
        this.endListeners();

        //console.log("phone.ts listeners started");

        this.receivePhoneLineInvitation = this.service.receivePhoneLineInvitation.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("phone.ts receivePhoneLineInvitation:", message);
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let call: CallType = this.service.jsonToObject<CallType>(json, true);

                    if (this.service.isEmpty(call) === false) {
                        if (this.hasIncoming === false) {
                            this.service.isMember()
                                .then((isMember: boolean) => {
                                    return this.service.initCall(isMember, call);
                                })
                                .then((allowCall: boolean) => {
                                    console.log("allowCall: ", allowCall);
                                    if (this.service.isEmpty(allowCall) === false) {
                                        this.displayIncomingCall(call);
                                    }
                                    else {
                                        this.hasIncoming = false;
                                        this.service.sendNotAcceptCall(call.remoteGuid);
                                    }
                                })
                                .catch((remoteGuid: string) => {
                                    console.log("received call from " + remoteGuid + " but rejected it");
                                });
                        }
                        else {
                            this.service.sendBusyResponse(call.remoteGuid);
                        }
                    }
                    else {
                        // received a call that is missing an email, we can not identify the caller, so ignore this call, and let it timeout
                        // on the other end
                        console.log("received call with missing json: ", json);
                    }
                }
            });

        this.receiveReadyForCall = this.service.receiveReadyForCall.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("phone.ts receiveReadyForCall : ", message);

                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false) {
                    if (this.service.isEmpty(this.service.currentCallAttempt) === false) {
                        this.service.currentCallAttempt.responses++;
                    }

                    let phoneLineConnection: PhoneLineConnectionType = this.service.getPhoneLineConnectionFromCacheByRemoteGuid(remoteGuid);

                    if (this.service.isEmpty(phoneLineConnection) === false) {
                        let phoneCallComponent: PhoneCallComponent;
                        // wait a split second to make sure the localVideoStream is ready

                        this.addPhoneCallComponentToDom(phoneLineConnection)
                            .then((componentRef: ComponentRef<PhoneCallComponent>) => {
                                // NOTE: addPhoneCallComponentToDom only adds to dom if the phoneLineConnection doesn't already exist this.phoneCallComponentRefs
                                if (this.service.isEmpty(componentRef) === false) {
                                    phoneCallComponent = componentRef.instance;
                                }
                                else {
                                    // else we look for an existing dom element
                                    phoneCallComponent = this.getPhoneCallComponentInstance(phoneLineConnection.hubConnection.connectionGuid);
                                }
                                return;
                            })
                            .then(() => {
                                return this.service.createRtcPeerConnection()
                            })
                            .then((pc: RTCPeerConnection) => {
                                phoneCallComponent.pc = pc;
                                return phoneCallComponent.startPeerConnectionListeners();
                            })
                            .then(() => {
                                // make sure we have the localMediaStream before continuing

                                let promise = new Promise<MediaStream>((resolve, reject) => {
                                    if (this.service.isEmpty(this.service.localMediaStream)) {
                                        let maxIntervals = 30;
                                        let currentInterval = 0;
                                        let intervalId = setInterval(() => {
                                            if (this.service.isEmpty(this.service.localMediaStream) === false) {
                                                clearInterval(intervalId);
                                                resolve(this.service.localMediaStream);
                                            }
                                            else {
                                                currentInterval++;
                                                if (currentInterval >= maxIntervals) {
                                                    clearInterval(intervalId);
                                                    reject("unable to determine if localMediaStream is available for timed out after 9 seconds.");
                                                }
                                            }
                                        }, 300);
                                    }
                                    else {
                                        resolve(this.service.localMediaStream);
                                    }
                                });
                                return promise;
                            })
                            .then((localMediaStream: MediaStream) => {
                                return phoneCallComponent.addLocalStream(this.service.localMediaStream);
                            })
                            .then(() => {
                                return phoneCallComponent.startP2pConnection();
                            })
                            .then(() => {
                                console.log("phone.ts -> receiveReadyForCall -> starting peer to peer connection with: ", phoneLineConnection);
                                return this.service.isPhoneBusy();
                            })
                            .then((isBusy: boolean) => {
                                this.isBusy = isBusy;
                            })
                            .catch((error) => {
                                console.log("phone.ts -> receiveReadyForCall -> error: ", error);
                            })
                    }
                    else {
                        console.log("phonereceived bad remoteGuid, phoneLineConnection: ", remoteGuid, phoneLineConnection);
                    }
                }
            });

        this.receiveNotReadyForCall = this.service.receiveNotReadyForCall.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("phone.ts -> receivedNotRadyForCall: ", message);
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let notReadyForCall: NotReadyForCallType = this.service.jsonToObject<NotReadyForCallType>(json);
                    if (this.service.isEmpty(this.service.currentCallAttempt) === false) {
                        this.service.currentCallAttempt.responses++;

                        this.service.currentCallAttempt.notReadyForCalls.push(notReadyForCall);
                    }
                }
            });

        this.receiveSDP = this.service.receiveSDP.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                //console.log("receivedSDP: ", message);
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let sdpMessage: SdpMessageType = this.service.jsonToObject<SdpMessageType>(json, true);
                    if (this.service.isEmpty(sdpMessage.sender) === false) {
                        //we need to foward this SdpMessageType to the proper PhoneCallComponent
                        //so that it can set pc.setRemoteDescription and send sendLocalSdp answer
                        for (let i = 0; i < this.phoneCallComponentRefs.length; i++) {
                            if (this.phoneCallComponentRefs[i].instance.caller.remoteGuid === sdpMessage.sender) {
                                let sdp: RTCSessionDescription = this.service.jsonToObject<RTCSessionDescription>(sdpMessage.sdp);
                                if (this.service.isEmpty(sdp) === false) {
                                    let instance = this.phoneCallComponentRefs[i].instance;
                                    if (sdp.type === "offer") {
                                        // make sure we have local stream before adding it.
                                        if (this.service.isEmpty(this.service.localMediaStream)) {
                                            let maxIntervals = 30;
                                            let currentInterval = 0;
                                            let intervalId = setInterval(() => {
                                                if (this.service.isEmpty(this.service.localMediaStream) === false) {
                                                    clearInterval(intervalId);
                                                    instance.addLocalStream(this.service.localMediaStream)
                                                        .then(() => {
                                                            return instance.receiveSDP(sdp);
                                                        })
                                                        .then(() => {
                                                            console.log("receiveSDP forward sdp to phonecallcomponent: ", sdpMessage.sender);
                                                        })
                                                        .catch((error) => {
                                                            console.log("receiveSDP forward sdp to phonecallcomponent error: ", error);
                                                        });
                                                }
                                                else {
                                                    currentInterval++;
                                                    if (currentInterval >= maxIntervals) {
                                                        clearInterval(intervalId);
                                                        console.log("unable to determine if localMediaStream is available for timed out after 9 seconds.");
                                                    }
                                                }
                                            }, 300);
                                        }
                                        else {
                                            instance.addLocalStream(this.service.localMediaStream)
                                                .then(() => {
                                                    return instance.receiveSDP(sdp);
                                                })
                                                .then(() => {
                                                    console.log("receiveSDP forward sdp to phonecallcomponent: ", sdpMessage.sender);
                                                })
                                                .catch((error) => {
                                                    console.log("receiveSDP forward sdp to phonecallcomponent error: ", error);
                                                });
                                        }
                                    }
                                    else {
                                        instance.receiveSDP(sdp)
                                            .then(() => {
                                                console.log("receiveSDP forward sdp to phonecallcomponent: ", sdpMessage.sender);
                                            })
                                            .catch((error) => {
                                                console.log("receiveSDP forward sdp to phonecallcomponent error: ", error);
                                            });
                                    }
                                }
                                break;
                            }
                        }
                    }
                    else {
                        //TODO: received SdpMessageType without sender string (remoteGuid), handle this error type
                        console.log("received SdpMessageType without sender string");
                    }
                }
            });

        this.receiveICE = this.service.receiveICE.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                //console.log("receivedICE: ", message);
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let iceMessage: IceMessageType = this.service.jsonToObject<IceMessageType>(json, true);
                    if (this.service.isEmpty(iceMessage.sender) === false) {
                        //we need to foward this IceMessageType to the proper PhoneCallComponent
                        //so that it can set pc.addIceCandidate
                        for (let i = 0; i < this.phoneCallComponentRefs.length; i++) {
                            if (this.phoneCallComponentRefs[i].instance.caller.remoteGuid === iceMessage.sender) {
                                let ice: RTCIceCandidate = this.service.jsonToObject<RTCIceCandidate>(iceMessage.ice, true);
                                if (this.service.isEmpty(ice) === false) {
                                    this.phoneCallComponentRefs[i].instance.receiveICE(ice)
                                        .then(() => {
                                            console.log("receiveICE -> fowarded ice to phonecallcomponent: ", iceMessage.sender);
                                        })
                                        .catch((error) => {
                                            console.log("receiveICE -> fowarded ice to phonecallcomponent error: ", error);
                                        });
                                }
                                break;
                            }
                        }
                    }
                    else {
                        // TODO: received IceMessageType without sender string (remoteGuid), handle this error type
                        console.log("received IceMessageType without sender string (remoteGuid)");
                    }
                }
            });

        this.receiveGroupSmsMessage = this.service.receiveGroupSmsMessage.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("receiveGroupSmsMessage: ", message);
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let smsMessage: SmsMessageType = this.service.jsonToObject<SmsMessageType>(json, true);
                    if (this.service.isEmpty(smsMessage.remoteGuid) === false) {
                        let smsMessage: SmsMessageType = this.service.jsonToObject<SmsMessageType>(json, true);
                        if (this.service.isEmpty(smsMessage) === false
                            && this.service.isEmpty(smsMessage.remoteGuid) === false
                            && this.service.isEmpty(smsMessage.sender) === false

                        ) {
                            let remoteGuid = smsMessage.remoteGuid;
                            //let email = smsMessage.sender;
                            let user: GenericUserType = this.users.find((user: GenericUserType) => {
                                return user.id === remoteGuid;
                            });

                            //console.log("users:", this.users);
                            //console.log("user: ", user);
                            if (this.service.isEmpty(user) === false) {
                                //console.log("smsMessage.remoteGuid: ", smsMessage.remoteGuid);
                                //console.log("this.service.localGuid", this.service.localGuid);

                                // existing user, generate message from existing user

                                let newMessage = new TextMessageType();
                                newMessage.id = remoteGuid;
                                newMessage.email = user.email;
                                newMessage.name = user.name;
                                newMessage.imgSrc = user.imgSrc;
                                newMessage.isPrivate = false;
                                // NOTE: false means this group message received is the message the user sent out to everyone, including themself
                                newMessage.isIncoming = (smsMessage.remoteGuid === this.localGuid) ? false : true;
                                newMessage.message = smsMessage.message;
                                //console.log("incoming newMessage: ", newMessage);
                                this.ngZone.run(() => {
                                    this.textMessages.unshift(newMessage);
                                    this.currentMessage = newMessage;
                                })
                            }
                        }

                        //// NOTE: phoneLineConnection contains the senders information
                        //let phoneLineConnection: PhoneLineConnectionType = this.service.getPhoneLineConnectionFromCacheByRemoteGuid(smsMessage.remoteGuid);
                        ////TODO: display the message and sender information in the GUI
                        //smsMessage.isPrivate = false;
                        //smsMessage.displayName = phoneLineConnection.hubConnection.name;
                        //this.smsMessages.push(smsMessage)
                        //this.scrollToBottom();
                    }
                    else {
                        // TODO: received SmsMessageType without sender string (remoteGuid), handle this error type
                        console.log("received smsMessage without remoteGuid string (remoteGuid)");
                    }
                }
            });

        this.receivePrivateSmsMessage = this.service.receivePrivateSmsMessage.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("receivePrivateSmsMessage: ", message);
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let smsMessage: SmsMessageType = this.service.jsonToObject<SmsMessageType>(json, true);
                    if (this.service.isEmpty(smsMessage) === false
                        && this.service.isEmpty(smsMessage.remoteGuid) === false
                        && this.service.isEmpty(smsMessage.sender) === false
                    ) {
                        let remoteGuid = smsMessage.remoteGuid;
                        //let email = smsMessage.sender;
                        let user: GenericUserType = this.users.find((user: GenericUserType) => {
                            return user.id === remoteGuid;
                        });

                        if (this.service.isEmpty(user) === false) {
                            // existing user, generate message from existing user
                            let newMessage = new TextMessageType();
                            newMessage.id = remoteGuid;
                            newMessage.email = user.email;
                            newMessage.name = user.name;
                            newMessage.imgSrc = user.imgSrc;
                            newMessage.isPrivate = true;
                            // NOTE: false means this group message received is the message the user sent out to everyone, including themself
                            newMessage.isIncoming = (smsMessage.remoteGuid === this.localGuid) ? false : true;
                            newMessage.message = smsMessage.message;
                            //console.log("incoming newMessage: ", newMessage);
                            this.ngZone.run(() => {
                                this.textMessages.unshift(newMessage);
                                this.currentMessage = newMessage;
                            })
                        }
                    }
                    else {
                        // TODO: received IceMessageType without sender string (remoteGuid), handle this error type
                        console.log("received smsMessage without remoteGuid string (remoteGuid)");
                    }

                    //console.log("receiveGroupSmsMessage: ", json);
                    //let smsMessage: SmsMessageType = this.service.jsonToObject<SmsMessageType>(json, true);
                    //if (!this.service.isEmpty(smsMessage.remoteGuid)) {
                    //	// NOTE: phoneLineConnection contains the senders information
                    //	let phoneLineConnection: PhoneLineConnectionType = this.phoneService.getPhoneLineConnectionFromCacheByRemoteGuid(smsMessage.remoteGuid);
                    //	//TODO: display the message and sender information in the GUI
                    //	smsMessage.isPrivate = true;
                    //	smsMessage.displayName = phoneLineConnection.hubConnection.name;
                    //	smsMessage.isSender = false;
                    //	this.smsMessages.push(smsMessage)
                    //	this.scrollToBottom();
                    //}
                    //else {
                    //	// TODO: received IceMessageType without sender string (remoteGuid), handle this error type
                    //	console.log("received smsMessage without remoteGuid string (remoteGuid)");
                    //}
                }
            });

        this.receiveNotAcceptCall = this.service.receiveNotAcceptCall.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("phone.ts -> receivedNotAcceptCall remoteGuid:", message);
                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false) {
                    // TODO: the other user did not accept this users call. handle this event.
                    //displayErrorToUser("The user did not accept your call. Please try your call later.")

                    //this.currentAlert && this.currentAlert.dismiss();
                    this.phonelineInvitationModal && this.phonelineInvitationModal.dismiss();
                    // TODO: the call should only last about 30-45 seconds. if it last longer, we need to timeout and stop trying the call.
                    // TODO: display calling GUI elements, example: "please wait calling email"

                    this.alertCtrl.create({
                        header: 'Call Not Accepted',
                        message: 'The other user did not accept your call.',
                        buttons: ['OK']
                    }).then((altRes)=>{
                      altRes.present();
                    });
                }
            });

        this.receivePutOnHold = this.service.receivePutOnHold.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("receivedPutOnHold: ", message);
                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false) {
                    // when the remote users puts this user on hold, the remote user will hide this localUsers phoneCallComponent.
                    // and request this localUser to hide the remoteUsers phoneCallComponent
                    // TODO: retrieve the phoneCallComponentRef
                    let phoneCallComponent = this.getPhoneCallComponentInstance(remoteGuid);
                    if (this.service.isEmpty(phoneCallComponent) === false) {
                        //phoneCallComponent.isActive = false; // hide the video and the put on hold button
                        phoneCallComponent.hideVideo(true);
                        phoneCallComponent.isOnHold = false; // hide the remove hold button

                        let mainVideo: HTMLVideoElement = this.mainVideoElement.nativeElement;
                        if (this.service.isEmpty(mainVideo) === false) {
                            let id = mainVideo.getAttribute("data-id");
                            // if the current main video is the remote users video, set it to the local users video
                            if (id === remoteGuid) {
                                this.service.attachMediaStream(mainVideo, this.service.localMediaStream, this.localGuid);
                            }
                        }
                    }
                }
            });

        this.receiveRemoveOnHold = this.service.receiveRemoveOnHold.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("receiveRemoveOnHold: ", message);
                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false) {
                    // when the remote users puts this user on hold, the remote user will hide this localUsers phoneCallComponent.
                    // and request this localUser to hide the remoteUsers phoneCallComponent
                    // TODO: retrieve the phoneCallComponentRef
                    let phoneCallComponent = this.getPhoneCallComponentInstance(remoteGuid);
                    if (this.service.isEmpty(phoneCallComponent) === false) {
                        //phoneCallComponent.isActive = true; // show the video and the put on hold button
                        phoneCallComponent.hideVideo(false);
                        phoneCallComponent.isOnHold = false; // the remove hold button remains hidden
                    }
                }
            });

        this.receiveRemoteLogout = this.service.receiveRemoteLogout.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("receiveRemoteLogout: ", message);
                let connectionId = message.message;
                if (this.service.isEmpty(connectionId) === false) {
                    // NOTE: check the connectionId from the signalr server with the current users signalr connetionId to make sure they
                    // match before, logging the app out.
                    // NOTE: This is a system message
                    if (this.service.isEmpty(connectionId) === false && connectionId === this.service.webRtcHub.connection.id) {
                        // TODO: do your app logout routine here.
                        this.service.doLogout()
                            .catch((error) => {
                                console.log("app-shell.ts logOut error:", error);
                            })
                            .then(() => {
                                this.ngZone.run(() => {
                                    //   this.navCtrl.pop()
                                    //     .catch((error) => {
                                    //       console.log("phone.ts receiveRemoteLogout pop error: ", error);
                                    //     });
                                    // this.navCtrl.setRoot(LoginPage);
                                    this.router.navigate(['login']);
                                })
                            })
                    }
                }
            });

        this.receiveHangUpNotice = this.service.receiveHangUpNotice.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe(async (message: ObservableMessageType) => {
                console.log("receiveHangUpNotice: ", message);

                //NOTE: this method is the sames as this.onEndPhoneCallComponent they both just do cleanup work.
                // if one finishes before the other, they the second option just resolves, this.onEndPhoneCallComponent is a backup to this method

                //if (message.timestamp > this.signalrService.receiveHangUpNoticeCurrent.timestamp && this.jsHelperService.isEmpty(message.message) === false) {
                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false && remoteGuid !== this.localGuid) {
                    //this.signalrService.receiveHangUpNoticeCurrent = message;
                    console.log("receiveHangUpNotice: ", remoteGuid);
                    this.service.removePhoneLineConnectionFromPhoneLineUsingRemoteGuid(remoteGuid);

                    this.removePhoneCallComponent(remoteGuid);

                    this.isBusy = await this.service.isPhoneBusy();

                    if (this.isBusy === false) {
                        await this.hangUp();
                        return;
                    }
                    else {
                        return;
                    }
                }
                //}
            });

        this.receiveCancelInvitation = this.service.receiveCancelInvitation.asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("phone.ts receivePhoneLineInvitation message: ", message);
                //console.trace();
                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false) {
                    //this.signalrService.receiveCancelInvitationCurrent = message;
                    console.log("phone.ts -> receivedNotAcceptCall remoteGuid:", remoteGuid);
                    // TODO: the other user cancelled the call. handle this event.

                    this.incomingCallModal && this.incomingCallModal.dismiss();
                    this.alertCtrl.create({
                        header: 'Call Ended',
                        message: 'The other user has cancelled the call.',
                        buttons: ['OK']
                    }).then((altRes)=>{
                      altRes.present();
                      if (this.service.isIos()) { this.hideAllVideos(); }
                      altRes.onDidDismiss().then(()=>{
                        if (this.service.isIos()) { this.showAllVideos(); }
                      })
                    });
                }
            });

        this.receivePingResponse = this.service.receivePingResponse
            .asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe(async (message: ObservableMessageType) => {
                console.log("receivePingResponse message: ", message);

                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false && this.service.isEmpty(this.pbxlineRepStatus) === false) {
                    if (this.pbxlineRepStatus.connectionGuid.toLowerCase() === remoteGuid.toLowerCase()) {
                        this.ngZone.run(async () => {
                            let accessToken = await this.service.getAccessToken();
                            if (this.service.isEmpty(accessToken) === false) {
                                this.pbxLineRep = await this.service.getPbxLineRepById(this.pbxlineRepStatus.pbxLineRepId, accessToken);
                                //console.log("this.pbxLineRep: ", this.pbxLineRep);
                                if (this.service.isEmpty(this.pbxLineRep) === false) {
                                    //this.companyEmployee = await this.service.getCompanyEmployeeById(this.pbxLineRep.companyEmployeeId, accessToken);
                                    this.companyEmployee = this.pbxLineRep.companyEmployee;
                                    //console.log("this.employee: ", this.employee);
                                }
                            }
                        });
                    }
                }

                return;
            });

        this.receivePing = this.service.receivePing
            .asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe(async (message: ObservableMessageType) => {
                console.log("receivePing message: ", message);

                let remoteGuid = message.message;
                if (this.service.isEmpty(remoteGuid) === false) {
                    await this.service.sendPingResponse(remoteGuid);
                }

                return;
            });

        this.receiveNewPbxLineRep = this.service.receiveNewPbxLineRep
            .asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe((message: ObservableMessageType) => {
                console.log("receiveNewPbxLineRep message: ", message);

                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let queue: PbxCallQueueDto = this.service.jsonToObject<PbxCallQueueDto>(json, true);
                    if (this.service.isEmpty(queue) === false) {
                        if (this.service.isEmpty(this.pagingTimer) === false) {
                            window.clearTimeout(this.pagingTimer);
                        }

                        this.ngZone.run(() => {
                            this.service.getAccessToken()
                                .then((accessToken: string) => {
                                    this.setPbxCallQueue(queue, accessToken);
                                })
                                .catch((e) => {
                                    console.log("getAccessToken Error: ", e);
                                })
                        });
                    }
                    else {
                        // nothing to do, invalid queue object
                    }
                }
                else {
                    // nothing to do, received empty package
                }
            });

        this.receivePbxCallQueueOccupants = this.service.receivePbxCallQueueOccupants
            .asObservable()
            .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
            .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
            .subscribe(async (message: ObservableMessageType) => {
                //console.log("receivePbxCallQueueOccupants message: ", message);
                // NOTE: this listener is intended for the customer app to get a list of
                // the current occupants and extract the wait time to display to the customer.
                // currently we are not displaying the wait time
                let json = message.message;
                if (this.service.isEmpty(json) === false) {
                    let queues: Array<PbxCallQueueDto> = this.service.jsonToObject<Array<PbxCallQueueDto>>(json, true);
                    if (this.service.isEmpty(queues) === false) {
                        // loop through the queues and add up the total wait time
                        let waitTime: number = 0;
                        let customersAhead: number = 0;
                        for (let i = 0; i < queues.length; i++) {
                            if (queues[i].pbxCallQueueId === this.pbxCallQueue.pbxCallQueueId) {
                                waitTime += queues[i].timeAllotment;
                                break;
                            }
                            else {
                                waitTime += queues[i].timeAllotment;
                                customersAhead++;
                            }
                        }
                        this.customersAhead = customersAhead;
                        this.totalWaitTime = waitTime.toString();
                        //console.log("customersAhead: ", this.customersAhead);
                        //console.log("totalWaitTime: ", this.totalWaitTime);
                    }
                    else {
                        // nothing to do, no queues
                    }
                }
                else {
                    // nothing to do, received empty package
                }
            });
    }

    endListeners(): void {
        //console.log("phone.ts listeners ended");

        this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();

        this.receiveReadyForCall && this.receiveReadyForCall.unsubscribe();

        this.receiveNotReadyForCall && this.receiveNotReadyForCall.unsubscribe();

        this.receiveSDP && this.receiveSDP.unsubscribe();

        this.receiveICE && this.receiveICE.unsubscribe();

        this.receiveGroupSmsMessage && this.receiveGroupSmsMessage.unsubscribe();

        this.receivePrivateSmsMessage && this.receivePrivateSmsMessage.unsubscribe();

        this.receiveNotAcceptCall && this.receiveNotAcceptCall.unsubscribe();

        this.receivePutOnHold && this.receivePutOnHold.unsubscribe();

        this.receiveRemoveOnHold && this.receiveRemoveOnHold.unsubscribe();

        this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();

        this.receiveHangUpNotice && this.receiveHangUpNotice.unsubscribe();

        this.receiveCancelInvitation && this.receiveCancelInvitation.unsubscribe();

        this.receivePingResponse && this.receivePingResponse.unsubscribe();
        this.receivePing && this.receivePing.unsubscribe();
        this.receiveNewPbxLineRep && this.receiveNewPbxLineRep.unsubscribe();
        this.receivePbxCallQueueOccupants && this.receivePbxCallQueueOccupants.unsubscribe();
    }

    // when another user hangs up, child PhoneCallComponent will call this method
    async onEndPhoneCallComponent(call: CallType): Promise<void> {
        //NOTE: this method is in backup to this.receiveHangUpNotice. they both just do the same cleanup work.
        // if one finishes before the other, they the second option just resolves.
        // called from child PhoneCallComponent
        console.log("phone.ts onEndPhoneCallComponent() call: ", call);
        this.service.removePhoneLineConnectionFromPhoneLineUsingRemoteGuid(call.remoteGuid);
        this.removePhoneCallComponent(call.remoteGuid);
        this.isBusy = await this.service.isPhoneBusy();

        if (this.isBusy === false) {
            await this.hangUp();
            return;
        }
        else {
            return;
        }

        //TODO: do any ui clean up
    };

    // removes a phonecallcomponent from the dom
    removePhoneCallComponent(remoteGuid): void {
        let index: number = this.phoneCallComponentRefs.findIndex((value) => {
            // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
            return value.instance.caller.remoteGuid == remoteGuid;
        })

        if (index >= 0) {
            let componentRef: ComponentRef<PhoneCallComponent> = this.phoneCallComponentRefs[index];
            let instance = componentRef.instance;
            instance.pc.close();
            componentRef.destroy();
            this.phoneCallComponentRefs.splice(index, 1);
        }

        let currentUserIndex = this.users.findIndex((value) => {
            return value.id == remoteGuid;
        })
        if (currentUserIndex >= 0) {
            this.ngZone.run(() => {
                this.users.splice(currentUserIndex, 1);
            })
        }

        console.log("removePhoneCallComponent users: ", this.users);

        return;
    }

    // loops through phoneCallComponentRefs to get the instance in dom
    getPhoneCallComponentInstance(remoteGuid: string): PhoneCallComponent {
        let index: number = this.phoneCallComponentRefs.findIndex((value) => {
            // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
            return value.instance.caller.remoteGuid == remoteGuid;
        })

        if (index > -1) {
            let componentRef: ComponentRef<PhoneCallComponent> = this.phoneCallComponentRefs[index];
            let instance = componentRef.instance;
            return instance;
        }
        else {
            return null;
        }
    }

    // removes all phonecallcomponents from the dom
    deleteAllPhoneCallComponents(): void {
        console.log("phone.ts deleteAllPhoneCallComponents");

        for (let i = 0; i < this.phoneCallComponentRefs.length; i++) {
            let instance = this.phoneCallComponentRefs[i].instance;
            console.log("phone.ts deleteAllPhoneCallComponents instance: ", instance);
            instance.pc.close();
            this.phoneCallComponentRefs[i].destroy();
        }
        this.phoneCallComponentRefs.length = 0;

        console.log("phone.ts -> deleteAllPhoneCallComponents(): ", this.phoneCallComponentRefs);

        return;
    }

    // when the user exits the phone
    exitPhone(): void {
        // this.navCtrl.setRoot(AppShellPage);
        this.router.navigate(['home']);
    }

    // when this user hangs up on all calls
    async hangUp(): Promise<void> {
        try {
            console.log("phone.ts -> hangUp() -> hanging up");

            // NOTE: phoneService.hangUp deletes the phoneline and all its associated phonelineConnections
            await this.service.hangUp();

            this.deleteAllPhoneCallComponents();

            this.isBusy = await this.service.isPhoneBusy();
            return;
        }
        catch (e) {
            throw (e);
        }
    }

    collapseChat() {
        if (this.service.isIos()) { this.showAllVideos(); }
        if (this.isChatExpanded === true) {
            this.isChatExpanded = false;
            //console.log("collapsechat", this.isChatExpanded)
            this.scrollToBottom();
        }
    }

    expandChat() {
        if (this.service.isIos()) { this.hideAllVideos(); }
        if (this.isChatExpanded === false) {
            this.isChatExpanded = true;
            //console.log("expand chat", this.isChatExpanded)
            this.scrollToBottom();
        }
    }

    showContactSearchModal() {
        this.modalCtrl.create({
          component: ContactSearchModalComponent
        }).then((modalRes)=>{
          modalRes.present();
          if (this.service.isIos()) { this.hideAllVideos(); }
          modalRes.onDidDismiss().then((email)=>{
            this.trySendPhoneLineInvitation(String(email));
            if (this.service.isIos()) { this.showAllVideos(); }
          })
        });
    }

    async trySendPhoneLineInvitation(email: string): Promise<void> {
        if (!this.service.isEmpty(email)) {
            this.phonelineInvitationModal = await this.modalCtrl.create({
              component: PhoneLineInvitationModalComponent, 
              componentProps: { email }});
            if (this.phonelineInvitationModal) {
                if (this.service.isIos()) { this.hideAllVideos(); }
                this.phonelineInvitationModal.present();
            }
            let remoteGuid: string;
            try {
                remoteGuid = await this.service.phoneSendPhoneLineInvitation(email);
            }
            catch (e) {
                console.log("service.phoneSendPhoneLineInvitation error: ", e);
            }

            this.sendInviteTimerRef = window.setTimeout(() => {
                this.phonelineInvitationModal && this.phonelineInvitationModal.dismiss(email);
            }, 60000);

            let {data} = await this.phonelineInvitationModal.onDidDismiss();
            if (this.service.isIos()) { this.showAllVideos(); }
            window.clearTimeout(this.sendInviteTimerRef);
            if (this.service.isEmpty(data.email) === false) {
                // if dismissed with email, then cancel the call
                this.service.cancelCall(data.email)
                    .then((result) => {
                        console.log("call cancelled:", result);
                    })
                    .catch((e) => {
                        console.log("phone.ts trySendPhoneLineInvitation cancelCall error: ", e);
                    })
            }

            console.log("trySendPhoneLineInvitation remoteGuid: ", remoteGuid);

            //this.phoneService.sendPhoneLineInvitation(email)
            //	.then(() => {
            //		this.phonelineInvitationModal = this.modalCtrl.create(PhoneLineInvitationModalComponent, { email });

            //		this.phonelineInvitationModal && this.phonelineInvitationModal.present();

            //		return;
            //	})
            //	.catch((error) => {
            //		this.phonelineInvitationModal && this.phonelineInvitationModal.dismiss();
            //		// TODO: the call should only last about 30-45 seconds. if it last longer, we need to timeout and stop trying the call.
            //		// TODO: display calling GUI elements, example: "please wait calling email"
            //	});
        }
        else {
            return;
        }
    }

    addPhoneCallComponentToDom(phoneLineConnection: PhoneLineConnectionType): Promise<ComponentRef<PhoneCallComponent>> {
        return new Promise<ComponentRef<PhoneCallComponent>>((resolve) => {
            let index: number = this.phoneCallComponentRefs.findIndex((value) => {
                // NOTE: must use == equality instead of === for this to work, === will always return -1 because === doesn't work
                return value.instance.caller.remoteGuid == phoneLineConnection.hubConnection.connectionGuid;
            })
            if (index < 0) {
                let componentRef: ComponentRef<PhoneCallComponent> = this.phoneCallComponentInsert.createComponent(this.phoneCallComponentFactory);
                let phoneCallComponent = componentRef.instance;
                //show to main video is clicked
                phoneCallComponent.onShowToMainVideo.subscribe((remoteStream) => {
                    if (this.service.isEmpty(remoteStream)) {
                        this.service.attachMediaStream(this.mainVideoElement.nativeElement, this.service.localMediaStream, this.localGuid);
                    }
                    else {
                        this.service.attachMediaStream(this.mainVideoElement.nativeElement, remoteStream, phoneLineConnection.hubConnection.connectionGuid);
                    }
                })

                //phoneCallComponent.onPrivateMessageClicked.subscribe((remoteGuid) => {
                //	let phoneLineConnection: PhoneLineConnectionType = this.phoneService.getPhoneLineConnectionFromCacheByRemoteGuid(remoteGuid);

                //	this.showChatModal(phoneLineConnection.hubConnection.name, remoteGuid, phoneLineConnection.hubConnection.email)
                //})

                if (!!phoneCallComponent.onEndPhoneCallComponent) {
                    phoneCallComponent.onEndPhoneCallComponent.subscribe(this.onEndPhoneCallComponent.bind(this));
                }

                phoneCallComponent.caller = new CallerType();
                phoneCallComponent.caller.remoteGuid = phoneLineConnection.hubConnection.connectionGuid;
                phoneCallComponent.caller.profile = new ProfileDto();
                phoneCallComponent.caller.profile.email = phoneLineConnection.hubConnection.email;
                phoneCallComponent.caller.profile.name = phoneLineConnection.hubConnection.name;

                this.phoneCallComponentRefs.push(componentRef);

                // update the list of users in the phone conversation, this is required for text messaging
                let member: MemberType;

                this.service.getAccessToken()
                    .then((accessToken: string) => {
                        return this.service.getMemberByEmail(phoneLineConnection.hubConnection.email, accessToken);
                    })
                    .then((m: MemberType) => {
                        member = m;
                    })
                    .catch((e) => {
                        console.log("an error occurred while trying to get a member profile with their email error:", e);
                    })
                    .then(() => {
                        let genericUser = new GenericUserType();
                        genericUser.id = phoneLineConnection.hubConnection.connectionGuid;
                        genericUser.email = this.service.isEmpty(member) ? phoneLineConnection.hubConnection.email
                            : member.email;
                        genericUser.name = this.service.isEmpty(member) ? phoneLineConnection.hubConnection.name
                            : member.firstName + " " + member.lastName;
                        genericUser.imgSrc = this.service.defaultAvatar;
                        if (this.service.isEmpty(member) === false && this.service.isEmpty(member.avatarFileName) === false) {
                            genericUser.imgSrc = this.service.avatarBaseUrl + member.avatarFileName;
                        }

                        let index = this.users.findIndex((user) => {
                            return user.id === phoneLineConnection.hubConnection.connectionGuid;
                        });
                        if (index < 0) {
                            this.users.push(genericUser);
                            console.log("addPhoneCallComponent users: ", this.users);
                        }
                        resolve(componentRef);
                    })
            }
            else {
                // the dom already has the phoneLineConnection phoneCallComponent
                resolve(null);
            }
        })
    }

    localVideoClicked() {
        this.service.attachMediaStream(this.mainVideoElement.nativeElement, this.service.localMediaStream);
    }

    async openGroupSmsInterface(): Promise<void> {
        // build the form fields
        let formItems = new Array<FormItemType>();
        let formItem = new FormItemType();
        formItem.isEmail = false;
        formItem.key = "message";
        formItem.label = "Message";
        formItem.maxLength = 500;
        formItem.minLength = 0;
        formItem.required = true;
        formItems.push(formItem);

        // initialize the modal
        let dialogRef = await this.modalCtrl.create({
          component: FormGetInfoComponent, 
          componentProps: {
            title: "Group SMS",
            formItems: formItems,
            instructions: '<p>Enter your message.</p>'
        }});

        // display the modal
        if (this.service.isIos()) { this.hideAllVideos(); }
        await dialogRef.present();

        // handle the modal closing
        let {data} = await dialogRef.onDidDismiss();
        if (this.service.isIos()) { this.showAllVideos(); }
        try {
            console.log("groupSMS onDidDismiss formItems: ", data.formItems);

            if (this.service.isEmpty(data.formItems) === false) {
                // the user clicked the
                let message = "";
                // extract the message from the form
                for (let i = 0; i < data.formItems.length; i++) {
                    if (data.formItems[i].key === "message") {
                        message = data.formItems[i].value;
                        break;
                    }
                }

                // make sure we have a message to send
                if (this.service.isEmpty(message) === false) {
                    if (this.service.isEmpty(this.service.phoneLine) === false && this.service.phoneLine.phoneLineConnections.length > 0) {
                        this.service.sendGroupSmsMessage(message, this.service.phoneLine.phoneLineGuid)
                            .then((result) => {
                                console.log("sent Group SMS result: ", result);
                                // NOTE: message sent. everyone including this user will receive GroupSMS from signalr
                                return;
                            })
                            .catch((e) => {
                                console.log("send Group SMS error: ", e);
                                throw ("Sorry unable to send the message.");
                            })
                    }
                    else {
                        throw ("Unable to send message, there is no one to send a message to.");
                    }
                }
                else {
                    throw ("Unable to send an empty message.")
                }
            }
            else {
                // if the form is dismissed without formItems, that means the user cancelled
                // sending group sms message, so there is nothing to process
            }
        }
        catch (e) {
            //this.alertCtrl.create({
            //  title: "Please Check",
            //  message: e,
            //  buttons: ["OK"]
            //}).present();

            let alert = new MaterialAlertMessageType();
            alert.title = "Please Check";
            alert.message = e.toString();
            this.service.openAlert(alert);
        }
    }

    async openPrivateSmsInterface(remoteGuid?: string): Promise<void> {
        console.log("openPrivateSmsInterface this.users: ", this.users);

        if (remoteGuid !== this.localGuid) {
            if (this.service.isEmpty(this.users) === false) {
                let user: GenericUserType = null
                let filteredUsers: Array<GenericUserType> = this.users.slice();

                if (this.service.isEmpty(remoteGuid) === false) {
                    //search for the default selected user
                    user = filteredUsers.find((user) => {
                        return user.id == remoteGuid;
                    });
                }

                // search for sender
                let index = filteredUsers.findIndex((user: GenericUserType) => {
                    return user.id == this.localGuid;
                });
                let localUser = filteredUsers[index];
                if (index > -1) {
                    // remove the sender, because sender can not send a message to self
                    filteredUsers.splice(index, 1);
                }

                //let newMessage: string;

                let modal = await this.modalCtrl.create({
                  component: PrivateMessagingComponent, 
                  componentProps: {
                    currentUser: user,
                    users: filteredUsers
                }});

                if (this.service.isIos()) { this.hideAllVideos(); }
                await modal.present();

                let {data} = await modal.onDidDismiss();
                if (this.service.isIos()) { this.showAllVideos(); }
                if (this.service.isEmpty(data.m) === false && this.service.isEmpty(localUser) === false) {
                    let message = new TextMessageType();
                    message.id = localUser.id;
                    message.email = localUser.email;
                    message.name = localUser.name;
                    message.message = data.m;
                    message.isIncoming = false;
                    message.isPrivate = true;
                    message.imgSrc = localUser.imgSrc;
                    this.currentMessage = message;
                    this.textMessages.unshift(message);
                }
            }
            else {
                //this.alertCtrl.create({
                //  title: "Please Check",
                //  message: "You must be connected to atleast one other user to send a private message",
                //  buttons: ["OK"]
                //}).present();
                let alert = new MaterialAlertMessageType();
                alert.title = "Please Check";
                alert.message = "You must be connected to atleast one other user to send a private message";
                this.service.openAlert(alert);
            }
        }
        else {
            // nothing to do, the user can not open a private sms interface and send themself a private message
        }
    }

    async onOpenPrivateSmsInterface(remoteGuid: string): Promise<void> {
        try {
            //let user = this.users.find((user) => {
            //	return user.id == remoteGuid;
            //})
            //if (this.service.isEmpty(user) === false) {
            //	let filteredUsers: Array<GenericUserType> = this.users.slice();
            //	let localGuid: string;
            //	let index: number = -1;
            //	try {
            //		localGuid = await this.service.getLocalGuid();
            //	}
            //	catch (e) {
            //		console.log("phone.ts onOpenPrivateSmsInterface getLocalGuid error: ", e);
            //	}

            //	index = filteredUsers.findIndex((user: GenericUserType) => {
            //		return user.id == localGuid;
            //	});
            //	let localUser = filteredUsers[index];
            //	if (index > -1) {
            //		filteredUsers.splice(index, 1);
            //	}

            //	let newMessage: string;
            //	try {
            //		if (this.service.isEmpty(this.users) === false) {
            //			// remove self from users
            //			let failedUsers: Array<GenericUserType>;
            //			let successUsers: Array<GenericUserType>;

            //			let modal = this.modalCtrl.create(PrivateMessagingComponent, {
            //				currentUser: this.service.isEmpty(selectedUser) ? null : selectedUser,
            //				users: this.users
            //			});

            //			modal.present();
            //		}
            //		else {
            //			throw ("You must be connected to atleast one other user to send a private message");
            //		}

            //		newMessage = await this.service.openPrivateSmsInterface(filteredUsers, user);
            //	}
            //	catch (e) {
            //		throw ("Unable to send message");
            //	}
            //	//console.log("phone.page newMessage: ", newMessage);

            //	//console.log("before this.textMessages: ", this.textMessages);

            //	if (this.service.isEmpty(newMessage) === false && this.service.isEmpty(localUser) === false) {
            //		let message = new TextMessageType();
            //		message.id = localUser.id;
            //		message.email = localUser.email;
            //		message.name = localUser.name;
            //		message.message = newMessage;
            //		message.isIncoming = false;
            //		message.isPrivate = true;
            //		message.imgSrc = localUser.imgSrc;
            //		this.currentMessage = message;
            //		this.textMessages.unshift(message);
            //		//console.log("after this.textMessages: ", this.textMessages);
            //	}
            //}
        }
        catch (e) {
            this.alertCtrl.create({
                header: "Please check",
                message: e,
                buttons: ["OK"]
            }).then((altRes)=>{
              altRes.present();
            })
        }
    }

    async saveMessages(): Promise<void> {
        //console.log("save messages: ", this.textMessages);
        try {
            if (this.service.isEmpty(this.textMessages) === false) {
                let formItems = new Array<FormItemType>();
                let formItem = new FormItemType();
                formItem.isEmail = true;
                formItem.key = "email";
                formItem.label = "Email";
                formItem.maxLength = 300;
                formItem.minLength = 5;
                formItem.required = true;
                formItems.push(formItem);

                let dialogRef = await this.modalCtrl.create({
                  component: FormGetInfoComponent, 
                  componentProps: {
                    title: "Save Your Text Conversation",
                    formItems: formItems,
                    instructions: '<p>Please enter your email. We will send a copy of your text conversion to the email provided.</p>'
                }});

                if (this.service.isIos()) { this.hideAllVideos(); }
                await dialogRef.present();

                let {data} = await dialogRef.onDidDismiss();
                if (this.service.isIos()) { this.showAllVideos(); }
                let email = "";
                for (let i = 0; i < data.formItems.length; i++) {
                    if (data.formItems[i].key === "email") {
                        email = data.formItems[i].value;
                    }
                }

                this.ngZone.run(async () => {
                    let accessToken = await this.service.getAccessToken();
                    let message = "";

                    this.textMessages.forEach((m) => {
                        message += '<p><strong>' + m.name + ': </strong>' + m.message + '</p>';
                    })

                    let dto = new SendCopyOfMessageDto();
                    dto.email = email;
                    dto.message = message;
                    await this.service.SendCopyOfMessage(dto, accessToken);

                    //this.alertCtrl.create({
                    //  title: "Success",
                    //  message: "Current messages were sent to the email: " + email,
                    //  buttons: ["OK"]
                    //}).present();

                    let alert = new MaterialAlertMessageType();
                    alert.title = "Success";
                    alert.message = "Current messages were sent to the email: " + email;
                    this.service.openAlert(alert);
                });
            }
            else {
                throw ("There are no messages to save.")
            }
        }
        catch (e) {
            //this.alertCtrl.create({
            //  title: "Please Check",
            //  message: e,
            //  buttons: ["OK"]
            //}).present();

            let alert = new MaterialAlertMessageType();
            alert.title = "Please Check";
            alert.message = e.toString();
            this.service.openAlert(alert);
            //let alert = new MaterialAlertMessageType();
            //alert.title = "Please check";
            //alert.message = e;
            //this.service.openAlert(alert);
        }
    }

    async displayInfo(): Promise<void> {
    }

    scrollToBottom(): void {
        try {
            this.chatboxContainer.nativeElement.scrollTop = this.chatboxContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    async showRepInformation(): Promise<void> {
        let modal = await this.modalCtrl.create({
          component: CustomerPbxInfoComponent, 
          componentProps: {
            companyProfile: this.genericCompanyProfile,
            employee: this.employee
        }});
        if (this.service.isIos()) { this.hideAllVideos(); }
        await modal.present();
        let {role} = await modal.onDidDismiss();
        if (this.service.isIos()) { this.showAllVideos(); }
    }

    async addAdditionalInformation(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            let modal = await this.modalCtrl.create({
              component: FormCustomerPbxComponent, 
              componentProps: {
                customerProfile: this.pbxCallQueue
            }});

            if (this.service.isIos()) { this.hideAllVideos(); }
            await modal.present();

            let {data} = await modal.onDidDismiss();
                if (this.service.isIos()) { this.showAllVideos(); }
                if (this.service.isEmpty(data.m) === false) {
                    try {
                        if (this.service.isEmpty(data.m.name) === false) {
                            this.pbxCallQueue.name = data.m.name;
                        }
                        if (this.service.isEmpty(data.m.subject) === false) {
                            this.pbxCallQueue.subject = data.m.subject;
                        }

                        if (this.service.isEmpty(data.m.message) === false) {
                            this.pbxCallQueue.message = data.m.message;
                        }

                        if (this.service.isEmpty(this.pbxlineRepStatus) === false) {
                            // do update and send updated information to the rep

                            this.service.sendPbxCallQueueNotes(this.pbxCallQueue, this.pbxlineRepStatus.connectionGuid)
                                .then(() => {
                                    resolve();
                                })
                                .catch((e) => {
                                    throw (e);
                                })
                        }
                        else {
                            // do update only
                            this.service.sendPbxCallQueueNotes(this.pbxCallQueue, null)
                                .then(() => { resolve(); })
                                .catch((e) => {
                                    throw (e);
                                })
                        }
                    }
                    catch (e) {
                        // NOTE: if the sendPbxCallQueueNotes is sending to connectionGuid that does
                        console.log("sendQueueNotes error: ", e);
                        resolve();
                    }
                }
                else {
                    // dismissed without information, so nothing to process. customer cancelled
                    resolve();
                }
        })
    }

    async openActionSheet(): Promise<void> {
        let afterCloseShowVideos: boolean = true;
        let actionButtons: Array<any> = [
            {
                text: 'Close Menu',
                role: 'destructive', // will always sort to be on the bottom
                icon: !this.service.isIos() ? 'close' : null
            },
            {
                text: 'Pbx Information',
                icon: !this.service.isIos() ? 'person' : null,
                handler: () => {
                    afterCloseShowVideos = false;
                    this.showRepInformation();
                }
            },
            {
                text: 'Your Information',
                icon: !this.service.isIos() ? 'create' : null,
                handler: () => {
                    afterCloseShowVideos = false;
                    this.addAdditionalInformation();
                }
            },
            {
                text: 'Expand Text Chat',
                icon: !this.service.isIos() ? 'expand' : null,
                handler: () => {
                    afterCloseShowVideos = false;
                    this.expandChat();
                }
            },
            {
                text: 'Reduce Text Chat',
                icon: !this.service.isIos() ? 'contract' : null,
                handler: () => {
                    afterCloseShowVideos = false;
                    this.collapseChat();
                }
            },
            {
                text: 'Save Text Chat',
                icon: !this.service.isIos() ? 'mail' : null,
                handler: () => {
                    afterCloseShowVideos = false;
                    this.saveMessages();
                }
            },
            {
                text: 'Send Group Message',
                icon: !this.service.isIos() ? 'chatbubbles' : null,
                handler: () => {
                    afterCloseShowVideos = false;
                    this.openGroupSmsInterface();
                }
            },
            {
                text: 'Send Private Message',
                icon: !this.service.isIos() ? 'text' : null,
                handler: () => {
                    afterCloseShowVideos = false;
                    this.openPrivateSmsInterface();
                }
            }

        ];

        if (this.service.isEmpty(this.isBusy)) {
            actionButtons.push({
                text: 'Exit Pbx',
                role: 'cancel',
                icon: !this.service.isIos() ? 'exit' : null,
                handler: () => {
                    this.exitPhone();
                }
            })
        }
        else {
            actionButtons.push({
                text: 'Exit Pbx',
                role: 'cancel',
                icon: !this.service.isIos() ? 'exit' : null,
                handler: () => {
                    this.endConnection();
                }
            })
        }

        let actionSheet = await this.actionSheetCtrl.create({
            buttons: actionButtons
        });
        if (this.service.isIos()) { this.hideAllVideos(); }
        await actionSheet.present();

        actionSheet.onDidDismiss().then(()=>{
          if (afterCloseShowVideos) {
              if (this.service.isIos()) { this.showAllVideos(); }
          }
        });
    }
}
