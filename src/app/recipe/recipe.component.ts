// src/app/recipe/recipe.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRecipe from './recipe.reducer';
import * as recipeActions from './recipe.actions';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { RecipeUnsubscribeService } from './recipe-unsubscribe.service';

@Component({
    selector: 'app-recipe',
    templateUrl: './recipe.component.html',
    styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit, OnDestroy {
    isLoading$: Observable<boolean>; // Observable para mostrar o no el spinner
    /**
     * Constructor de la clase del componente.
     * @param store: estado de la parte recipe.
     * @param unsubscribeService
     */
    constructor(
        private store: Store<fromRecipe.State>,
        private unsubscribeService: RecipeUnsubscribeService
    ) {}
    ngOnInit() {
        // Comprobar si las recetas del store están sicronizadas con Firebase.
        this.store
            .pipe(select(fromRecipe.getIsSynced))
            .pipe(take(1))
            .subscribe((isSynced: boolean) => {
                if (!isSynced) {
                    // Se inicializa el store con los ingredientes de la colección
                    // recipes recuperados de Cloud Firestore.
                    this.store.dispatch(new recipeActions.RecipeStartSyncing());
                }
            });

        // Suscripción a la propiedad isLoading del estado para mostrar el spinner.
        this.isLoading$ = this.store.pipe(select(fromRecipe.getIsLoading));
    }

    /**
     * Al salir del componente, se libera la memoria del state, ya que no se
     * utiliza fuera de este componente.
     */
    ngOnDestroy(): void {
        // Se para la suscripción a Firebase.
        this.unsubscribeService.unsubscribeComponent$.next();
        // Se liberan los datos del store.
        this.store.dispatch(new recipeActions.RecipeStopSyncing());
    }
}
