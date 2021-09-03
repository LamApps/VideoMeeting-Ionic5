import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


// import { NativeStorage } from '@ionic-native/native-storage/ngx';
// import {
//     AppShellPage,
//     AddContactsPage,
//     ContactsPage,
//     LoginPage,
//     RegisterPage,
//     EditAvatarPopoverPage,
//     Phone,
//     BlockListPage,
//     SettingsPage,
//     AccountPage,
//     ChangePasswordPage,
//     ForgotPasswordPage,
//     PhoneCallActionPopover,
//     NoInternetPage,
//     ErrorPage,
//     PhoneCallComponent,
//     CompanyProfilePage,
//     CompanySearchPage,
//     CustomerPbxPage,
//     MeetingInvitesPage,
//     MeetingPage,
//     MeetingsDashboardPage,
//     MeetingsPage,
//     PastMeetingsPage,
//     NetcasteePage,
//     NetcasterPage,
//     NetcastDashboardPage,
//     NetcastDetailsPage,
//     NetcastListPage,
//     NetcastSearchPage,
// } from './pages/index';

// import {
//     HttpService,
//     ContactService,
//     LocalContactService,
//     SettingsService,
//     VideoHelperService,
//     ConfigService,
//     SignalrService,
//     JsHelperService,
//     LocalStorageService,
//     GuiHelperService,
//     BlockCallService,
//     ConnectivityService,
//     UserService,
//     PushService,
//     CameraService,
//     PhoneService,
//     PermissionsService,
//     PlatformHelperService,
//     Service,
//     PbxService,
//     CapturePhotoService,
//     FlashMessageService,
//     MaterialsHelperService,
//     FormsErrorService,
//     MeetingService,
//     NetcastService,
//     MapperService,
// } from './services/index';

import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
// import { Keyboard } from '@ionic-native/keyboard/ngx';
// import { Network } from '@ionic-native/network/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';
// import { Push } from '@ionic-native/push/ngx';
// import { DatePicker } from '@ionic-native/date-picker/ngx';
//import { Push } from '@ionic-native/push';

// #endregion Native Plugins

// #region Mocks for Native Plugins
// import { StatusBarMock } from './mocks/status-bar/index';
// import { DiagnosticMock } from './mocks/dianostic/index';
// import { KeyboardMock } from './mocks/keyboard/index';
// import { NetworkMock } from './mocks/network/index';
// import { SplashScreenMock } from './mocks/splash-screen/index';
// import { CameraMock } from './mocks/camera/index';
// import { NativeStorageMock } from './mocks/native-storage/index';
// import { ContactsMock } from './mocks/contacts/index';
// import { PushMock } from './mocks/push/index';
// import { DatePickerMock } from './mocks/date-picker/index';

// #region Provider Factories
// NOTE: mocks only run in "google inc." vendor with https:// or http://, this narrows it down to chrome for mocks.
/*
export function networkFactory(platform: Platform) {
  // let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new NetworkMock() : new Network();
   if (platform.is('cordova')) {
       return new Network();
   }
   else {
       return new NetworkMock();
   }
}

export function statusBarFactory(platform: Platform) {
   //let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new StatusBarMock() : new StatusBar();
   if (platform.is('cordova')) {
       return new StatusBar();
   }
   else {
       return new StatusBarMock();
   }
}

export function diagnosticFactory(platform: Platform) {
   let vendor = navigator && navigator.vendor;
   //console.log("navigator: ", navigator);
   //console.log("document.URL: ", document.URL);
   //if ((vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://')))) {
   //    console.log("create diagnostic mock");
   //}

   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new DiagnosticMock() : new Diagnostic();

   if (platform.is('cordova')) {
       return new Diagnostic();
   }
   else {
       return new DiagnosticMock();
   }

  
}

export function keyboardFactory(platform: Platform) {
   //let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new KeyboardMock() : new Keyboard();
   if (platform.is('cordova')) {
       return new Keyboard();
   }
   else {
       return new KeyboardMock();
   }
}

export function splashScreenFactory(platform: Platform) {
   //let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new SplashScreenMock() : new SplashScreen();

   if (platform.is('cordova')) {
       return new SplashScreen();
   }
   else {
       return new SplashScreenMock();
   }
}

export function cameraFactory(platform: Platform) {
   //let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new CameraMock() : new Camera();
   if (platform.is('cordova')) {
       return new Camera();
   }
   else {
       return new CameraMock();
   }
}

export function nativeStorageFactory(platform: Platform) {
   //let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new NativeStorageMock() : new NativeStorage();
   if (platform.is('cordova')) {
       return new NativeStorage();
   }
   else {
       return new NativeStorageMock();
   }
}

export function contactsFactory(platform: Platform) {
   //let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new ContactsMock() : new Contacts();
   if (platform.is('cordova')) {
       return new Contacts();
   }
   else {
       return new ContactsMock();
   }
}

export function pushFactory(platform: Platform) {
   //let vendor = navigator && navigator.vendor;
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new PushMock() : new Push();
   //return (document.URL.includes('https://') || document.URL.includes('http://')) ? new PushMock() : new Push();
   if (platform.is('cordova')) {
       return new Push();
   }
   else {
       return new PushMock();
   }

}

export function datepickerFactory(platform: Platform) {
   let vendor = navigator && navigator.vendor;
   //console.log("navigator: ", navigator);
   //return (vendor && vendor.toLowerCase() === "google inc." && (document.URL.includes('https://') || document.URL.includes('http://'))) ? new DatePickerMock() : new DatePicker();

   if (platform.is('cordova')) {
       return new DatePicker();
   }
   else {
       return new DatePickerMock();
   }
}
*/

// #endregion Provider Factories


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    NativeStorage,
    Diagnostic,
    Contacts,
    Camera,
    StatusBar,
    SplashScreen,
    // { provide: Network, useFactory: networkFactory, deps: [Platform] },
    // { provide: StatusBar, useFactory: statusBarFactory, deps: [Platform] },
    // { provide: Diagnostic, useFactory: diagnosticFactory, deps: [Platform] },
    // { provide: Keyboard, useFactory: keyboardFactory, deps: [Platform] },
    // { provide: SplashScreen, useFactory: splashScreenFactory, deps: [Platform] },
    // { provide: Camera, useFactory: cameraFactory, deps: [Platform] },
    // { provide: NativeStorage, useFactory: nativeStorageFactory, deps: [Platform] },
    // { provide: Contacts, useFactory: contactsFactory, deps: [Platform] },
    // { provide: Push, useFactory: pushFactory, deps: [Platform] },
    // { provide: DatePicker, useFactory: datepickerFactory, deps: [Platform] },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
