import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        ProfileRoutingModule
    ],
    declarations: [ProfileComponent]
})
export class ProfileModule {}
