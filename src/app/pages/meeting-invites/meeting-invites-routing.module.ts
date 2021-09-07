import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeetingInvitesPage } from './meeting-invites.page';

const routes: Routes = [
  {
    path: '',
    component: MeetingInvitesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingInvitesPageRoutingModule {}
