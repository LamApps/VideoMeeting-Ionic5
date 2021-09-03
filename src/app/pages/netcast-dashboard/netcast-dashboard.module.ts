import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastDashboardPageRoutingModule } from './netcast-dashboard-routing.module';

import { NetcastDashboardPage } from './netcast-dashboard.page';

import { PhoneRingerComponent,
  CreateNetcastModalComponent,
  EditNetcastModalComponent,
  PicPreviewComponent,
  ShowFormErrorsComponent
 } from '../../components/index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NetcastDashboardPageRoutingModule
  ],
  declarations: [
    NetcastDashboardPage, 
    PhoneRingerComponent, 
    CreateNetcastModalComponent, 
    EditNetcastModalComponent, 
    PicPreviewComponent,
    ShowFormErrorsComponent
  ]
})
export class NetcastDashboardPageModule {}
