import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Make sure this is imported

import { DetailsPagePageRoutingModule } from './details-page-routing.module';
import { DetailsPagePage } from './details-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,  // This provides all Ionic components (ion-card, ion-item, etc.)
    DetailsPagePageRoutingModule
  ],
  declarations: [DetailsPagePage]
})
export class DetailsPagePageModule {}