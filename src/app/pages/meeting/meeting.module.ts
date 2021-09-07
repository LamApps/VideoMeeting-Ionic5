import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingPageRoutingModule } from './meeting-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { MeetingPage } from './meeting.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MeetingPageRoutingModule,
    SharedModule
  ],
  declarations: [ MeetingPage ],

})
export class MeetingPageModule {}
