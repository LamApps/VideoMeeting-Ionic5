import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastListPageRoutingModule } from './netcast-list-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { NetcastListPage } from './netcast-list.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NetcastListPageRoutingModule,
    SharedModule
  ],
  declarations: [ NetcastListPage],

})
export class NetcastListPageModule {}
