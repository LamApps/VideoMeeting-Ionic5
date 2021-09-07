import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ViewContainerRef,
  ViewChild,
  OnInit,
  ComponentRef,
  ElementRef,
  NgZone,
} from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { Subscription } from 'rxjs';
import {
  ModalController,
  ActionSheetController,
  Platform,
} from '@ionic/angular';

// import {
//   PhoneCallComponent,
//   AppShellPage,
//   LoginPage,
// } from '../index'

import { ContactSearchModalComponent } from '../../components/contact-search-modal/contact-search-modal.component'
import { PhoneCallComponent } from 'src/app/components/phone-call/phone-call.component';
import { PhoneLineInvitationModalComponent } from '../../components/phone-line-invitation-modal/phone-line-invitation-modal.component'

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
  MaterialAlertMessageType,
} from '../../models/index';

import { Service } from '../../services/index';
import { FormGetInfoComponent, PrivateMessagingComponent, IncomingCallModalComponent, } from '../../components/index';
import { Router } from '@angular/router';
import { filter, distinctUntilKeyChanged} from 'rxjs/operators';
//import 'webrtc-adapter';
declare var cordova: any;
@Component({
  selector: 'app-phone',
  templateUrl: './phone.page.html',
  styleUrls: ['./phone.page.scss'],
})
export class PhonePage implements OnInit {
  _pageName: string = "phone.ts";
  get pageName(): string {
      return this._pageName;
  }

  isChatExpanded: boolean = false;
  smsMessages: SmsMessageType[] = new Array;

  constructor(
      //private viewContainerRef: ViewContainerRef,
      private componentFactoryResolver: ComponentFactoryResolver,
      private modalCtrl: ModalController,
      private actionSheetCtrl: ActionSheetController,
      private platform: Platform,
      private ngZone: NgZone,
      private service: Service,
      private router: Router,
  ) {
      //allows the hardware/software backbutton to go back to appshell page
      //this.navCtrl.insert(0, AppShellPage)
      //this.phoneCallComponentRefs = new Array<ComponentRef<PhoneCallComponent>>();
      this.hasIncoming = false;
      this.users = new Array<GenericUserType>();
      //this.textMessages = new Array<TextMessageType>();
      //for (var i = 1; i < 10; i++) {
      //	let message = new TextMessageType();
      //	message.email = "test" + i.toString() + "@lvc.com";
      //	message.id = "12345" + i.toString();
      //	message.message = "I am number " + i.toString();
      //	message.name = "NameIs " + i.toString();
      //	message.imgSrc = this.service.defaultAvatar;
      //	this.textMessages.push(message);
      //}
  }
  ngOnInit() {
  }
  isVideoHidden: boolean;

  // #region variables

  onAppPause: Subscription;
  onAppResume: Subscription;
  onVideoHidden: Subscription;

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
  receiveAcceptPhoneLineInvitation: Subscription;
  receiveAreYouReadyForCall: Subscription;
  receiveReadyForCall: Subscription;
  receiveNotReadyForCall: Subscription;
  receiveSDP: Subscription;
  receiveICE: Subscription;
  receiveBusyResponse: Subscription;
  receiveNotAcceptCall: Subscription;
  receiveRemoteLogout: Subscription;
  receivePutOnHold: Subscription;
  receiveRemoveOnHold: Subscription;
  receiveGroupSmsMessage: Subscription;
  receivePrivateSmsMessage: Subscription;
  receiveHangUpNotice: Subscription;
  receiveCancelInvitation: Subscription;

  // #endregion subscriptions

  // fired before everything, to check if a user can access a view
  // ionViewCanEnter() {
  //     console.log("phone.ts ionViewCanEnter");

  //     this.statusBar.hide();
  //     // page
  //     return new Promise<boolean>(async (resolve) => {
  //         let canActivatePage: boolean = await this.service.canActivatePage();
  //         resolve(canActivatePage);
  //     });
  // }


  ionViewWillEnter() {
      // fires each time user enters page but before the page actually becomes the active page
      // use ionViewDidEnter to run code when the page actually becomes the active page

      console.log("phone.ts ionViewWillEnter");

      //// Uncomment for testing
      //for (var i = 1; i < 10; i++) {
      //	let message = new TextMessageType();
      //	message.email = "test" + i.toString() + "@lvc.com";
      //	message.id = "12345" + i.toString();
      //	message.message = "I am number " + i.toString() + ", and this is my long message to you on the other end of the line to see";
      //	message.name = "NameIs " + i.toString();
      //	message.imgSrc = this.service.defaultAvatar;
      //	message.isPrivate = (i % 2) > 0 ? true : false;
      //	this.textMessages.unshift(message);
      //}
      if (this.service.isEmpty(this.textMessages)) {
          this.textMessages = new Array<TextMessageType>();
      }

      this.isBusy = false;
      //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

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

      this.onAppResume = this.platform.resume.subscribe(async() => {


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
                      this.router.navigate(['login']);
                  }
              }
          }
          else {
              // this.navCtrl.setRoot(LoginPage);
              this.router.navigate(['login']);
          }


      });

      this.isVideoHidden = false;

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

  }

  // fires each time view goes to foreground
  ionViewDidEnter() {

      console.log("phone.ts ionViewDidEnter this.users:", this.users);
      let canStartApp: boolean = false;
      this.service.checkIsLoggedIn()
          .then(async (isLoggedIn: boolean): Promise<boolean> => {
              if (isLoggedIn) {
                  // email has to be set if the user is logged in
                  let isEmailReady: boolean = await this.service.isEmailReady();
                  if (isEmailReady === false) {
                      let email = await this.service.getLoginEmail()
                      await this.service.setEmail(email);
                      return true;
                  }
                  else {
                      return true;
                  }
              }
              else {
                  return new Promise<boolean>((resolve) => {
                      // TODO: prompt for login, continue as guest,  then startApp() or cancel and leave page
                      resolve(true);
                  })
              }
          })
          .then((canStart: boolean) => {
              canStartApp = canStart;
          })
          .catch((e) => {
              console.log("phone.page checkIsLoggedIn error: ", e);
          })
          .then(() => {
              // finally
              if (canStartApp) {
                  this.startApp();
              }
              else {
                  // redirect to login page
                  this.service.doLogout()
                      .then(() => {
                          // this.navCtrl.setRoot(LoginPage);
                          this.router.navigate(['login']);
                      })
                      .catch((e) => {
                      })
              }
          });
  }

  // fires each time user leaves page, but before the user actually leaves the page
  // use ionViewDidLeave() to run code after the page unloads
  ionViewWillLeave() {
      //this.screenOrientation.unlock();
      console.log("phone.ts ionViewWillLeave()");
      //TODO: when the page goes out of focus we need to clean up certain phone elements

      //window.clearTimeout(this.sendInviteTimerRef);

      this.onAppPause && this.onAppPause.unsubscribe();
      this.onAppResume && this.onAppResume.unsubscribe();

      this.onVideoHidden && this.onVideoHidden.unsubscribe();

      this.hangUp()
          .then(() => {
              this.stopLocalVideo();
          })
          .then(() => {
              this.endListeners();

              console.log("phone.ts -> ionViewWillLeave() hangUp()")
          })
          .catch((error) => {
              console.log("phone.ts -> ionViewWillLeave() hangUp() error:", error)
          })
  }
 

  async startApp(): Promise<void> {
      try {
          this.startListeners();

          let memberProfile: MemberType = await this.service.getProfile()

          let genericUser = new GenericUserType();
          let name: string = "";
          if (this.service.isEmpty(memberProfile)) {
              let guestProfile: GuestProfileType = await this.service.getGuestProfile();
              if (this.service.isEmpty(guestProfile)) {
                  // no profile found, the user needs to login
                  // kick the user out and force login
                  // TODO: open a friendly modal for the user to login as member, guest, or continue as anonymous
                  await this.service.doLogout();
                  //this.navCtrl.setRoot(LoginPage);
                  let didLogin: boolean = await this.service.promptLoginChoices();
                  if (this.service.isEmpty(didLogin) === false) {
                      memberProfile = await this.service.getProfile();
                      if (this.service.isEmpty(memberProfile)) {
                          guestProfile = await this.service.getGuestProfile();
                          if (this.service.isEmpty(guestProfile)) {
                              // this.navCtrl.setRoot(LoginPage);
                              this.router.navigate(['login']);
                          }
                          else {
                              name = guestProfile.name;
                              genericUser.email = guestProfile.email;
                              genericUser.imgSrc = this.service.isEmpty(guestProfile.avatarDataUri) ? this.service.defaultAvatar
                                  : guestProfile.avatarDataUri;
                          }
                      }
                      else {
                          name = memberProfile.firstName + " " + memberProfile.lastName;
                          genericUser.email = memberProfile.email;
                          genericUser.imgSrc = this.service.isEmpty(memberProfile.avatarFileName) ? this.service.defaultAvatar
                              : this.service.avatarBaseUrl + memberProfile.avatarFileName;
                      }
                  }
                  else {
                      // this.navCtrl.setRoot(LoginPage);
                      this.router.navigate(['login']);
                  }


              }
              else {
                  name = guestProfile.name;
                  genericUser.email = guestProfile.email;
                  genericUser.imgSrc = this.service.isEmpty(guestProfile.avatarDataUri) ? this.service.defaultAvatar
                      : guestProfile.avatarDataUri;
              }
          }
          else {
              name = memberProfile.firstName + " " + memberProfile.lastName;
              genericUser.email = memberProfile.email;
              genericUser.imgSrc = this.service.isEmpty(memberProfile.avatarFileName) ? this.service.defaultAvatar
                  : this.service.avatarBaseUrl + memberProfile.avatarFileName;
          }

          await this.service.initPhoneService(name);
          this.localGuid = this.service.localGuid;
          genericUser.name = name;
          genericUser.id = this.localGuid;
          this.users.push(genericUser);


          // set the phonecallcomponent factory
          this.phoneCallComponentFactory = this.componentFactoryResolver.resolveComponentFactory(PhoneCallComponent);
          // phoneCallComponentInsert should be empty when we first start the phone, (not wake from cached view)
          this.phoneCallComponentInsert.clear();
          // the phoneCallComponentRefs should be an empty array
          this.phoneCallComponentRefs = new Array<ComponentRef<PhoneCallComponent>>();

          let hasCameraPermission: boolean = await this.service.checkCameraPermissions()
          if (this.service.isEmpty(hasCameraPermission)) {
              throw ("Live Net Video phone requires permission to use the camera.");
          }

          let hasMicrophonePermission: boolean = await this.service.checkMicrophonePermissions();

          if (this.service.isEmpty(hasMicrophonePermission)) {
              throw ("Live Net Video phone requires permission to use the microphone.");
          }
          let email: string;
          let call: CallType;
          await this.startLocalVideo();

          // email = this.navParams.get("emailToCall");
          call = this.service.tryParseJson(JSON.stringify(this.service.acceptedCall)) as CallType;
          //will check to see if we need to perform a call.
          if (this.service.isEmpty(email) === false) {
              await this.trySendPhoneLineInvitation(email)
          }
          else if (this.service.isEmpty(call) === false) {
              this.service.acceptedCall = null;
              this.service.acceptPhoneLineInvitation(call.phoneLineGuid, call.remoteGuid);
          }
      }
      catch (e) {
          let alert = new MaterialAlertMessageType();
          alert.title = "ERROR";
          alert.message = e;
          this.service.openAlert(alert);
      }
  }

  /*
  async promptLoginChoices(): Promise<void> {
      const loginChoicePrompt = this.alertCtrl.create({
          title: 'Credentials Required?',
          message: 'To proceed, please login or continue as a guest.',
          buttons: [
              {
                  text: 'Login',
                  handler: () => {
                      console.log('Login clicked');
                      loginChoicePrompt.dismiss(LoginOptionsEnum.memberLogin);
                  }
              },
              {
                  text: 'Guest',
                  handler: () => {
                      console.log('Guest clicked');
                      loginChoicePrompt.dismiss(LoginOptionsEnum.guestLogin);
  
                  }
              },
              {
                  text: 'Leave',
                  handler: () => {
                      console.log('Leave clicked');
                      loginChoicePrompt.dismiss(LoginOptionsEnum.cancelLogin)
                  }
              }
          ]
      });
      loginChoicePrompt.present();
  
      loginChoicePrompt.onDidDismiss(async (loginOption: LoginOptionsEnum) => {
          switch (loginOption) {
              case (LoginOptionsEnum.memberLogin):
                  await this.promptMemberLogin();
                  break;
              case (LoginOptionsEnum.guestLogin):
                  await this.service.instantGuestLogin();
                  break;
              default:
                  this.navCtrl.setRoot(LoginPage);
  
          }
  
          let isLoggedIn: boolean = await this.service.getIsLoggedIn();
          if (this.service.isEmpty(isLoggedIn)) {
              this.navCtrl.setRoot(LoginPage);
          }
  
      });
  }
  
  async promptMemberLogin(): Promise<void> {
      return new Promise<void>((resolve) => {
          const prompt = this.alertCtrl.create({
              title: 'Member Login',
              message: "Please login to continue.",
              inputs: [
                  {
                      name: 'Email',
                      placeholder: 'email'
                  },
                  {
                      name: 'Password',
                      placeholder: ''
                  },
              ],
              buttons: [
                  {
                      text: 'Cancel',
                      handler: data => {
                          this.navCtrl.setRoot(LoginPage);
                      }
                  },
                  {
                      text: 'Save',
                      handler: data => {
                          console.log('Saved clicked');
                      }
                  }
              ]
          });
          prompt.present();
      });
  
  
  }
  */
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
      //console.log("hiding all videos");
      if (typeof cordova !== "undefined" && this.service.isIos()) {
          this.ngZone.run(() => {
              this.isVideoHidden = true;
              setTimeout(() => {
                  cordova.plugins.iosrtc.refreshVideos();
              });
          })
      }
  }

  async startLocalVideo(): Promise<void> {
      try {
          this.stopLocalVideo();

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
      if (this.service.isIos()) {
          this.mainVideoElement.nativeElement.src = null;
          this.localVideoElement.nativeElement.src = null;

      }
      else {
          this.mainVideoElement.nativeElement.srcObject = null;
          this.localVideoElement.nativeElement.srcObject = null;
      }

      return;
  }

  async updateVideoStream(stream: MediaStream, enable: boolean): Promise<void> {
      let tracks: MediaStreamTrack[] = stream.getTracks();
      tracks.forEach((t) => {
          t.enabled = enable;
      })

      return;
  }

  /*
  initLocalVideo(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
          if (this.service.isEmpty(this.service.localMediaStream) === false) {
              let tracks: MediaStreamTrack[] = this.service.localMediaStream.getTracks();
              //console.log("tracks: ", tracks);
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
                  this.localVideoElement.nativeElement.setAttribute('style', 'z-index:300');
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
        component:IncomingCallModalComponent,
        componentProps: { call: call }
      });
      await this.incomingCallModal.present();
      let { data } = await this.incomingCallModal.onDidDismiss();
      if (this.service.isIos()) { this.showAllVideos(); }
      if (data === IncomingCallResponseEnum.accept) {
          this.hasIncoming = false;
          this.service.acceptPhoneLineInvitation(call.phoneLineGuid, call.remoteGuid);
      }
      else if (data === IncomingCallResponseEnum.deny) {
          this.hasIncoming = false;
          this.service.sendNotAcceptCall(call.remoteGuid);
      }
      else if (data === IncomingCallResponseEnum.block) {
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
      setTimeout(() => {
          this.hasIncoming = false;

          this.incomingCallModal && this.incomingCallModal.dismiss();
      }, 30000)//has 30 seconds to respond
  }

  // Subscribe to phone.service webRtcHub Listeners
  // NOTE: this should start once when phone page is loaded with setRoot, use ionViewDidLoad() fires once
  startListeners(): void {
      this.endListeners();

      console.log("phone.ts listeners started");

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

      this.receiveAcceptPhoneLineInvitation = this.service.receiveAcceptPhoneLineInvitation.asObservable()
          .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
          .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
          .subscribe((message: ObservableMessageType) => {
              console.log("receive accept invite from remoteGuid: ", message);
              let remoteGuid = message.message;
              if (this.service.isEmpty(remoteGuid) === false) {
                  // TODO: the other user has accepted this users call, remove any modals or alerts showing the call status.
                  // and wait for the other user to establish a connection with this user.

                  // close the outgoing call modal, NOTE: this modal component will clear the timer in onDidDismiss()
                  this.phonelineInvitationModal && this.phonelineInvitationModal.dismiss();
              }
          });

      this.receiveAreYouReadyForCall = this.service.receiveAreYouReadyForCall.asObservable()
          .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
          .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
          .subscribe((message: ObservableMessageType) => {
              console.log("phone.ts receiveAreYouReadyForCall:", message);
              let json = message.message;
              if (this.service.isEmpty(json) === false) {
                  let phoneLineConnection: PhoneLineConnectionType = this.service.jsonToObject<PhoneLineConnectionType>(json, true);

                  if (this.service.isEmpty(phoneLineConnection) === false) {
                      //NOTE: make sure the phoneCallComponent is not visible at this point.
                      let phoneCallComponent: PhoneCallComponent;
                      this.addPhoneCallComponentToDom(phoneLineConnection)
                          .then((componentRef: ComponentRef<PhoneCallComponent>) => {
                              // NOTE: addPhoneCallComponentToDom only adds to dom if the phoneLineConnection doesn't already exist this.phoneCallComponentRefs
                              if (this.service.isEmpty(componentRef) === false) {
                                  phoneCallComponent = componentRef.instance;
                              }
                              else {
                                  // else we look for existing element
                                  phoneCallComponent = this.getPhoneCallComponentInstance(phoneLineConnection.hubConnection.connectionGuid);
                              }
                              return;
                          })
                          .then(() => {
                              return this.service.addPhoneLineConnectionToPhoneLine(phoneLineConnection);
                          })
                          .then(() => {
                              console.log("phone.ts receiveAreYouReadyForCall() creating RtcPeerConnection");
                              return this.service.createRtcPeerConnection();
                          })
                          .then((pc: RTCPeerConnection) => {
                              phoneCallComponent.pc = pc;
                              console.log("phone.ts receiveAreYouReadyForCall() starting RtcPeerConnection listeners")
                              return phoneCallComponent && phoneCallComponent.startPeerConnectionListeners();
                          })
                          .then(() => {
                              console.log("phone.ts receiveAreYouReadyForCall() sendingReadyForCall")
                              return this.service.sendReadyForCall(phoneLineConnection.hubConnection.connectionGuid);
                          })
                          .then(() => {
                              console.log("phone.ts -> receiveAreYouReadyForCall -> sent ReadyForCall now waiting for sdp offer");
                              return this.service.isPhoneBusy();
                          })
                          .then((isPhoneBusy: boolean) => {
                              this.isBusy = isPhoneBusy;
                          })
                          .catch((error) => {
                              console.log("phone.ts receiveAreYouReadyForCall() addPhoneLineConnectionToPhoneLine error:", error);
                              this.service.sendNotReadyForCall(this.service.stringify(error), phoneLineConnection.hubConnection.connectionGuid);
                          })
                  }
              }
          });

      this.receiveReadyForCall = this.service.receiveReadyForCall.asObservable()
          .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
          .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
          .subscribe(async (message: ObservableMessageType) => {
              console.log("phone.ts receiveReadyForCall : ", message);
              try {

                  let remoteGuid = message.message;
                  if (this.service.isEmpty(remoteGuid)) {
                      throw ("Received Ready For Call with no RemoteGuid");
                  }
                  if (this.service.isEmpty(this.service.currentCallAttempt) === false) {
                      this.service.currentCallAttempt.responses++;
                  }

                  let phoneLineConnection: PhoneLineConnectionType = this.service.getPhoneLineConnectionFromCacheByRemoteGuid(remoteGuid);

                  if (this.service.isEmpty(phoneLineConnection)) {
                      throw ("Unable to get phonelineconnection using remoteGuid: " + remoteGuid);
                  }
                  let phoneCallComponent: PhoneCallComponent;
                  // wait a split second to make sure the localVideoStream is ready

                  let componentRef: ComponentRef<PhoneCallComponent> = await this.addPhoneCallComponentToDom(phoneLineConnection);

                  // NOTE: addPhoneCallComponentToDom only adds to dom if the phoneLineConnection doesn't already exist this.phoneCallComponentRefs
                  if (this.service.isEmpty(componentRef) === false) {
                      phoneCallComponent = componentRef.instance;
                  }
                  else {
                      // else we look for an existing dom element
                      phoneCallComponent = this.getPhoneCallComponentInstance(phoneLineConnection.hubConnection.connectionGuid);
                  }

                  console.log("creating peerconnectino object");
                  let pc: RTCPeerConnection = await this.service.createRtcPeerConnection();
                  console.log("peerConnection object created");
                  phoneCallComponent.pc = pc;
                  await phoneCallComponent.startPeerConnectionListeners();
                  console.log("phoneCallComponent.startPeerConnectionListeners() success");

                  if (this.service.isEmpty(this.service.localMediaStream)) {
                      await this.service.delay(500);
                      await phoneCallComponent.addLocalStream(this.service.localMediaStream);
                  }
                  else {
                      await phoneCallComponent.addLocalStream(this.service.localMediaStream);
                  }

                  console.log("starting p2p connection");
                  await phoneCallComponent.startP2pConnection();

                  this.isBusy = await this.service.isPhoneBusy();

                  return;
              }
              catch (e) {
                  console.log("receiveReadyForCallError: " + e.toString());
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

      this.receiveBusyResponse = this.service.receiveBusyResponse.asObservable()
          .pipe(filter<ObservableMessageType>((o) => { return this.service.isEmpty(o.message) === false; }))
          .pipe(distinctUntilKeyChanged<ObservableMessageType>("timestamp"))
          .subscribe((message: ObservableMessageType) => {
              console.log("phone.ts -> receivedBusyResponse remoteGuid:", message);
              let remoteGuid = message.message;
              if (this.service.isEmpty(remoteGuid) === false) {
                  // TODO: if you display a modal or alert that informs the caller of their calling status,
                  // then you should close the modal or alert at this point because the other user is busy and not answering this call.
                  // Display a message that tells the user the other user they are trying to call is busy, try again later.
                  //displayErrorToUser("The user is busy with another call. Please try your call later.")

                  //this.currentAlert && this.currentAlert.dismiss();
                  this.phonelineInvitationModal && this.phonelineInvitationModal.dismiss();
                  // TODO: the call should only last about 30-45 seconds. if it last longer, we need to timeout and stop trying the call.
                  // TODO: display calling GUI elements, example: "please wait calling email"
                  //this.currentAlert = this.alertCtrl.create({
                  //  title: 'Busy',
                  //  subTitle: 'The other user is busy on another line. Please try your call at a later time.',
                  //  buttons: ['OK']
                  //});
                  //this.currentAlert.present();

                  let alert = new MaterialAlertMessageType();
                  alert.title = "Busy";
                  alert.message = "The other user is busy on another line. Please try your call at a later time.";
                  this.service.openAlert(alert);
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

                  //this.currentAlert = this.alertCtrl.create({
                  //  title: 'Call Not Accepted',
                  //  subTitle: 'The other user did not accept your call.',
                  //  buttons: ['OK']
                  //});
                  this.currentAlert.present();
                  let alert = new MaterialAlertMessageType();
                  alert.title = "Call Not Accepted";
                  alert.message = "The other user did not accept your call.";
                  this.service.openAlert(alert);
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
                      //phoneCallComponent.isVideoHidden = true; // hide the video and the put on hold button
                      phoneCallComponent.hideVideo(true);
                      phoneCallComponent.isOnHold = false; // hide the remove hold button

                      if (this.service.isEmpty(phoneCallComponent.remoteStream) === false) {
                          this.service.updateMediaStreamAudio(phoneCallComponent.remoteStream, false);
                          this.service.updateMediaStreamVideo(phoneCallComponent.remoteStream, false);
                      }

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
                      //phoneCallComponent.isVideoHidden = false; // show the video and the put on hold button
                      phoneCallComponent.hideVideo(false);
                      phoneCallComponent.isOnHold = false; // the remove hold button remains hidden

                      if (this.service.isEmpty(phoneCallComponent.remoteStream) === false) {
                          this.service.updateMediaStreamAudio(phoneCallComponent.remoteStream, true);
                          this.service.updateMediaStreamVideo(phoneCallComponent.remoteStream, true);
                      }
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
                                  // this.navCtrl.pop()
                                  //     .catch((error) => {
                                  //         console.log("phone.ts receiveRemoteLogout pop error: ", error);
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
                  //this.currentAlert = this.alertCtrl.create({
                  //  title: 'Call Ended',
                  //  subTitle: 'The other user has cancelled the call.',
                  //  buttons: ['OK']
                  //});

                  //this.incomingCallModal.onDidDismiss(() => {
                  //  this.showAllVideos();
                  //})
                  this.currentAlert.present();
                  let alert = new MaterialAlertMessageType();
                  alert.title = "Call Ended";
                  alert.message = "The other user has cancelled the call.";
                  this.service.openAlert(alert);
              }
          });
  }

  endListeners(): void {
      console.log("phone.ts listeners ended");

      this.receivePhoneLineInvitation && this.receivePhoneLineInvitation.unsubscribe();

      this.receiveAcceptPhoneLineInvitation && this.receiveAcceptPhoneLineInvitation.unsubscribe();

      this.receiveAreYouReadyForCall && this.receiveAreYouReadyForCall.unsubscribe();

      this.receiveReadyForCall && this.receiveReadyForCall.unsubscribe();

      this.receiveNotReadyForCall && this.receiveNotReadyForCall.unsubscribe();

      this.receiveSDP && this.receiveSDP.unsubscribe();

      this.receiveICE && this.receiveICE.unsubscribe();

      this.receiveGroupSmsMessage && this.receiveGroupSmsMessage.unsubscribe();

      this.receivePrivateSmsMessage && this.receivePrivateSmsMessage.unsubscribe();

      this.receiveBusyResponse && this.receiveBusyResponse.unsubscribe();

      this.receiveNotAcceptCall && this.receiveNotAcceptCall.unsubscribe();

      this.receivePutOnHold && this.receivePutOnHold.unsubscribe();

      this.receiveRemoveOnHold && this.receiveRemoveOnHold.unsubscribe();

      this.receiveRemoteLogout && this.receiveRemoteLogout.unsubscribe();

      this.receiveHangUpNotice && this.receiveHangUpNotice.unsubscribe();

      this.receiveCancelInvitation && this.receiveCancelInvitation.unsubscribe();
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

  //openGroupChat() {
  //	this.showChatModal()
  //}

  //showChatModal(name?: string, remoteGuid?: string, email?: string) {
  //	let chatModal = this.modalCtrl.create(ChatModalComponent, {
  //		remoteGuid,
  //		email
  //	});
  //	chatModal.onDidDismiss(data => {
  //		if (data.sent) {
  //			let sms = new SmsMessageType();
  //			sms.isPrivate = true;
  //			sms.displayName = name;
  //			sms.isSender = true;
  //			sms.message = data.enteredSms;
  //			this.smsMessages.push(sms);
  //			this.scrollToBottom();
  //		}
  //		console.log(data, 'from show chat modal')
  //	})
  //	chatModal.present();
  //}

  collapseChat() {
      this.isChatExpanded = false;
      console.log("collapsechat", this.isChatExpanded)
      this.scrollToBottom();

      if (this.service.isIos()) { this.showAllVideos(); }
  }

  expandChat() {
      this.isChatExpanded = true;
      console.log("expand chat", this.isChatExpanded)
      this.scrollToBottom();

      if (this.service.isIos()) { this.hideAllVideos(); }
  }

  async showContactSearchModal() {
      let contactSearchModal = await this.modalCtrl.create({
        component: ContactSearchModalComponent
      });
      await contactSearchModal.present();
      if (this.service.isIos()) { this.hideAllVideos(); }
      let { data } = await contactSearchModal.onDidDismiss();
      console.log("contactSearchModal.onDidDismiss email: ", data);
      if (this.service.isIos()) { this.showAllVideos(); }
      this.trySendPhoneLineInvitation(data)

  }

  async trySendPhoneLineInvitation(email: string): Promise<void> {
      if (!this.service.isEmpty(email)) {
          this.phonelineInvitationModal = await this.modalCtrl.create({
            component:PhoneLineInvitationModalComponent, 
            componentProps:{ value: email }
          });
          if (this.phonelineInvitationModal) {
              if (this.service.isIos()) { this.hideAllVideos(); }
              await this.phonelineInvitationModal.present();
          }
          let remoteGuid: string;
          try {
              remoteGuid = await this.service.phoneSendPhoneLineInvitation(email);
          }
          catch (e) {
              console.log("service.phoneSendPhoneLineInvitation error: ", e);
          }

          this.sendInviteTimerRef = window.setTimeout(() => {
              if (this.service.isIos()) { this.showAllVideos(); }
              this.phonelineInvitationModal && this.phonelineInvitationModal.dismiss(email);
          }, 60000);

          let {data} = await this.phonelineInvitationModal.onDidDismiss();
          if (this.service.isIos()) { this.showAllVideos(); }
          window.clearTimeout(this.sendInviteTimerRef);
          if (this.service.isEmpty(data) === false) {
              // if dismissed with email, then cancel the call
              this.service.cancelCall(data)
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
              phoneCallComponent.isVideoHidden = this.isVideoHidden;
              phoneCallComponent.isOnHold = false;
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
        component:FormGetInfoComponent, 
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
          console.log("groupSMS onDidDismiss formItems: ", data);

          if (this.service.isEmpty(data) === false) {
              // the user clicked the
              let message = "";
              // extract the message from the form
              for (let i = 0; i < data.length; i++) {
                  if (data[i].key === "message") {
                      message = data[i].value;
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
                component:PrivateMessagingComponent, 
                componentProps: {
                  currentUser: user,
                  users: filteredUsers
              }});

              if (this.service.isIos()) { this.hideAllVideos(); }
              await modal.present();

              let {data} = await modal.onDidDismiss();
              if (this.service.isIos()) { this.showAllVideos(); }
              if (this.service.isEmpty(data) === false && this.service.isEmpty(localUser) === false) {
                  let message = new TextMessageType();
                  message.id = localUser.id;
                  message.email = localUser.email;
                  message.name = localUser.name;
                  message.message = data;
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
          //this.alertCtrl.create({
          //  title: "Please check",
          //  message: e,
          //  buttons: ["OK"]
          //}).present();
          let alert = new MaterialAlertMessageType();
          alert.title = "Please Check";
          alert.message = e.toString();
          this.service.openAlert(alert);
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

              let { data } =  await dialogRef.onDidDismiss();
              if (this.service.isIos()) { this.showAllVideos(); }
              let email = "";
              for (let i = 0; i < data.length; i++) {
                  if (data[i].key === "email") {
                      email = data[i].value;
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
          alert.title = "Please check";
          alert.message = e.toString();
          this.service.openAlert(alert);
      }
  }

  scrollToBottom(): void {
      try {
          this.chatboxContainer.nativeElement.scrollTop = this.chatboxContainer.nativeElement.scrollHeight;
      } catch (err) { }
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
              text: 'Contacts',
              icon: !this.service.isIos() ? 'contacts' : null,
              handler: () => {
                  afterCloseShowVideos = false;
                  this.showContactSearchModal();
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
          },

          {
              text: 'Exit Phone',
              icon: !this.service.isIos() ? 'exit' : null,
              handler: () => {
                  this.exitPhone();
              }
          }

      ];

      if (this.service.isEmpty(this.isBusy) === false) {
          actionButtons.push({
              text: 'End Call',
              icon: !this.service.isIos() ? 'square' : null,
              handler: () => {
                  this.hangUp();
              }
          })
      }

      let actionSheet = await this.actionSheetCtrl.create({
          buttons: actionButtons
      });

      if (this.service.isIos()) { this.hideAllVideos(); }
      await actionSheet.present();
      await actionSheet.onDidDismiss();
      if (afterCloseShowVideos && this.service.isIos()) {
          this.showAllVideos();
      }
  }

}
