import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetcastListPage } from './netcast-list.page';

const routes: Routes = [
  {
    path: '',
    component: NetcastListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetcastListPageRoutingModule {}
