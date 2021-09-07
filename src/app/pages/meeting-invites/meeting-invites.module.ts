import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingInvitesPageRoutingModule } from './meeting-invites-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { MeetingInvitesPage } from './meeting-invites.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingInvitesPageRoutingModule,
    SharedModule
  ],
  declarations: [MeetingInvitesPage],
})
export class MeetingInvitesPageModule {}
