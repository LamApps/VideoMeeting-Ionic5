import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PastMeetingsPageRoutingModule } from './past-meetings-routing.module';

import { PastMeetingsPage } from './past-meetings.page';
import { PhoneRingerComponent } from 'src/app/components';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PastMeetingsPageRoutingModule
  ],
  declarations: [PastMeetingsPage, PhoneRingerComponent]
})
export class PastMeetingsPageModule {}
