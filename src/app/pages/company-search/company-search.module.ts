import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanySearchPageRoutingModule } from './company-search-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { CompanySearchPage } from './company-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CompanySearchPageRoutingModule,
    SharedModule
  ],
  declarations: [CompanySearchPage],
})
export class CompanySearchPageModule {}
