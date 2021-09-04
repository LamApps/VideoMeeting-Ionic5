import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhonePageRoutingModule } from './phone-routing.module';

import { PhonePage } from './phone.page';

import { ContactSearchModalComponent } from '../../components/contact-search-modal/contact-search-modal.component'
import { PhoneCallComponent } from 'src/app/components/phone-call/phone-call.component';
import { PhoneLineInvitationModalComponent } from '../../components/phone-line-invitation-modal/phone-line-invitation-modal.component'
import { FormGetInfoComponent, PrivateMessagingComponent, IncomingCallModalComponent, } from '../../components/index';
import { ShowFormErrorsComponent } from 'src/app/components/show-form-errors/show-form-errors.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PhonePageRoutingModule
  ],
  declarations: [PhonePage,
    ContactSearchModalComponent,
    PhoneCallComponent,
    PhoneLineInvitationModalComponent,
    FormGetInfoComponent,
    PrivateMessagingComponent,
    IncomingCallModalComponent,
    ShowFormErrorsComponent
  ]
})
export class PhonePageModule {}
