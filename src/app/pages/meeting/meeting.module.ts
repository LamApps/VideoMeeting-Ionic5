import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingPageRoutingModule } from './meeting-routing.module';

import { MeetingPage } from './meeting.page';

import { FormGetInfoComponent, PrivateMessagingComponent, IncomingCallModalComponent, } from '../../components/index';
import { ContactSearchModalComponent } from '../../components/contact-search-modal/contact-search-modal.component'
import { PhoneCallComponent } from 'src/app/components/phone-call/phone-call.component';
import { PhoneLineInvitationModalComponent } from '../../components/phone-line-invitation-modal/phone-line-invitation-modal.component';
import { ShowFormErrorsComponent } from 'src/app/components/show-form-errors/show-form-errors.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MeetingPageRoutingModule
  ],
  declarations: [
    MeetingPage,
    FormGetInfoComponent,
    PrivateMessagingComponent,
    IncomingCallModalComponent,
    ContactSearchModalComponent,
    PhoneCallComponent,
    PhoneLineInvitationModalComponent,
    ShowFormErrorsComponent
  ]
})
export class MeetingPageModule {}
