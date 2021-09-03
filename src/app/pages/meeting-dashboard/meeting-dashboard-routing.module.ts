import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeetingDashboardPage } from './meeting-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: MeetingDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingDashboardPageRoutingModule {}
