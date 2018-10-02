import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProfileRoutingModule } from './profile-routing.module';
import { StoreModule } from '@ngrx/store';
import { profileReducer } from './profile.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ProfileEffects } from './profile.effects';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        ProfileRoutingModule,
        ReactiveFormsModule, // Formularios reactivos.
        StoreModule.forFeature('profile', profileReducer), // Reducer de recipe.
        EffectsModule.forFeature([ProfileEffects]) // Efectos de recipe.
    ],
    declarations: [ProfileComponent, ProfileViewComponent, ProfileEditComponent]
})
export class ProfileModule {}
