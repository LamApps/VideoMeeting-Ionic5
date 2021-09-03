import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactsPageRoutingModule } from './contacts-routing.module';

import { ContactsPage } from './contacts.page';

import { PhoneRingerComponent } from 'src/app/components';
import { ShowFormErrorsComponent } from 'src/app/components';
import { PicPreviewComponent } from 'src/app/components';

import { AddContactsPage } from '../add-contacts/add-contacts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ContactsPageRoutingModule
  ],
  declarations: [ContactsPage, AddContactsPage, PhoneRingerComponent, ShowFormErrorsComponent, PicPreviewComponent]
})
export class ContactsPageModule {}
