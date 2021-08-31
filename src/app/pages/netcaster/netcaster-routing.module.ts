import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetcasterPage } from './netcaster.page';

const routes: Routes = [
  {
    path: '',
    component: NetcasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetcasterPageRoutingModule {}
