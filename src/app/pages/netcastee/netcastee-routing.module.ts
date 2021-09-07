import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetcasteePage } from './netcastee.page';

const routes: Routes = [
  {
    path: '',
    component: NetcasteePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetcasteePageRoutingModule {}
