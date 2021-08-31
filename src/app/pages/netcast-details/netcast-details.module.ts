import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastDetailsPageRoutingModule } from './netcast-details-routing.module';

import { NetcastDetailsPage } from './netcast-details.page';

import { PhoneRingerComponent } from '../../components/index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetcastDetailsPageRoutingModule
  ],
  declarations: [NetcastDetailsPage, PhoneRingerComponent]
})
export class NetcastDetailsPageModule {}
