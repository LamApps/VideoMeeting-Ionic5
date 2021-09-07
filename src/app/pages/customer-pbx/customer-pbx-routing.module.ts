import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerPbxPage } from './customer-pbx.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerPbxPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerPbxPageRoutingModule {}
