import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastSearchPageRoutingModule } from './netcast-search-routing.module';

import { NetcastSearchPage } from './netcast-search.page';

import { PhoneRingerComponent,
  ShowFormErrorsComponent
 } from '../../components/index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetcastSearchPageRoutingModule
  ],
  declarations: [NetcastSearchPage, PhoneRingerComponent, ShowFormErrorsComponent]
})
export class NetcastSearchPageModule {}
