import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyProfilePageRoutingModule } from './company-profile-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { CompanyProfilePage } from './company-profile.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompanyProfilePageRoutingModule,
    SharedModule
  ],
  declarations: [CompanyProfilePage],
})
export class CompanyProfilePageModule {}
