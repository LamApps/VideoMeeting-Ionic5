import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NetcastListPageRoutingModule } from './netcast-list-routing.module';

import { NetcastListPage } from './netcast-list.page';

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
    NetcastListPageRoutingModule
  ],
  declarations: [
    NetcastListPage, 
    PhoneRingerComponent, 
    CreateNetcastModalComponent, 
    EditNetcastModalComponent, 
    PicPreviewComponent,
    ShowFormErrorsComponent
  ]
})
export class NetcastListPageModule {}
