import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastDetailsPageRoutingModule } from './netcast-details-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { NetcastDetailsPage } from './netcast-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetcastDetailsPageRoutingModule,
    SharedModule
  ],
  declarations: [NetcastDetailsPage],
})
export class NetcastDetailsPageModule {}
