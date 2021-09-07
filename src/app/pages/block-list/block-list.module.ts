import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlockListPageRoutingModule } from './block-list-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { BlockListPage } from './block-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlockListPageRoutingModule,
    SharedModule
  ],
  declarations: [BlockListPage],
})
export class BlockListPageModule {}
