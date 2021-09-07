import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingsPageRoutingModule } from './meetings-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { MeetingsPage } from './meetings.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MeetingsPageRoutingModule,
    SharedModule
  ],
  declarations: [MeetingsPage],
})
export class MeetingsPageModule {}
