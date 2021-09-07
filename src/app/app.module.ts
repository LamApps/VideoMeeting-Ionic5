import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// import {
//     ShowFormErrorsComponent, 
//     PicPreviewComponent, 
//     PhoneRingerComponent,
//     ContactSearchModalComponent,
//     FormGetInfoComponent,
//     PrivateMessagingComponent,
//     IncomingCallModalComponent,
//     PhoneCallComponent,
//     PhoneLineInvitationModalComponent,
//     PhoneCallActionPopoverComponent,
//     CreateNetcastModalComponent,
//     CreateMeetingModalComponent,
//     EditNetcastModalComponent,
//     CustomerPbxInfoComponent,
//     EditAvatarPopoverComponent,
//     EditContactModalComponent,
//     EditMeetingModalComponent,
//     FormCustomerPbxComponent,
//     MeetingAttendeeComponent,
//     MeetingDetailsComponent,
//     MeetingInviteComponent,
//     MeetingItemComponent,
//     OutgoingCallDialogComponent,
// } from './components/index';


import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';
import { SharedModule } from './shared.module';


@NgModule({
  declarations: [
    AppComponent,
    // ShowFormErrorsComponent, 
    // PicPreviewComponent, 
    // PhoneRingerComponent,
    // ContactSearchModalComponent,
    // FormGetInfoComponent,
    // PrivateMessagingComponent,
    // IncomingCallModalComponent,
    // PhoneCallComponent,
    // PhoneLineInvitationModalComponent,
    // PhoneCallActionPopoverComponent,
    // CreateNetcastModalComponent,
    // CreateMeetingModalComponent,
    // EditNetcastModalComponent,
    // CustomerPbxInfoComponent,
    // EditAvatarPopoverComponent,
    // EditContactModalComponent,
    // EditMeetingModalComponent,
    // FormCustomerPbxComponent,
    // MeetingAttendeeComponent,
    // MeetingDetailsComponent,
    // MeetingInviteComponent,
    // MeetingItemComponent,
    // OutgoingCallDialogComponent,
  ],
  entryComponents: [
    // ShowFormErrorsComponent, 
    // PicPreviewComponent, 
    // PhoneRingerComponent,
    // ContactSearchModalComponent,
    // FormGetInfoComponent,
    // PrivateMessagingComponent,
    // IncomingCallModalComponent,
    // PhoneCallComponent,
    // PhoneLineInvitationModalComponent,
    // PhoneCallActionPopoverComponent,
    // CreateNetcastModalComponent,
    // CreateMeetingModalComponent,
    // EditNetcastModalComponent,
    // CustomerPbxInfoComponent,
    // EditAvatarPopoverComponent,
    // EditContactModalComponent,
    // EditMeetingModalComponent,
    // FormCustomerPbxComponent,
    // MeetingAttendeeComponent,
    // MeetingDetailsComponent,
    // MeetingInviteComponent,
    // MeetingItemComponent,
    // OutgoingCallDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    NativeStorage,
    Diagnostic,
    Contacts,
    Camera,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
