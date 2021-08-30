import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddContactsPageRoutingModule } from './add-contacts-routing.module';

import { AddContactsPage } from './add-contacts.page';

import { ShowFormErrorsComponent } from 'src/app/components';
import { PicPreviewComponent } from 'src/app/components';
import { PhoneRingerComponent } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddContactsPageRoutingModule
  ],
  declarations: [AddContactsPage, ShowFormErrorsComponent, PicPreviewComponent, PhoneRingerComponent]
})
export class AddContactsPageModule {}
