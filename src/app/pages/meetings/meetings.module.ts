import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingsPageRoutingModule } from './meetings-routing.module';

import { MeetingsPage } from './meetings.page';

import { PhoneRingerComponent } from 'src/app/components';
import { MeetingItemComponent } from 'src/app/components';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MeetingsPageRoutingModule
  ],
  declarations: [MeetingsPage, PhoneRingerComponent, MeetingItemComponent]
})
export class MeetingsPageModule {}
