import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingDashboardPageRoutingModule } from './meeting-dashboard-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { MeetingDashboardPage } from './meeting-dashboard.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MeetingDashboardPageRoutingModule,
    SharedModule
  ],
  declarations: [MeetingDashboardPage ],

})
export class MeetingDashboardPageModule {}
