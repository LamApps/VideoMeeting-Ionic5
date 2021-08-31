import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetcastDetailsPage } from './netcast-details.page';

const routes: Routes = [
  {
    path: '',
    component: NetcastDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetcastDetailsPageRoutingModule {}
