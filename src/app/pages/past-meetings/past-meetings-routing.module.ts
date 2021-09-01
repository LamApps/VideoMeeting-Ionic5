import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PastMeetingsPage } from './past-meetings.page';

const routes: Routes = [
  {
    path: '',
    component: PastMeetingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PastMeetingsPageRoutingModule {}
