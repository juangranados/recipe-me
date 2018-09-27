// src/app/recipe/recipe-list/recipe-item/recipe-item.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { RecipeId } from '../../recipe.model';
import { select, Store } from '@ngrx/store';
import * as fromRecipe from '../../recipe.reducer';
import * as recipeActions from '../../recipe.actions';
import { ActivatedRoute, Router } from '@angular/router';
import {
    CloudFirestoreService,
    States
} from '../../../shared/cloud-firestore.service';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import * as fromAuth from '../../../auth/auth.reducer';

@Component({
    selector: 'app-recipe-item',
    templateUrl: './recipe-item.component.html',
    styleUrls: ['./recipe-item.component.css']
})
export class RecipeItemComponent implements OnInit {
    // Propiedad para almacenar el objeto de tipo receta.
    // No recibe ningún valor inicial, puesto que se lo proporciona otro componente.
    // Mediante el decorador Input se hace visible al resto de componentes para que le envíen el dato.
    // La definición de este objeto RecipeId se encuentra en recipe.model.ts
    @Input()
    recipe: RecipeId;
    cloudFirestorePath: string;

    constructor(
        private store: Store<fromRecipe.State>,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cloudFirestoreService: CloudFirestoreService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        // Se especifica la ruta donde almacenar la receta.
        this.store
            .pipe(select(fromAuth.getUid))
            .subscribe(
                (uid: string) =>
                    (this.cloudFirestorePath = `users/${uid}/recipes`)
            );
    }

    /**
     * Informa al state de que se selecciona una receta
     */
    onSelect() {
        this.store.dispatch(
            new recipeActions.RecipeSelected({ ...this.recipe })
        );
    }
    /**
     * Borra la receta de Cloud Firestore.
     */
    onDelete() {
        // Se abre el cuadro de diálogo pasándole la receta.
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: 'Vas a borrar la receta ' + this.recipe.recipeName
        });
        // Suscripción al observable que devolverá los datos al cerrarse el dialog
        dialogRef.afterClosed().subscribe(
            // En este ejemplo sólo se muestra en consola, aunque se puede ejecutar
            // cualquier lógica al obtener el resultado
            result => {
                if (result) {
                    // Borrar la receta
                    this.cloudFirestoreService.deleteElement(
                        this.recipe.id,
                        this.cloudFirestorePath,
                        States.Recipes
                    );
                    this.router.navigate(['/recipes']);
                }
            }
        );
    }
}
