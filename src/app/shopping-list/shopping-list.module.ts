// src/app/shopping-list/shopping-list.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingListComponent } from './shopping-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ShoppingListRoutingModule } from './shopping-list-routing.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ShoppingListEffects } from './shopping-list.effects';
import { shoppingListReducer } from './shopping-list.reducer';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@NgModule({
    imports: [
        ShoppingListRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        MaterialModule, // Angular Material
        FlexLayoutModule, // Angular Flex
        StoreModule.forFeature('shoppingList', shoppingListReducer), // Reducer de shopping-list
        EffectsModule.forFeature([ShoppingListEffects]) // Efectos de shopping-list
    ],
    declarations: [ShoppingListComponent]
})
export class ShoppingListModule {}
