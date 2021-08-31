import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetcastDashboardPage } from './netcast-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: NetcastDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetcastDashboardPageRoutingModule {}
