// src/app/recipe/recipe.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeComponent } from './recipe.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipeItemComponent } from './recipe-list/recipe-item/recipe-item.component';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';
import { RecipeRoutingModule } from './recipe-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { recipeReducer } from './recipe.reducer';
import { RecipeEffects } from './recipe.effects';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule, // Directivas de Angular.
    RecipeRoutingModule, // Módulo de rutas para este módulo.
    ReactiveFormsModule, // Formularios reactivos.
    MaterialModule, // Angular Material
    FlexLayoutModule,
    StoreModule.forFeature('recipes', recipeReducer), // Reducer de recipe.
    EffectsModule.forFeature([RecipeEffects]) // Efectos de recipe.
  ],
  declarations: [
    // Componentes que administran las recetas.
    RecipeComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeItemComponent,
    RecipeEditComponent
  ]
})
export class RecipeModule {}
