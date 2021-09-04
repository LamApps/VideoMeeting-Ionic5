import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingDashboardPageRoutingModule } from './meeting-dashboard-routing.module';

import { MeetingDashboardPage } from './meeting-dashboard.page';
import { PhoneRingerComponent,
  CreateMeetingModalComponent,
  EditMeetingModalComponent,
  PicPreviewComponent,
  ShowFormErrorsComponent,
  MeetingDetailsComponent
 } from '../../components/index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MeetingDashboardPageRoutingModule
  ],
  declarations: [MeetingDashboardPage, 
    PhoneRingerComponent, 
    PicPreviewComponent, 
    ShowFormErrorsComponent,
    CreateMeetingModalComponent,
    EditMeetingModalComponent,
    MeetingDetailsComponent,
  ]
})
export class MeetingDashboardPageModule {}
