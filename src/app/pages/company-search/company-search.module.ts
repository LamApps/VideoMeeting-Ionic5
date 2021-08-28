import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanySearchPageRoutingModule } from './company-search-routing.module';

import { CompanySearchPage } from './company-search.page';

import { PhoneRingerComponent } from 'src/app/components';
import { ShowFormErrorsComponent } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CompanySearchPageRoutingModule
  ],
  declarations: [CompanySearchPage, PhoneRingerComponent, ShowFormErrorsComponent]
})
export class CompanySearchPageModule {}
