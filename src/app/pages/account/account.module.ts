import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountPageRoutingModule } from './account-routing.module';

import { AccountPage } from './account.page';

import { ShowFormErrorsComponent } from 'src/app/components';
import { PicPreviewComponent } from 'src/app/components';
import { PhoneRingerComponent } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AccountPageRoutingModule
  ],
  declarations: [AccountPage, ShowFormErrorsComponent, PicPreviewComponent, PhoneRingerComponent]
})
export class AccountPageModule {}
