import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingPageRoutingModule } from './meeting-routing.module';

import { MeetingPage } from './meeting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingPageRoutingModule
  ],
  declarations: [MeetingPage]
})
export class MeetingPageModule {}
