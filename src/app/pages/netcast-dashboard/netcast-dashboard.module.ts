import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastDashboardPageRoutingModule } from './netcast-dashboard-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { NetcastDashboardPage } from './netcast-dashboard.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NetcastDashboardPageRoutingModule,
    SharedModule
  ],
  declarations: [
    NetcastDashboardPage
  ],

})
export class NetcastDashboardPageModule {}
