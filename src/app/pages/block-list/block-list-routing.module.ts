import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlockListPage } from './block-list.page';

const routes: Routes = [
  {
    path: '',
    component: BlockListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlockListPageRoutingModule {}
