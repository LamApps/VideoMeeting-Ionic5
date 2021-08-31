import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcasteePageRoutingModule } from './netcastee-routing.module';

import { NetcasteePage } from './netcastee.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetcasteePageRoutingModule
  ],
  declarations: [NetcasteePage]
})
export class NetcasteePageModule {}
