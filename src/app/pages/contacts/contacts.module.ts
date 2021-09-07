import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactsPageRoutingModule } from './contacts-routing.module';
import { SharedModule } from 'src/app/shared.module';

import { ContactsPage } from './contacts.page';

import { AddContactsPage } from '../add-contacts/add-contacts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ContactsPageRoutingModule,
    SharedModule
  ],
  declarations: [ContactsPage, AddContactsPage],
})
export class ContactsPageModule {}
