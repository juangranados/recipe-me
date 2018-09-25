// src/app/recipe/recipe.component.ts
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRecipe from './recipe.reducer';
import * as recipeActions from './recipe.actions';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { RecipeId } from './recipe.model';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit {
  isLoadingObservable: Observable<Boolean>; // Observable para mostrar o no el spinner
  /**
   * Constructor de la clase del componente.
   * @param store: estado de la parte recipe.
   * @param spinner: spinner para reflejar carga desde Firebase.
   */
  constructor(
    private store: Store<fromRecipe.State>,
    private spinner: NgxSpinnerService
  ) {}
  ngOnInit() {
    // Se inicializa el store con los ingredientes de la colección recipes recuperados de Cloud Firestore.
    this.store.dispatch(new recipeActions.RecipesSync());

    // Suscripción a la propiedad isLoading del estado para mostrar el spinner.
    this.isLoadingObservable = this.store.pipe(select(fromRecipe.getIsLoading));
  }
}
