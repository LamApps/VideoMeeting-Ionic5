import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhonePageRoutingModule } from './phone-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { PhonePage } from './phone.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PhonePageRoutingModule,
    SharedModule
  ],
  declarations: [ PhonePage ],

})
export class PhonePageModule {}
