import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerPbxPageRoutingModule } from './customer-pbx-routing.module';

import { CustomerPbxPage } from './customer-pbx.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerPbxPageRoutingModule
  ],
  declarations: [CustomerPbxPage]
})
export class CustomerPbxPageModule {}
