import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanySearchPage } from './company-search.page';

const routes: Routes = [
  {
    path: '',
    component: CompanySearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanySearchPageRoutingModule {}
