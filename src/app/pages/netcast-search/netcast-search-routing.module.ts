import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetcastSearchPage } from './netcast-search.page';

const routes: Routes = [
  {
    path: '',
    component: NetcastSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetcastSearchPageRoutingModule {}
