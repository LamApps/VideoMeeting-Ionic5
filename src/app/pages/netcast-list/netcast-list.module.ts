import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastListPageRoutingModule } from './netcast-list-routing.module';

import { NetcastListPage } from './netcast-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetcastListPageRoutingModule
  ],
  declarations: [NetcastListPage]
})
export class NetcastListPageModule {}
