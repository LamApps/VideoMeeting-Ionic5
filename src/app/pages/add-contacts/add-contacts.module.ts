import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddContactsPageRoutingModule } from './add-contacts-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { AddContactsPage } from './add-contacts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddContactsPageRoutingModule,
    SharedModule
  ],
  declarations: [AddContactsPage],
})
export class AddContactsPageModule {}
