import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastSearchPageRoutingModule } from './netcast-search-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { NetcastSearchPage } from './netcast-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NetcastSearchPageRoutingModule,
    SharedModule
  ],
  declarations: [NetcastSearchPage ],
})
export class NetcastSearchPageModule {}
