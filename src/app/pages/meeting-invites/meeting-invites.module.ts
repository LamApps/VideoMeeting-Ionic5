import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingInvitesPageRoutingModule } from './meeting-invites-routing.module';

import { MeetingInvitesPage } from './meeting-invites.page';

import { PhoneRingerComponent } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingInvitesPageRoutingModule
  ],
  declarations: [MeetingInvitesPage, PhoneRingerComponent]
})
export class MeetingInvitesPageModule {}
