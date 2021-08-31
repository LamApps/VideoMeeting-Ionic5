import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcasterPageRoutingModule } from './netcaster-routing.module';

import { NetcasterPage } from './netcaster.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetcasterPageRoutingModule
  ],
  declarations: [NetcasterPage]
})
export class NetcasterPageModule {}
