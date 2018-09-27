// src/app/recipe/recipe.component.ts
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRecipe from './recipe.reducer';
import * as recipeActions from './recipe.actions';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-recipe',
    templateUrl: './recipe.component.html',
    styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit {
    isLoading$: Observable<boolean>; // Observable para mostrar o no el spinner
    /**
     * Constructor de la clase del componente.
     * @param store: estado de la parte recipe.
     */
    constructor(private store: Store<fromRecipe.State>) {}
    ngOnInit() {
        // Se inicializa el store con los ingredientes de la colección recipes recuperados de Cloud Firestore.
        this.store.dispatch(new recipeActions.RecipeStartSyncing());

        // Suscripción a la propiedad isLoading del estado para mostrar el spinner.
        this.isLoading$ = this.store.pipe(select(fromRecipe.getIsLoading));
    }
}
