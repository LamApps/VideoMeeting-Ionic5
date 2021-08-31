import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingDashboardPageRoutingModule } from './meeting-dashboard-routing.module';

import { MeetingDashboardPage } from './meeting-dashboard.page';
import { PhoneRingerComponent,
  CreateMeetingModalComponent,
  PicPreviewComponent,
  ShowFormErrorsComponent
 } from '../../components/index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingDashboardPageRoutingModule
  ],
  declarations: [MeetingDashboardPage, 
    PhoneRingerComponent, 
    PicPreviewComponent, 
    ShowFormErrorsComponent,
    CreateMeetingModalComponent,
  ]
})
export class MeetingDashboardPageModule {}
